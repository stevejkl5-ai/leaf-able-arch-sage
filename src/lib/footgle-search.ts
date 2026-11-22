export type Scored = {
  id: string;
  official?: number;
  _t: string;
  _g: string;
  _s: string;
  _b: string;
};

const GROUPS = [
  ["bigfoot", "sasquatch", "pe grande", "squatch"],
  ["pegada", "pegadas", "footprint", "footprints", "track", "tracks", "rastro", "rastros", "print", "prints"],
  ["cabelo", "cabelos", "pelo", "pelos", "hair", "hairs", "fur"],
  ["veado", "veados", "deer", "cervo", "cervideo", "cervídeo"],
  ["floresta", "florestas", "forest"],
  ["armadilha", "trap", "jaula", "cage"],
  ["alce", "elk"],
  ["molde", "moldes", "gesso", "cast", "casts", "plaster"],
  ["farsa", "hoax", "fraude", "fake"],
  ["foto", "fotos", "imagem", "imagens", "photo", "photos", "picture"],
  ["carta", "letter", "memo", "memorando"],
];

const STOP = new Set([
  "de", "do", "da", "dos", "das", "em", "no", "na", "um", "uma", "por", "com", "para", "que", "os", "as", "ao", "e",
  "the", "of", "a", "an", "in", "on", "to", "and", "for", "is", "was", "did", "what",
]);

export const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const expand = (x: string) => GROUPS.find((g) => g.includes(x)) || [x];

export function parseQ(q: string) {
  return norm(q)
    .replace(/pe[- ]grande/g, "bigfoot")
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w) && (w.length > 1 || /\d/.test(w)));
}

function score(d: Scored, terms: string[]) {
  let s = 0;
  let hit = 0;
  for (const x of terms) {
    let b = 0;
    for (const v of expand(x)) {
      if (d._t.includes(v)) b = Math.max(b, 6);
      else if (d._g.includes(v)) b = Math.max(b, 4);
      else if (d._s.includes(v)) b = Math.max(b, 3);
      else if (d._b.includes(v)) b = Math.max(b, 1);
    }
    if (b) {
      hit++;
      s += b;
    }
  }
  return { s, hit };
}

export function rank<T extends Scored>(list: T[], terms: string[]) {
  if (!terms.length) return list.slice();
  const r = list.map((d) => ({ d, ...score(d, terms) }));
  let all = r.filter((x) => x.hit === terms.length);
  if (!all.length) all = r.filter((x) => x.hit > 0);
  return all
    .sort((a, b) => b.s + (b.d.official ? 2 : 0) - (a.s + (a.d.official ? 2 : 0)))
    .map((x) => x.d);
}

export function highlightRanges(text: string, terms: string[]) {
  const vs = [...new Set(terms.flatMap(expand))].filter((x) => x.length > 1);
  const n = norm(text);
  if (!vs.length || n.length !== text.length) return null;
  const rg: [number, number][] = [];
  for (const x of vs) {
    let i = 0;
    while ((i = n.indexOf(x, i)) > -1) {
      rg.push([i, i + x.length]);
      i += x.length;
    }
  }
  if (!rg.length) return null;
  rg.sort((a, b) => a[0] - b[0]);
  const m: [number, number][] = [];
  for (const r of rg) {
    const l = m[m.length - 1];
    if (l && r[0] <= l[1]) l[1] = Math.max(l[1], r[1]);
    else m.push([r[0], r[1]]);
  }
  return m;
}
