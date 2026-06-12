/** FIFA / codes manuels → slug flagcdn.com (ISO2 ou régions) */
const ISO3_TO_ISO2: Record<string, string> = {
  AFG: "AF", ALB: "AL", ALG: "DZ", AND: "AD", ANG: "AO", ARG: "AR", ARM: "AM",
  AUS: "AU", AUT: "AT", BEL: "BE", BEN: "BJ", BIH: "BA", BLR: "BY", BOL: "BO",
  BRA: "BR", BUL: "BG", CAN: "CA", CHI: "CL", CHN: "CN", COL: "CO", CRC: "CR",
  CRO: "HR", CUB: "CU", CYP: "CY", CZE: "CZ", DEN: "DK", ECU: "EC", EGY: "EG",
  ENG: "GB", ESP: "ES", EST: "EE", ETH: "ET", FIN: "FI", FRA: "FR", GAB: "GA",
  GEO: "GE", GER: "DE", GHA: "GH", GRE: "GR", HAI: "HT", HON: "HN", HUN: "HU",
  ISL: "IS", IND: "IN", IRN: "IR", IRQ: "IQ", IRL: "IE", ISR: "IL", ITA: "IT",
  JAM: "JM", JPN: "JP", JOR: "JO", KAZ: "KZ", KEN: "KE", KOR: "KR", KSA: "SA",
  KUW: "KW", LAT: "LV", LBA: "LY", LIE: "LI", LTU: "LT", LUX: "LU", MAR: "MA",
  MEX: "MX", MKD: "MK", MLI: "ML", MLT: "MT", MNE: "ME", NED: "NL", NGA: "NG",
  NIR: "GB", NOR: "NO", NZL: "NZ", OMA: "OM", PAN: "PA", PAR: "PY", PER: "PE",
  POL: "PL", POR: "PT", QAT: "QA", ROU: "RO", RSA: "ZA", RUS: "RU", SCO: "GB",
  SEN: "SN", SRB: "RS", SUI: "CH", SVK: "SK", SVN: "SI", SWE: "SE", TUN: "TN",
  TUR: "TR", UAE: "AE", UKR: "UA", URU: "UY", USA: "US", UZB: "UZ", VEN: "VE",
  WAL: "GB", ZAM: "ZM", ZIM: "ZW", CPV: "CV", CIV: "CI", CUR: "CW",
};

/** Codes 2 lettres non ISO standard (FIFA / fichier manuel) */
const FIFA_2_TO_FLAG: Record<string, string> = {
  QA: "qa",
  IR: "ir",
  SA: "sa",
  CI: "ci",
  CV: "cv",
  CW: "cw",
  KR: "kr",
  SN: "sn",
  US: "us",
  GB: "gb",
  CH: "ch",
  DE: "de",
  FR: "fr",
  MX: "mx",
  BR: "br",
  AR: "ar",
  PT: "pt",
  ES: "es",
  IT: "it",
  NL: "nl",
  BE: "be",
  HR: "hr",
  MA: "ma",
  EG: "eg",
  TN: "tn",
  DZ: "dz",
  ZA: "za",
  GH: "gh",
  NG: "ng",
  CM: "cm",
  JP: "jp",
  AU: "au",
  NZ: "nz",
  CA: "ca",
  UY: "uy",
  EC: "ec",
  PY: "py",
  CO: "co",
  PA: "pa",
  HT: "ht",
  JO: "jo",
  UZ: "uz",
  AT: "at",
  NO: "no",
};

const SPECIAL_TO_FLAG: Record<string, string> = {
  "GB-SCT": "gb-sct",
  "GB-ENG": "gb-eng",
  "GB-WLS": "gb-wls",
  "GB-NIR": "gb-nir",
  EU: "eu",
  UN: "un",
  XX: "xx",
};

const NAME_TO_FLAG: Record<string, string> = {
  mexico: "mx",
  mexique: "mx",
  "south korea": "kr",
  "coree du sud": "kr",
  "corée du sud": "kr",
  "south africa": "za",
  "afrique du sud": "za",
  canada: "ca",
  qatar: "qa",
  switzerland: "ch",
  suisse: "ch",
  brazil: "br",
  bresil: "br",
  "brésil": "br",
  morocco: "ma",
  maroc: "ma",
  scotland: "gb-sct",
  ecosse: "gb-sct",
  "écosse": "gb-sct",
  haiti: "ht",
  "haïti": "ht",
  "united states": "us",
  "etats-unis": "us",
  "états-unis": "us",
  paraguay: "py",
  australia: "au",
  australie: "au",
  germany: "de",
  allemagne: "de",
  ecuador: "ec",
  equateur: "ec",
  "équateur": "ec",
  "ivory coast": "ci",
  "côte d'ivoire": "ci",
  "cote d'ivoire": "ci",
  curacao: "cw",
  "curaçao": "cw",
  netherlands: "nl",
  "pays-bas": "nl",
  japan: "jp",
  japon: "jp",
  tunisia: "tn",
  tunisie: "tn",
  belgium: "be",
  belgique: "be",
  iran: "ir",
  egypt: "eg",
  egypte: "eg",
  "égypte": "eg",
  "new zealand": "nz",
  "nouvelle-zelande": "nz",
  "nouvelle-zélande": "nz",
  spain: "es",
  espagne: "es",
  uruguay: "uy",
  "saudi arabia": "sa",
  "arabie saoudite": "sa",
  "cape verde": "cv",
  "cap-vert": "cv",
  france: "fr",
  senegal: "sn",
  "sénégal": "sn",
  norway: "no",
  norvege: "no",
  "norvège": "no",
  argentina: "ar",
  argentine: "ar",
  austria: "at",
  autriche: "at",
  algeria: "dz",
  algerie: "dz",
  "algérie": "dz",
  jordan: "jo",
  jordanie: "jo",
  portugal: "pt",
  colombia: "co",
  colombie: "co",
  uzbekistan: "uz",
  ouzbekistan: "uz",
  "ouzbékistan": "uz",
  england: "gb-eng",
  angleterre: "gb-eng",
  croatia: "hr",
  croatie: "hr",
  panama: "pa",
  ghana: "gh",
  "czech republic": "cz",
  tchequie: "cz",
  "tchéquie": "cz",
  turkey: "tr",
  turquie: "tr",
  "bosnia and herzegovina": "ba",
  "bosnie-herzegovine": "ba",
  "bosnie-hérzégovine": "ba",
  iraq: "iq",
  irak: "iq",
  sweden: "se",
  suede: "se",
  "suède": "se",
  "dr congo": "cd",
  "rd congo": "cd",
};

const FIFA_2_TO_FLAG_EXTRA: Record<string, string> = {
  BA: "ba",
  CZ: "cz",
  IQ: "iq",
  CD: "cd",
  HT: "ht",
  EC: "ec",
  PY: "py",
  SE: "se",
  CV: "cv",
  CW: "cw",
  CI: "ci",
  JO: "jo",
  UZ: "uz",
  AT: "at",
  DZ: "dz",
  PA: "pa",
  GH: "gh",
  TR: "tr",
};

function normalizeNameKey(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function toFlagCode(code?: string | null, name?: string): string {
  if (name && isBracketSlotName(name)) return "xx";
  if (!code && name) return resolveFromName(name);
  const upper = code!.toUpperCase().trim();
  if (upper === "—" || upper === "XX") return resolveFromName(name ?? "");
  if (SPECIAL_TO_FLAG[upper]) return SPECIAL_TO_FLAG[upper];
  if (FIFA_2_TO_FLAG[upper]) return FIFA_2_TO_FLAG[upper];
  if (FIFA_2_TO_FLAG_EXTRA[upper]) return FIFA_2_TO_FLAG_EXTRA[upper];
  if (upper.length === 2) return upper.toLowerCase();
  if (upper.length === 3 && ISO3_TO_ISO2[upper]) {
    return ISO3_TO_ISO2[upper].toLowerCase();
  }
  if (name) return resolveFromName(name);
  return upper.slice(0, 2).toLowerCase();
}

function isBracketSlotName(name: string): boolean {
  const n = name.replace(/\s+/g, "");
  return (
    /^[12][A-L]$/.test(n) ||
    /^3[A-L](?:\/[A-L\/]+)*$/.test(n) ||
    /^V\d+$/.test(n) ||
    /^P\d+$/.test(n)
  );
}

function resolveFromName(name: string): string {
  const n = normalizeNameKey(name);
  if (NAME_TO_FLAG[n]) return NAME_TO_FLAG[n];
  for (const [key, flag] of Object.entries(NAME_TO_FLAG)) {
    if (n.includes(normalizeNameKey(key))) return flag;
  }
  if (n.includes("playoff") || n.includes("barrage") || n.includes("uefa")) return "eu";
  if (n.includes("fifa")) return "un";
  return "xx";
}
