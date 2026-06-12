import { toFlagCode } from "@/lib/iso-codes";

/**
 * Fallback nom → code quand l'API ne fournit pas de code pays.
 */
const NAME_TO_CODE: Record<string, string> = {
  Senegal: "SN",
  France: "FR",
  Brazil: "BR",
  Argentina: "AR",
  Germany: "DE",
  Spain: "ES",
  England: "GB",
  "United States": "US",
  USA: "US",
  Mexico: "MX",
  Canada: "CA",
  Japan: "JP",
  "South Korea": "KR",
  Morocco: "MA",
  Netherlands: "NL",
  Belgium: "BE",
  Portugal: "PT",
  Croatia: "HR",
  Switzerland: "CH",
  Poland: "PL",
  Uruguay: "UY",
  Colombia: "CO",
  Ecuador: "EC",
  Australia: "AU",
  Iran: "IR",
  "Saudi Arabia": "SA",
  Tunisia: "TN",
  Cameroon: "CM",
  Ghana: "GH",
  Nigeria: "NG",
  Egypt: "EG",
  Qatar: "QA",
  Costa: "CR",
  "Costa Rica": "CR",
  Panama: "PA",
  Chile: "CL",
  Peru: "PE",
  Paraguay: "PY",
  Bolivia: "BO",
  Venezuela: "VE",
  Italy: "IT",
  Denmark: "DK",
  Sweden: "SE",
  Norway: "NO",
  Serbia: "RS",
  Wales: "GB",
  Scotland: "GB",
  Ukraine: "UA",
  Turkey: "TR",
  Austria: "AT",
  "Czech Republic": "CZ",
  Hungary: "HU",
  Romania: "RO",
  Greece: "GR",
  Ireland: "IE",
  Finland: "FI",
  Iceland: "IS",
  Algeria: "DZ",
  "South Africa": "ZA",
  Iraq: "IQ",
  Jordan: "JO",
  Uzbekistan: "UZ",
  Indonesia: "ID",
  "New Zealand": "NZ",
  China: "CN",
  India: "IN",
  Haiti: "HT",
  Jamaica: "JM",
  Curaçao: "CW",
};

export function resolveCountryCode(name: string, apiCode?: string | null): string {
  const fromIso = toFlagCode(apiCode, name);
  if (fromIso && fromIso !== "xx") return fromIso.toUpperCase();

  const direct = NAME_TO_CODE[name];
  if (direct) return direct;

  const normalized = name.trim();
  for (const [key, code] of Object.entries(NAME_TO_CODE)) {
    if (key.toLowerCase() === normalized.toLowerCase()) return code;
  }

  return "XX";
}
