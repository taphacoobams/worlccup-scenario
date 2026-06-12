/** Codes internes (teams.json) ↔ codes FIFA 3 lettres (squads.json) */
export const INTERNAL_TO_FIFA3: Record<string, string> = {
  MX: "MEX",
  ZA: "RSA",
  KR: "KOR",
  CZ: "CZE",
  CA: "CAN",
  BA: "BIH",
  QA: "QAT",
  CH: "SUI",
  BR: "BRA",
  MA: "MAR",
  HT: "HAI",
  "GB-SCT": "SCO",
  US: "USA",
  PY: "PAR",
  AU: "AUS",
  TR: "TUR",
  DE: "GER",
  CW: "CUW",
  CI: "CIV",
  EC: "ECU",
  NL: "NED",
  JP: "JPN",
  SE: "SWE",
  TN: "TUN",
  BE: "BEL",
  EG: "EGY",
  IR: "IRN",
  NZ: "NZL",
  ES: "ESP",
  CV: "CPV",
  SA: "KSA",
  UY: "URU",
  FR: "FRA",
  SN: "SEN",
  IQ: "IRQ",
  NO: "NOR",
  AR: "ARG",
  DZ: "ALG",
  AT: "AUT",
  JO: "JOR",
  PT: "POR",
  CD: "COD",
  UZ: "UZB",
  CO: "COL",
  "GB-ENG": "ENG",
  HR: "CRO",
  GH: "GHA",
  PA: "PAN",
};

export const FIFA3_TO_INTERNAL: Record<string, string> = Object.fromEntries(
  Object.entries(INTERNAL_TO_FIFA3).map(([k, v]) => [v, k])
);

export function toFifa3Code(internalCode: string): string {
  const u = internalCode.toUpperCase();
  return INTERNAL_TO_FIFA3[u] ?? u;
}

export function fromFifa3Code(fifa3: string): string | null {
  return FIFA3_TO_INTERNAL[fifa3.toUpperCase()] ?? null;
}
