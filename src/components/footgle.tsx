import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import catalog from "@/data/catalog.json";
import { CHART_ROWS, SHOTS, type Lang, type Shot } from "@/data/images";
import { highlightRanges, norm, parseQ, rank, type Scored } from "@/lib/footgle-search";

type Doc = {
  id: string;
  title: string;
  site: string;
  abbr: string;
  color: string;
  src: string;
  kind: string;
  status: string;
  url: string;
  date: string;
  year: number;
  pages?: string;
  file?: string;
  size?: string;
  official?: number;
  tags: string;
  snippet: string;
  body: string[];
  points: string[];
  note?: string;
  quote?: { en: string; pt: string };
};

type Tab = "tudo" | "imagens" | "documentos" | "audio" | "linha-do-tempo";
const TABS: Tab[] = ["tudo", "imagens", "documentos", "audio", "linha-do-tempo"];

const DOCS = catalog.DOCS as Doc[];
const TX = catalog.TX as Record<Lang, Record<string, unknown>>;
const EN = catalog.EN as Record<string, Partial<Doc>>;
const TL_PT = catalog.TL_PT as [string, string, string][];
const TL_EN = catalog.TL_EN as [string, string][];
const FAQ_PT = catalog.FAQ_PT as [string, string, string][];
const FAQ_EN = catalog.FAQ_EN as [string, string][];
const SUGG_PT = catalog.SUGG_PT as string[];
const SUGG_EN = catalog.SUGG_EN as string[];
const BRIEF_PT = catalog.BRIEF_PT as string;
const BRIEF_EN = catalog.BRIEF_EN as string;

const NAME: Record<Lang, string> = { en: "Footgle", pt: "Pegadão" };

function t<T>(lang: Lang, key: string): T {
  return TX[lang][key] as T;
}

function viewDoc(d: Doc, lang: Lang): Doc {
  if (lang !== "en") return d;
  const o = EN[d.id];
  return o ? { ...d, ...o, id: d.id, abbr: d.abbr, color: d.color, src: d.src, kind: d.kind, url: d.url, year: d.year, official: d.official, tags: d.tags, quote: d.quote, note: o.note ?? d.note } : d;
}

function crumb(u: string) {
  try {
    const x = new URL(u);
    return [x.hostname.replace(/^www\./, ""), ...x.pathname.split("/").filter(Boolean)].slice(0, 4).join(" › ");
  } catch {
    return u;
  }
}

const SEARCH_ICON = (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M15.5 14h-.8l-.3-.3A6.5 6.5 0 1 0 14 15.5l.3.3v.8l5 5 1.5-1.5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" />
  </svg>
);
const PLAY = (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);
const PAUSE = (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
  </svg>
);
const XI = (
  <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4l5.6 5.6L5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6z" />
  </svg>
);

function Wordmark({ name, en }: { name: string; en: boolean }) {
  const colors = en ? [0, 1, 2, 0, 3, 0, 1] : [0, 1, 2, 0, 3, 1, 0];
  return (
    <span className="wm">
      {[...name].map((c, i) => (
        <span key={i} className={`c${colors[i % 7]}`}>
          {c}
        </span>
      ))}
    </span>
  );
}

function Hi({ text, terms }: { text: string; terms: string[] }) {
  const m = highlightRanges(text, terms);
  if (!m) return <>{text}</>;
  const bits: ReactNode[] = [];
  let p = 0;
  m.forEach(([a, b], i) => {
    if (a > p) bits.push(text.slice(p, a));
    bits.push(<b key={i}>{text.slice(a, b)}</b>);
    p = b;
  });
  if (p < text.length) bits.push(text.slice(p));
  return <>{bits}</>;
}

function Chart({ lang }: { lang: Lang }) {
  return (
    <div className="chart">
      <h3>{lang === "en" ? "Reported footprint length (in)" : "Comprimento de pegadas relatadas (pol)"}</h3>
      {CHART_ROWS.map((r) => (
        <div className="row" key={r.inches + r.label.en}>
          <div>
            <div className="lab">{r.label[lang]}</div>
            <div className={r.on ? "bar on" : "bar"} style={{ width: `${(r.inches / 24) * 100}%` }} />
          </div>
          <div className="n">{r.inches}</div>
        </div>
      ))}
      <p className="note">{lang === "en" ? "Claimed measurements, unverified." : "Medidas alegadas, não verificadas."}</p>
    </div>
  );
}

function ShotVisual({ shot, lang, cover }: { shot: Shot; lang: Lang; cover?: boolean }) {
  if (shot.kind === "chart") return <Chart lang={lang} />;
  return <img src={shot.src} alt={shot.title[lang]} className={cover ? "heroimg" : undefined} />;
}

type Play = {
  queue: string[];
  qi: number;
  sents: string[];
  si: number;
  state: "idle" | "playing" | "paused";
  rate: number;
  id: string | null;
  msg: string;
};

export function Footgle() {
  const [lang, setLang] = useState<Lang>("en");
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const [started, setStarted] = useState(false);
  const [tab, setTab] = useState<Tab>("tudo");
  const [hash, setHash] = useState("");
  const [src, setSrc] = useState("todas");
  const [per, setPer] = useState("todas");
  const [tools, setTools] = useState(false);
  const [lb, setLb] = useState<string | null>(null);
  const [sugOn, setSugOn] = useState(false);
  const [si, setSi] = useState(-1);
  const [play, setPlay] = useState<Play>({ queue: [], qi: 0, sents: [], si: 0, state: "idle", rate: 1, id: null, msg: "" });
  const [cp, setCp] = useState("");
  const langRef = useRef(lang);
  const playRef = useRef(play);
  const gen = useRef(0);
  langRef.current = lang;
  playRef.current = play;

  useEffect(() => {
    try {
      const l = localStorage.getItem("pg-lang");
      if (l === "pt" || l === "en") setLang(l);
      const th = localStorage.getItem("pg-theme");
      if (th === "dark" || th === "light") document.documentElement.dataset.theme = th;
    } catch {
      /* ignore */
    }
    const read = () => setHash(location.hash.slice(1));
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  useEffect(() => {
    if (TABS.includes(hash as Tab)) {
      setTab(hash as Tab);
      setStarted(true);
    } else if (hash.startsWith("doc-") || hash === "sobre") setStarted(true);
  }, [hash]);

  useEffect(() => {
    if (!started) return;
    const id = window.setTimeout(() => setQ(input.trim()), 160);
    return () => window.clearTimeout(id);
  }, [input, started]);

  useEffect(() => {
    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
    document.title = NAME[lang];
  }, [lang]);

  const docOpen = hash.startsWith("doc-") ? DOCS.find((d) => d.id === hash.slice(4)) : undefined;
  const about = hash === "sobre";

  const terms = useMemo(() => parseQ(q), [q]);

  const docIdx = useMemo(() => {
    return DOCS.map((d) => {
      const v = viewDoc(d, lang);
      const scored: Scored & Doc = {
        ...d,
        title: v.title,
        snippet: v.snippet,
        body: v.body,
        site: v.site,
        _t: norm(v.title),
        _g: norm(d.tags),
        _s: norm(v.snippet),
        _b: norm(`${v.body.join(" ")} ${v.site} ${d.file || ""}`),
      };
      return scored;
    });
  }, [lang]);

  const shotIdx = useMemo(() => {
    return SHOTS.map((m) => ({
      ...m,
      official: 0,
      _t: norm(m.title[lang]),
      _g: norm(m.tags),
      _s: norm(m.caption[lang]),
      _b: norm(m.credit[lang]),
    }));
  }, [lang]);

  function go(h: string) {
    if (location.hash === "#" + h) setHash(h);
    else location.hash = h;
  }

  function submit(next?: string) {
    const value = (next ?? input).trim();
    setInput(value);
    setQ(value);
    setStarted(true);
    setSugOn(false);
    setSi(-1);
    go(TABS.includes(tab) ? tab : "tudo");
  }

  function setLanguage(next: Lang) {
    stopAudio();
    setLang(next);
    try {
      localStorage.setItem("pg-lang", next);
    } catch {
      /* ignore */
    }
  }

  function toggleTheme() {
    const cur = document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const n = cur === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = n;
    try {
      localStorage.setItem("pg-theme", n);
    } catch {
      /* ignore */
    }
  }

  function scriptFor(id: string) {
    const L = langRef.current;
    if (id === "briefing") return L === "en" ? BRIEF_EN : BRIEF_PT;
    const d = DOCS.find((x) => x.id === id);
    if (!d) return "";
    const v = viewDoc(d, L);
    return `${v.title}. ${v.body.join(" ")}`;
  }

  function dur(id: string) {
    const words = scriptFor(id).trim().split(/\s+/).length;
    const s = Math.round(words / 2.5);
    return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s`;
  }

  function speakFrom(p: Play) {
    if (p.state !== "playing") return;
    if (p.si >= p.sents.length) {
      if (p.qi + 1 < p.queue.length) {
        const n = loadAt({ ...p, qi: p.qi + 1 });
        setPlay(n);
        speakFrom(n);
      } else stopAudio();
      return;
    }
    const g = gen.current;
    const u = new SpeechSynthesisUtterance(p.sents[p.si]);
    u.lang = langRef.current === "en" ? "en-US" : "pt-BR";
    const voices = speechSynthesis.getVoices();
    const L = u.lang;
    const v = voices.find((x) => x.lang === L) || voices.find((x) => x.lang?.toLowerCase().startsWith(L.slice(0, 2)));
    if (v) u.voice = v;
    u.rate = p.rate;
    u.onend = () => {
      if (g !== gen.current) return;
      const prev = playRef.current;
      if (prev.state !== "playing") return;
      const n = { ...prev, si: prev.si + 1 };
      playRef.current = n;
      setPlay(n);
      speakFrom(n);
    };
    u.onerror = (e) => {
      if (g !== gen.current || e.error === "canceled" || e.error === "interrupted") return;
      stopAudio();
    };
    speechSynthesis.speak(u);
  }

  function loadAt(p: Play): Play {
    const id = p.queue[p.qi];
    const sents = (scriptFor(id).match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [scriptFor(id)]).map((s) => s.trim()).filter(Boolean);
    return { ...p, id, sents, si: 0 };
  }

  function playAudio(id: string, queue?: string[]) {
    if (!("speechSynthesis" in window)) {
      setPlay((p) => ({ ...p, msg: lang === "en" ? "Your browser does not offer voice reading." : "Seu navegador não oferece leitura em voz." }));
      return;
    }
    const cur = playRef.current;
    if (cur.id === id && cur.state === "playing" && !queue) {
      pauseAudio();
      return;
    }
    if (cur.id === id && cur.state === "paused" && !queue) {
      const n = { ...cur, state: "playing" as const, msg: "" };
      setPlay(n);
      speakFrom(n);
      return;
    }
    gen.current++;
    speechSynthesis.cancel();
    const n = loadAt({ ...cur, queue: queue || [id], qi: 0, state: "playing", msg: "", id });
    setPlay(n);
    speakFrom(n);
  }

  function pauseAudio() {
    gen.current++;
    try {
      speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
    setPlay((p) => ({ ...p, state: "paused" }));
  }

  function stopAudio() {
    gen.current++;
    try {
      speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
    setPlay((p) => ({ ...p, state: "idle", id: null, msg: "", si: 0, sents: [] }));
  }

  useEffect(() => () => {
    gen.current++;
    try {
      speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }, []);

  function filt<T extends { src: string; year: number }>(list: T[]) {
    return list.filter(
      (d) =>
        (src === "todas" || d.src === src) &&
        (per === "todas" || (per === "ate1979" ? d.year < 1980 : per === "1980" ? d.year >= 1980 && d.year < 1990 : d.year >= 2000)),
    );
  }

  const rankedDocs = filt(rank(docIdx, terms));
  const rankedShots = rank(shotIdx, terms);
  const suggestions = (() => {
    const all = lang === "en" ? SUGG_EN : SUGG_PT;
    const n = norm(input).trim();
    const words = parseQ(input);
    return (n ? all.filter((s) => norm(s).includes(n) || words.every((x) => norm(s).includes(x))) : all).slice(0, 7);
  })();

  const sec = (0.02 + Math.min(terms.length, 6) * 0.01).toFixed(2);
  const stats =
    lang === "en"
      ? `About ${rankedDocs.length} result${rankedDocs.length === 1 ? "" : "s"} (${sec} seconds)`
      : `Aproximadamente ${rankedDocs.length} resultado${rankedDocs.length === 1 ? "" : "s"} (${sec.replace(".", ",")} segundos)`;

  const limits = (t<string[]>(lang, "abL")).map((line, i) =>
    i === 1
      ? lang === "en"
        ? "Images are archival photographs, scans of public records, and freely licensed pictures. They are not proof the creature exists. Captions say when a photo is not the evidence in that file."
        : "As imagens são fotos de arquivo, digitalizações de registros públicos e fotos com licença livre. Não provam que a criatura existe. A legenda avisa quando a foto não é a evidência daquele arquivo."
      : line,
  );

  function pagesTxt(v: Doc) {
    return v.pages && /^\d+$/.test(v.pages) ? `${v.pages} ${t<string>(lang, "pagesW")}` : "";
  }

  function toolsBar() {
    if (!tools) {
      return (
        <div className="tools">
          <button className="act" type="button" onClick={() => setTools(true)}>
            {t<string>(lang, "tools")}
          </button>
        </div>
      );
    }
    return (
      <div className="tools">
        <button className="act" type="button" onClick={() => setTools(false)}>
          {t<string>(lang, "tools")}
        </button>
        <label>
          {t<string>(lang, "fSource")}{" "}
          <select value={src} onChange={(e) => setSrc(e.target.value)} aria-label={t<string>(lang, "fSource")}>
            <option value="todas">{t<string>(lang, "all")}</option>
            <option value="usfs">{t<string>(lang, "usfs")}</option>
            <option value="fbi">{t<string>(lang, "fbi")}</option>
            <option value="outros">{t<string>(lang, "others")}</option>
          </select>
        </label>
        <label>
          {t<string>(lang, "fPeriod")}{" "}
          <select value={per} onChange={(e) => setPer(e.target.value)} aria-label={t<string>(lang, "fPeriod")}>
            <option value="todas">{t<string>(lang, "anytime")}</option>
            <option value="ate1979">{t<string>(lang, "u79")}</option>
            <option value="1980">{t<string>(lang, "y80")}</option>
            <option value="2000">{t<string>(lang, "y00")}</option>
          </select>
        </label>
      </div>
    );
  }

  function result(d: Doc & Scored) {
    const v = viewDoc(d, lang);
    const chips = [v.status, pagesTxt(v), v.size].filter(Boolean) as string[];
    const on = play.id === d.id && play.state === "playing";
    return (
      <article className="res" key={d.id}>
        <div className="site">
          <span className="fav" style={{ background: d.color }}>
            {d.abbr}
          </span>
          <div>
            <div className="sname">{v.site}</div>
            <div className="surl">{crumb(d.url)}</div>
          </div>
        </div>
        <h3>
          <a href={`#doc-${d.id}`}>
            <Hi text={v.title} terms={terms} />
          </a>
        </h3>
        <p className="snip">
          {v.date ? <span className="dt">{v.date} — </span> : null}
          <Hi text={v.snippet} terms={terms} />
        </p>
        <div className="chips">
          {chips.map((c) => (
            <span className="chip" key={c}>
              {c}
            </span>
          ))}
          <a className="act" href={`#doc-${d.id}`}>
            {t<string>(lang, "read")}
          </a>
          <button className="act" type="button" onClick={() => playAudio(d.id)}>
            {on ? PAUSE : PLAY} {on ? t<string>(lang, "pauseL") : t<string>(lang, "listen")}
          </button>
          <a className="act" href={d.url} target="_blank" rel="noopener noreferrer">
            {t<string>(lang, "original")}
          </a>
        </div>
      </article>
    );
  }

  const faq = lang === "en" ? FAQ_EN.map((r, i) => [r[0], r[1], FAQ_PT[i][2]] as const) : FAQ_PT;
  const tl = lang === "en" ? TL_PT.map((r, i) => [TL_EN[i][0], TL_EN[i][1], r[2]] as const) : TL_PT;
  const kpRows = t<[string, string][]>(lang, "kp");

  function shotButton(m: Shot & Scored, frame: boolean) {
    return (
      <button type="button" key={m.id} data-act="img" onClick={() => setLb(m.id)} aria-label={m.title[lang]}>
        {frame ? (
          <span className="frame">
            <ShotVisual shot={m} lang={lang} />
          </span>
        ) : (
          <ShotVisual shot={m} lang={lang} />
        )}
      </button>
    );
  }

  let col: React.ReactNode = null;
  const two = tab === "tudo";
  if (tab === "tudo") {
    const shots = rankedShots.filter((m) => m.kind !== "chart").slice(0, 8);
    col = (
      <>
        {toolsBar()}
        <div className="stats">{stats}</div>
        {rankedDocs.length === 0 ? (
          <div className="empty">
            {lang === "en" ? (
              <>
                No results for <b>{q}</b>. Try “footprints”, “FBI”, “Montana” or “hair”.
              </>
            ) : (
              <>
                Nenhum resultado para <b>{q}</b>. Tente “pegada”, “FBI”, “Montana” ou “pelo”.
              </>
            )}
          </div>
        ) : null}
        {rankedDocs.map((d, i) => (
          <div key={d.id}>
            {result(d)}
            {i === 1 && shots.length ? (
              <div className="block">
                <h4>{t<string>(lang, "imgBlock")}</h4>
                <div className="strip">{shots.map((m) => shotButton(m, true))}</div>
                <button className="more" type="button" onClick={() => go("imagens")}>
                  {t<string>(lang, "seeAll")}
                </button>
              </div>
            ) : null}
            {i === 2 || (rankedDocs.length < 3 && i === rankedDocs.length - 1) ? (
              <div className="block">
                <h4>{t<string>(lang, "paa")}</h4>
                {faq.map((item) => (
                  <details key={item[0]}>
                    <summary>{item[0]}</summary>
                    <p>
                      {item[1]} <a href={`#doc-${item[2]}`}>{t<string>(lang, "seeFile")}</a>
                    </p>
                  </details>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </>
    );
  } else if (tab === "imagens") {
    col = (
      <>
        <div className="stats">
          {lang === "en"
            ? `${rankedShots.length} images · archival photos and public-record scans, not proof the creature exists`
            : `${rankedShots.length} imagens · fotos de arquivo e digitalizações públicas, não são prova de que a criatura existe`}
        </div>
        {rankedShots.length ? (
          <div className="grid">
            {rankedShots.map((m) => (
              <figure key={m.id}>
                <button type="button" onClick={() => setLb(m.id)} aria-label={m.title[lang]}>
                  <span className={m.kind === "chart" ? "frame chartframe" : "frame"}>
                    <ShotVisual shot={m} lang={lang} />
                  </span>
                </button>
                <figcaption>
                  <b>{m.title[lang]}</b>
                  {m.caption[lang]}
                  <span className="credit">{m.credit[lang]}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="empty">
            {lang === "en" ? (
              <>
                No images for <b>{q}</b>.
              </>
            ) : (
              <>
                Nenhuma imagem para <b>{q}</b>.
              </>
            )}
          </div>
        )}
      </>
    );
  } else if (tab === "documentos") {
    const rs = filt(rank(docIdx.filter((d) => d.kind === "doc" || d.kind === "archive"), terms));
    col = (
      <>
        {toolsBar()}
        <div className="stats">
          {lang === "en"
            ? `${rs.length} documents with summaries, audio and a link to the original`
            : `${rs.length} documentos com texto resumido, áudio e link para o original`}
        </div>
        {rs.length ? (
          rs.map((d) => {
            const v = viewDoc(d, lang);
            const on = play.id === d.id && play.state === "playing";
            return (
              <div className="dcard" key={d.id}>
                <div className="pdf">PDF</div>
                <div>
                  <h3>
                    <a href={`#doc-${d.id}`}>
                      <Hi text={v.title} terms={terms} />
                    </a>
                  </h3>
                  <div className="fn">
                    {d.file}
                    {v.size ? ` · ${v.size}` : ""}
                    {v.pages && /^\d+$/.test(v.pages) ? ` · ${v.pages} ${t<string>(lang, "pagesShort")}` : ""}
                  </div>
                  <div className="snip">
                    <Hi text={v.snippet} terms={terms} />
                  </div>
                  <div className="chips">
                    <span className="chip">{v.status}</span>
                    <span className="chip">{v.date}</span>
                  </div>
                  <div className="chips">
                    <a className="act" href={`#doc-${d.id}`}>
                      {t<string>(lang, "read")}
                    </a>
                    <button className="act" type="button" onClick={() => playAudio(d.id)}>
                      {on ? PAUSE : PLAY} {on ? t<string>(lang, "pauseL") : t<string>(lang, "listen")}
                    </button>
                    <a className="act" href={d.url} target="_blank" rel="noopener noreferrer">
                      {t<string>(lang, "openOrig")}
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty">{t<string>(lang, "noDoc")}</div>
        )}
      </>
    );
  } else if (tab === "audio") {
    const rs = filt(rank(docIdx.filter((d) => d.kind !== "news"), terms));
    const queue = ["briefing", ...rs.map((d) => d.id)];
    col = (
      <>
        <div className="stats">{t<string>(lang, "audStats")}</div>
        <div className="chips" style={{ marginBottom: 12 }}>
          <button className="act on" type="button" onClick={() => playAudio("briefing", queue)}>
            {PLAY} {t<string>(lang, "playAll")}
          </button>
        </div>
        <div className="arow">
          <button className="pb" type="button" aria-label={t<string>(lang, "briefT")} onClick={() => playAudio("briefing")}>
            {play.id === "briefing" && play.state === "playing" ? PAUSE : PLAY}
          </button>
          <div className="t">
            <b>{t<string>(lang, "briefT")}</b>
            <span>
              {t<string>(lang, "briefS")} · {dur("briefing")}
            </span>
          </div>
        </div>
        {rs.map((d) => {
          const v = viewDoc(d, lang);
          const on = play.id === d.id && play.state === "playing";
          return (
            <div className="arow" key={d.id}>
              <button className="pb" type="button" aria-label={v.title} onClick={() => playAudio(d.id)}>
                {on ? PAUSE : PLAY}
              </button>
              <div className="t">
                <b>
                  <Hi text={v.title} terms={terms} />
                </b>
                <span>
                  {v.site} · {dur(d.id)}
                </span>
              </div>
            </div>
          );
        })}
      </>
    );
  } else {
    col = (
      <>
        <div className="stats">{t<string>(lang, "tlStats")}</div>
        <ol className="tl">
          {tl.map((x) => (
            <li key={x[0] + x[2]}>
              <div className="d">{x[0]}</div>
              <button type="button" onClick={() => go("doc-" + x[2])}>
                {x[1]}
              </button>
            </li>
          ))}
        </ol>
      </>
    );
  }

  const lbShot = SHOTS.find((m) => m.id === lb) || null;
  const related = (id: string) => SHOTS.filter((m) => m.docs.includes(id));

  function drawerDoc(d0: Doc) {
    const d = viewDoc(d0, lang);
    const rows: [string, string][] = [
      [t<string>(lang, "rSource"), d.site],
      [t<string>(lang, "rType"), d.status],
      [t<string>(lang, "rDate"), d.date],
    ];
    if (d.pages) rows.push([t<string>(lang, "rPages"), d.pages]);
    if (d.file) rows.push([t<string>(lang, "rFile"), d.file]);
    if (d.size) rows.push([t<string>(lang, "rSize"), d.size]);
    const imgs = related(d0.id);
    const on = play.id === d0.id && play.state === "playing";
    return (
      <>
        <div className="dh">
          <span className="chip">{d.status}</span>
          <button className="iconbtn" type="button" aria-label={t<string>(lang, "close")} onClick={() => go(tab)}>
            {XI}
          </button>
        </div>
        <div className="db">
          <div className="sname" style={{ color: "var(--muted)" }}>
            {d.site}
          </div>
          <h2>{d.title}</h2>
          <div className="chips" style={{ margin: "0 0 16px" }}>
            <button className="act on" type="button" onClick={() => playAudio(d0.id)}>
              {on ? PAUSE : PLAY} {on ? t<string>(lang, "pauseL") : t<string>(lang, "listen")} ({dur(d0.id)})
            </button>
            <a className="act" href={d0.url} target="_blank" rel="noopener noreferrer">
              {t<string>(lang, "openOrig")}
            </a>
            {d0.id === "fbi-vault" ? (
              <a className="act" href="/docs/fbi-bigfoot.pdf" target="_blank" rel="noopener noreferrer">
                PDF
              </a>
            ) : null}
          </div>
          {d.body.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
          {d.quote ? (
            <blockquote>
              “{d.quote.en}”
              <small>
                {lang === "pt" ? `${d.quote.pt} (` : "("}
                {t<string>(lang, "quoteNote")})
              </small>
            </blockquote>
          ) : null}
          <h5>{t<string>(lang, "kpoints")}</h5>
          <ul>
            {d.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          {d.note ? <div className="note">{d.note}</div> : null}
          <h5>{t<string>(lang, "ficha")}</h5>
          <table>
            <tbody>
              {rows.map((r) => (
                <tr key={r[0]}>
                  <td>{r[0]}</td>
                  <td>{r[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {imgs.length ? (
            <>
              <h5>{t<string>(lang, "relImgs")}</h5>
              <div className="rel">
                {imgs.map((m) => (
                  <button type="button" key={m.id} onClick={() => setLb(m.id)} aria-label={m.title[lang]}>
                    <span className="frame">{m.kind === "chart" ? <Chart lang={lang} /> : <img src={m.src} alt="" />}</span>
                  </button>
                ))}
              </div>
            </>
          ) : null}
          <div className="note" style={{ marginTop: 18 }}>
            {t<string>(lang, "disc")}
          </div>
        </div>
      </>
    );
  }

  async function copyJson() {
    const txt = JSON.stringify(
      DOCS.map((d) => viewDoc(d, lang)),
      null,
      1,
    );
    try {
      await navigator.clipboard.writeText(txt);
      setCp(t<string>(lang, "copied"));
    } catch {
      setCp(t<string>(lang, "copyFail"));
    }
  }

  const searchBox = (
    <div className={`sbwrap${sugOn && suggestions.length ? " open" : ""}`}>
      <form
        className={`sb${input ? " has" : ""}`}
        role="search"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {SEARCH_ICON}
        <input
          id="q"
          value={input}
          placeholder={t<string>(lang, "ph")}
          aria-label={t<string>(lang, "search")}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => {
            setInput(e.target.value);
            setSi(-1);
            setSugOn(true);
          }}
          onFocus={() => setSugOn(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              setSugOn(true);
              const dir = e.key === "ArrowDown" ? 1 : -1;
              const n = suggestions.length;
              if (!n) return;
              const next = (si + dir + n) % n;
              setSi(next);
              setInput(suggestions[next]);
            } else if (e.key === "Escape") setSugOn(false);
          }}
        />
        <button
          type="button"
          className="clr"
          aria-label={t<string>(lang, "clear")}
          onClick={() => {
            setInput("");
            if (started) setQ("");
          }}
        >
          {XI}
        </button>
      </form>
      <ul className="sug" role="listbox">
        {suggestions.map((s, i) => (
          <li
            key={s}
            role="option"
            className={i === si ? "on" : ""}
            onMouseDown={(e) => {
              e.preventDefault();
              submit(s);
            }}
          >
            {SEARCH_ICON}
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const open = Boolean(docOpen || about);
  const playing = play.state !== "idle";
  const titleNow =
    play.id === "briefing"
      ? t<string>(lang, "briefT")
      : play.id
        ? viewDoc(DOCS.find((d) => d.id === play.id) || DOCS[0], lang).title
        : "";

  return (
    <>
      <div className={started ? "shell" : "shell home"} onMouseDown={() => setSugOn(false)}>
        <header className="topbar">
          <div className="gut">
            <button
              className="logo"
              type="button"
              aria-label={NAME[lang]}
              onClick={() => {
                setStarted(false);
                setInput("");
                setQ("");
                history.replaceState(null, "", location.pathname + location.search);
                setHash("");
              }}
            >
              <img className="fi" src="/images/logo-foot.png" alt="" />
              <Wordmark name={NAME[lang]} en={lang === "en"} />
            </button>
            <div style={{ flex: 1, minWidth: 230, maxWidth: 692, display: "flex" }}>{started ? searchBox : null}</div>
            <button className="iconbtn" type="button" aria-label={t<string>(lang, "theme")} onClick={toggleTheme}>
              <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3a9 9 0 1 0 9 9c0-.5 0-.9-.1-1.4A5.5 5.5 0 0 1 13.4 3.1 9 9 0 0 0 12 3z" />
              </svg>
            </button>
          </div>
        </header>
        <nav className="tabs" aria-label={lang === "en" ? "Search types" : "Tipos de busca"}>
          <div className="gut">
            {(
              [
                ["tudo", "tab_tudo"],
                ["imagens", "tab_imagens"],
                ["documentos", "tab_documentos"],
                ["audio", "tab_audio"],
                ["linha-do-tempo", "tab_linha-do-tempo"],
              ] as const
            ).map(([id, key]) => (
              <button key={id} type="button" className={tab === id ? "on" : ""} onClick={() => go(id)}>
                <span>{t<string>(lang, key)}</span>
              </button>
            ))}
          </div>
        </nav>
        <div className="shellmain">
          <section className="homebox gut">
            <div className="logo big" aria-hidden="true">
              <img className="fi big" src="/images/logo-foot.png" alt="" />
              <Wordmark name={NAME[lang]} en={lang === "en"} />
            </div>
            <div className="tagline">{t<string>(lang, "tagline")}</div>
            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>{started ? null : searchBox}</div>
            <div className="btns">
              <button className="btn pri" type="button" onClick={() => submit()}>
                {t<string>(lang, "btnSearch")}
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  const o = DOCS.filter((d) => d.official);
                  const pick = o[Math.floor(Math.random() * o.length)];
                  setStarted(true);
                  go("doc-" + pick.id);
                }}
              >
                {t<string>(lang, "lucky")}
              </button>
            </div>
            <div className="hint">
              <span>{t<string>(lang, "try")}</span>
              {t<[string, string][]>(lang, "chips").map((c) => (
                <button
                  key={c[0]}
                  type="button"
                  onClick={() => {
                    setTab("tudo");
                    submit(c[0]);
                  }}
                >
                  {c[1]}
                </button>
              ))}
            </div>
            <div className="langrow">
              {t<string>(lang, "langOffer")}{" "}
              <button type="button" onClick={() => setLanguage(lang === "en" ? "pt" : "en")}>
                {t<string>(lang, "langBtn")}
              </button>
            </div>
          </section>
          <main className={`serp gut${two ? " two" : ""}`}>
            <div className="col2">
              {two ? (
                <aside className="kp">
                  <img className="heroimg" src="/images/krantz-1982.jpg" alt={t<string>(lang, "kpT")} />
                  <div className="in">
                    <h2>{t<string>(lang, "kpT")}</h2>
                    <div className="sub">{t<string>(lang, "kpSub")}</div>
                    <div>{t<string>(lang, "kpD")}</div>
                    <dl>
                      {kpRows.map((x) => (
                        <span key={x[0]} style={{ display: "contents" }}>
                          <dt>{x[0]}</dt>
                          <dd>{x[1]}</dd>
                        </span>
                      ))}
                    </dl>
                  </div>
                </aside>
              ) : null}
            </div>
            <div className="col1" style={tab === "imagens" ? { maxWidth: "none" } : undefined}>
              {col}
            </div>
          </main>
        </div>
        <footer className="foot">
          <div className="gut">
            <span>{t<string>(lang, "footL")}</span>
            <span>
              <a href="#sobre">{t<string>(lang, "about")}</a>
              {" · "}
              <button type="button" onClick={toggleTheme}>
                {t<string>(lang, "themeW")}
              </button>
              {" · "}
              <button type="button" onClick={() => setLanguage(lang === "en" ? "pt" : "en")}>
                {t<string>(lang, "langBtn")}
              </button>
              {" · "}
              {t<string>(lang, "notAff")}
            </span>
          </div>
        </footer>
      </div>

      <div className={`veil${open ? " on" : ""}`} onClick={() => go(tab)} />
      <aside className={`drawer${open ? " on" : ""}`} aria-hidden={!open}>
        {docOpen ? drawerDoc(docOpen) : null}
        {about ? (
          <>
            <div className="dh">
              <b>{t<string>(lang, "abT")}</b>
              <button className="iconbtn" type="button" aria-label={t<string>(lang, "close")} onClick={() => go(tab)}>
                {XI}
              </button>
            </div>
            <div className="db">
              <h2>{NAME[lang]}</h2>
              <p>{t<string>(lang, "abIntro")}</p>
              <h5>{t<string>(lang, "abH1")}</h5>
              <p>{t<string>(lang, "abP1")}</p>
              <div className="chips">
                <button className="act" type="button" onClick={() => void copyJson()}>
                  {t<string>(lang, "copyJ")}
                </button>
                {cp ? <span className="chip">{cp}</span> : null}
              </div>
              <h5>{t<string>(lang, "abH2")}</h5>
              <ul>
                {limits.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <h5>{lang === "en" ? "Picture credits" : "Créditos das imagens"}</h5>
              <ul>
                {SHOTS.filter((s) => s.kind !== "chart").map((s) => (
                  <li key={s.id}>
                    {s.title[lang]} — {s.credit[lang]}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : null}
      </aside>

      <div
        className={`lb${lbShot ? " on" : ""}`}
        onClick={() => setLb(null)}
        role="dialog"
        aria-modal="true"
        aria-label={lbShot ? lbShot.title[lang] : t<string>(lang, "closeImg")}
      >
        {lbShot ? (
          <div className="card" onClick={(e) => e.stopPropagation()}>
            <div className="row">
              <b>{lbShot.title[lang]}</b>
              <button className="iconbtn" type="button" aria-label={t<string>(lang, "closeImg")} onClick={() => setLb(null)}>
                {XI}
              </button>
            </div>
            {lbShot.kind === "chart" ? <Chart lang={lang} /> : <img className="shot" src={lbShot.src} alt={lbShot.title[lang]} />}
            <p style={{ color: "var(--muted)", margin: "10px 0 8px" }}>
              {lbShot.caption[lang]} <span className="credit">{lbShot.credit[lang]}</span>
            </p>
            <div className="chips">
              {lbShot.docs.map((id) => {
                const d = viewDoc(DOCS.find((x) => x.id === id)!, lang);
                return (
                  <button
                    className="act"
                    type="button"
                    key={id}
                    onClick={() => {
                      setLb(null);
                      go("doc-" + id);
                    }}
                  >
                    {t<string>(lang, "seeF")}
                    {d.title.slice(0, 46)}…
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div className={`player${playing || play.msg ? " on" : ""}`} role="region" aria-label={t<string>(lang, "playing")}>
        <div className="bar">
          <i style={{ width: play.sents.length ? `${(play.si / play.sents.length) * 100}%` : "0" }} />
        </div>
        <div className="gut">
          <button
            className="pb"
            type="button"
            aria-label={t<string>(lang, "ptoggle")}
            onClick={() => {
              if (play.state === "playing") pauseAudio();
              else if (play.state === "paused") playAudio(play.id || "briefing");
            }}
          >
            {play.state === "playing" ? PAUSE : PLAY}
          </button>
          <div className="nm">
            <b>{titleNow}</b>
            <span>
              {playing
                ? `${play.state === "playing" ? t<string>(lang, "playing") : t<string>(lang, "paused")} · ${
                    lang === "en"
                      ? `part ${Math.min(play.si + 1, play.sents.length)} of ${play.sents.length}`
                      : `trecho ${Math.min(play.si + 1, play.sents.length)} de ${play.sents.length}`
                  }${play.queue.length > 1 ? (lang === "en" ? ` · track ${play.qi + 1} of ${play.queue.length}` : ` · faixa ${play.qi + 1} de ${play.queue.length}`) : ""}`
                : play.msg}
            </span>
          </div>
          <label className="chip" htmlFor="prate">
            {t<string>(lang, "speed")}
          </label>
          <select
            id="prate"
            value={String(play.rate)}
            onChange={(e) => {
              const rate = Number(e.target.value);
              setPlay((p) => ({ ...p, rate }));
              playRef.current = { ...playRef.current, rate };
              if (playRef.current.state === "playing") {
                gen.current++;
                speechSynthesis.cancel();
                speakFrom({ ...playRef.current, rate });
              }
            }}
          >
            <option value="0.85">0.85×</option>
            <option value="1">1×</option>
            <option value="1.2">1.2×</option>
            <option value="1.5">1.5×</option>
          </select>
          <button className="iconbtn" type="button" aria-label={t<string>(lang, "pstop")} onClick={stopAudio}>
            <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6h12v12H6z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
