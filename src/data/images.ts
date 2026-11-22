export type Lang = "en" | "pt";

export type Shot = {
  id: string;
  src?: string;
  kind: "photo" | "record" | "chart";
  docs: string[];
  tags: string;
  title: Record<Lang, string>;
  caption: Record<Lang, string>;
  credit: Record<Lang, string>;
};

/** Archival and freely licensed images. Captions say what each picture actually is. */
export const SHOTS: Shot[] = [
  {
    id: "im-krantz-1982",
    src: "/images/krantz-1982.jpg",
    kind: "photo",
    docs: ["usfs-umatilla-1982"],
    tags: "pegada pegadas footprint cast molde gesso plaster krantz 1982 bigfoot sasquatch tamanho",
    title: { en: "Krantz with a footprint cast, 1982", pt: "Krantz com um molde de pegada, 1982" },
    caption: {
      en: "Anthropologist Grover Krantz holds a plaster cast of an alleged Bigfoot print. This is not the Umatilla cast from the 1982 Forest Service memo. Those casts are in the PDF, not in this news photo.",
      pt: "O antropólogo Grover Krantz segura um molde de gesso de uma suposta pegada do Pé Grande. Não é o molde da Umatilla do memorando de 1982. Esses moldes estão no PDF, não nesta foto de jornal.",
    },
    credit: {
      en: "News photo, 1982. Public domain in the U.S. (published without a copyright notice).",
      pt: "Foto de jornal, 1982. Domínio público nos EUA (publicada sem aviso de copyright).",
    },
  },
  {
    id: "im-krantz-line",
    src: "/images/krantz-line.jpg",
    kind: "photo",
    docs: ["usfs-umatilla-1982"],
    tags: "moldes gesso plaster casts pegadas footprints krantz alunos 1977 classroom",
    title: { en: "A table of alleged footprint casts, 1977", pt: "Uma mesa de moldes de pegadas, 1977" },
    caption: {
      en: "Krantz shows students several plaster casts said to be Bigfoot tracks, April 1977. Reported casts, not a verified species.",
      pt: "Krantz mostra a alunos vários moldes de gesso atribuídos a rastros do Pé Grande, abril de 1977. Medidas alegadas, sem espécie verificada.",
    },
    credit: {
      en: "Alan King, News Journal, April 9, 1977. Public domain in the U.S.",
      pt: "Alan King, News Journal, 9 de abril de 1977. Domínio público nos EUA.",
    },
  },
  {
    id: "im-krantz-1974",
    src: "/images/krantz-1974.jpg",
    kind: "photo",
    docs: ["usfs-umatilla-1982"],
    tags: "krantz 1974 molde cast pegada footprint apresentação plaster",
    title: { en: "Krantz presents a cast, 1974", pt: "Krantz apresenta um molde, 1974" },
    caption: {
      en: "Grover Krantz with a cast he argued was too detailed to be a simple fake. Other scientists were not convinced.",
      pt: "Grover Krantz com um molde que ele dizia ter detalhe demais para ser uma farsa simples. Outros cientistas não se convenceram.",
    },
    credit: {
      en: "News photograph, October 22, 1974. Public domain in the U.S.",
      pt: "Foto de jornal, 22 de outubro de 1974. Domínio público nos EUA.",
    },
  },
  {
    id: "im-exhibit",
    src: "/images/exhibit.jpg",
    kind: "photo",
    docs: ["rogue-trap"],
    tags: "museu museum boring oregon pegadas footprints casts exposição exhibit sasquatch center",
    title: { en: "Footprint casts on display, Boring, Oregon", pt: "Moldes de pegadas em exposição, Boring, Oregon" },
    caption: {
      en: "Casts at the North American Bigfoot Center in 2025, including prints the signs date to Gray’s Harbor County, Washington, 1982. A museum display, not a Forest Service evidence photo.",
      pt: "Moldes no North American Bigfoot Center em 2025, inclusive pegadas que os painéis datam do condado de Grays Harbor, Washington, 1982. Exposição de museu, não foto de evidência do Serviço Florestal.",
    },
    credit: {
      en: "Fred Cherrygarden, 2025. CC BY-SA 4.0.",
      pt: "Fred Cherrygarden, 2025. CC BY-SA 4.0.",
    },
  },
  {
    id: "im-trap",
    src: "/images/trap.jpg",
    kind: "photo",
    docs: ["rogue-trap"],
    tags: "armadilha trap jaula rogue river oregon collings applegate cage bigfoot",
    title: { en: "The Rogue River Bigfoot trap", pt: "A armadilha do Pé Grande em Rogue River" },
    caption: {
      en: "The wooden cage on the Collings Mountain trail, Oregon. It never caught anything and was abandoned in the early 1980s.",
      pt: "A jaula de madeira na trilha Collings Mountain, Oregon. Não capturou nada e foi abandonada no início dos anos 1980.",
    },
    credit: {
      en: "Mario Vaden, 2006. Released into the public domain.",
      pt: "Mario Vaden, 2006. Liberada em domínio público.",
    },
  },
  {
    id: "im-hair",
    src: "/images/fbi-hair-ruler.jpg",
    kind: "record",
    docs: ["fbi-vault", "blackvault-fbi"],
    tags: "pelo cabelo hair fbi amostra régua ruler pele skin byrne 1976 1977 veado deer",
    title: { en: "The hair sample the FBI tested", pt: "A amostra de pelo que o FBI examinou" },
    caption: {
      en: "About 15 hairs on a bit of skin, photographed in the FBI file next to a metric ruler. In February 1977 the lab said they were from the deer family.",
      pt: "Cerca de 15 fios num pedaço de pele, fotografados no arquivo do FBI ao lado de uma régua métrica. Em fevereiro de 1977 o laboratório disse que eram de cervídeo.",
    },
    credit: {
      en: "FBI laboratory photograph from the Bigfoot file. U.S. government work, public domain.",
      pt: "Foto do laboratório do FBI no arquivo do Pé Grande. Obra do governo dos EUA, domínio público.",
    },
  },
  {
    id: "im-fbi-deer",
    src: "/images/fbi-memo-feb15.jpg",
    kind: "record",
    docs: ["fbi-vault", "blackvault-fbi"],
    tags: "fbi cochran deer veado cervo memorandum 1977 conclusão conclusion hair pelo",
    title: { en: "“Hair is of the deer family”", pt: "“O pelo é da família dos cervos”" },
    caption: {
      en: "Internal FBI memo, February 15, 1977, telling Portland the hairs and tissue from Peter Byrne were of deer family origin. The full line is in the scan.",
      pt: "Memorando interno do FBI, 15 de fevereiro de 1977, avisando Portland que os pelos e o tecido enviados por Peter Byrne eram de cervídeo. A frase está na digitalização.",
    },
    credit: {
      en: "FBI memo, February 15, 1977. Public domain. Page from the Vault PDF.",
      pt: "Memorando do FBI, 15 de fevereiro de 1977. Domínio público. Página do PDF do Vault.",
    },
  },
  {
    id: "im-fbi-byrne",
    src: "/images/fbi-byrne-nov.jpg",
    kind: "record",
    docs: ["fbi-vault"],
    tags: "byrne carta letter fbi 1976 the dalles oregon amostra hair request",
    title: { en: "Peter Byrne’s letter to the FBI", pt: "A carta de Peter Byrne ao FBI" },
    caption: {
      en: "November 26, 1976. Byrne, of the Bigfoot Information Center in The Dalles, Oregon, asks the FBI to examine 15 hairs on a piece of skin.",
      pt: "26 de novembro de 1976. Byrne, do Bigfoot Information Center em The Dalles, Oregon, pede ao FBI que examine 15 fios num pedaço de pele.",
    },
    credit: {
      en: "FBI file scan. U.S. government work, public domain.",
      pt: "Digitalização do arquivo do FBI. Obra do governo dos EUA, domínio público.",
    },
  },
  {
    id: "im-fbi-accept",
    src: "/images/fbi-cochran-1976.jpg",
    kind: "record",
    docs: ["fbi-vault"],
    tags: "cochran fbi carta 1976 laboratório laboratory aceita exame byrne",
    title: { en: "The FBI agrees to test the hairs", pt: "O FBI aceita examinar os pelos" },
    caption: {
      en: "December 15, 1976. Assistant Director Jay Cochran Jr. writes Byrne that the lab will make an exception and examine the sample.",
      pt: "15 de dezembro de 1976. O assistente de diretor Jay Cochran Jr. escreve a Byrne que o laboratório abre uma exceção e examina a amostra.",
    },
    credit: {
      en: "FBI letter, December 15, 1976. Public domain.",
      pt: "Carta do FBI, 15 de dezembro de 1976. Domínio público.",
    },
  },
  {
    id: "im-fbi-cover",
    src: "/images/fbi-cover.jpg",
    kind: "record",
    docs: ["fbi-vault", "blackvault-fbi"],
    tags: "fbi vault arquivo file capa cover bigfoot sasquatch foia 1976",
    title: { en: "First page of the FBI Bigfoot file", pt: "Primeira página do arquivo do FBI" },
    caption: {
      en: "Routing slip for the 22-page file the FBI posted to its Vault on June 5, 2019. A local copy of that PDF is linked from the record.",
      pt: "Guia de encaminhamento do arquivo de 22 páginas que o FBI publicou no Vault em 5 de junho de 2019. Uma cópia local desse PDF está no registro.",
    },
    credit: {
      en: "FBI Records: The Vault. Public domain.",
      pt: "FBI Records: The Vault. Domínio público.",
    },
  },
  {
    id: "im-fbi-lab",
    src: "/images/fbi-lab-1977.jpg",
    kind: "record",
    docs: ["fbi-vault"],
    tags: "fbi laboratório lab 1977 carta letter sasquatch hair exame",
    title: { en: "Another page from the lab file", pt: "Outra página do arquivo do laboratório" },
    caption: {
      en: "A further page from the same 22-page FBI release. Open the PDF for the full correspondence.",
      pt: "Mais uma página da mesma divulgação de 22 páginas do FBI. Abra o PDF para a correspondência completa.",
    },
    credit: {
      en: "FBI file scan. Public domain.",
      pt: "Digitalização do arquivo do FBI. Domínio público.",
    },
  },
  {
    id: "im-yellowstone-woods",
    src: "/images/yellowstone-woods.jpg",
    kind: "photo",
    docs: ["nps-yellowstone"],
    tags: "yellowstone floresta forest pinheiro parque nacional nps lodgepole",
    title: { en: "Yellowstone forest", pt: "Floresta de Yellowstone" },
    caption: {
      en: "Lodgepole pines in Yellowstone, the park whose archives say they found no Sasquatch sightings in the natural history records. This is the forest, not a sighting.",
      pt: "Pinheiros lodgepole em Yellowstone, o parque cujo arquivo diz não ter achado avistamentos de Sasquatch nos registros de história natural. É a floresta, não um avistamento.",
    },
    credit: {
      en: "Wikimedia Commons. CC BY-SA 4.0.",
      pt: "Wikimedia Commons. CC BY-SA 4.0.",
    },
  },
  {
    id: "im-yellowstone",
    src: "/images/yellowstone.jpg",
    kind: "photo",
    docs: ["nps-yellowstone"],
    tags: "yellowstone canyon artist point parque nacional nps montanha",
    title: { en: "Artist Point, Yellowstone Canyon", pt: "Artist Point, cânion de Yellowstone" },
    caption: {
      en: "The canyon at Artist Point. Rangers told letter-writers the park had no Bigfoot records. The landscape is real. The creature is not in this picture.",
      pt: "O cânion em Artist Point. Rangers responderam a cartas que o parque não tinha registros do Pé Grande. A paisagem é real. A criatura não está nesta foto.",
    },
    credit: {
      en: "Wikimedia Commons, Artist Point, Yellowstone. CC BY-SA 3.0.",
      pt: "Wikimedia Commons, Artist Point, Yellowstone. CC BY-SA 3.0.",
    },
  },
  {
    id: "im-chart",
    kind: "chart",
    docs: ["usfs-umatilla-1982"],
    tags: "gráfico tamanho pegadas polegadas comparação patterson johnstown chart footprint length inches",
    title: { en: "Reported footprint lengths", pt: "Comprimento das pegadas relatadas" },
    caption: {
      en: "Lengths claimed in different sources, in inches. The highlighted bar is the Umatilla measurement from the 1982 memo. None of these is independently verified as a living animal.",
      pt: "Comprimentos alegados em fontes diferentes, em polegadas. A barra destacada é a medida da Umatilla no memorando de 1982. Nenhuma foi verificada como animal vivo.",
    },
    credit: {
      en: "Comparison drawn for this index from the cited reports.",
      pt: "Comparação feita para este índice a partir dos relatos citados.",
    },
  },
];

export const CHART_ROWS: { label: Record<Lang, string>; inches: number; on?: boolean }[] = [
  { label: { en: "Umatilla NF, 1982 (USFS)", pt: "Umatilla NF, 1982 (USFS)" }, inches: 15, on: true },
  { label: { en: "Six Rivers CA, 1958 (reported)", pt: "Six Rivers CA, 1958 (relato)" }, inches: 16 },
  { label: { en: "Johnstown PA, 1980 (reported)", pt: "Johnstown PA, 1980 (relato)" }, inches: 17.75 },
  { label: { en: "Patterson cast, 1967 (museum)", pt: "Molde Patterson, 1967 (museu)" }, inches: 18 },
  { label: { en: "Largest size claimed", pt: "Maior tamanho alegado" }, inches: 24 },
];
