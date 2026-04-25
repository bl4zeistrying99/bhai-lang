import * as fs from 'fs';
import * as path from 'path';

export interface KeywordMap {
  HI_BHAI: string;
  BYE_BHAI: string;
  BOL_BHAI: string;
  BHAI_YE_HAI: string;
  AGAR_BHAI: string;
  NAHI_TO_BHAI: string;
  WARNA_BHAI: string;
  JAB_TAK_BHAI: string;
  BAS_KAR_BHAI: string;
  AGLA_DEKH_BHAI: string;
  NALLA: string;
  SAHI: string;
  GALAT: string;
}

// Default keywords inlined so they work after tsup bundling.
// keywords.default.json is kept as reference documentation only.
const DEFAULT_KEYWORDS: KeywordMap = {
  HI_BHAI:        "hi bhai",
  BYE_BHAI:       "bye bhai",
  BOL_BHAI:       "bol bhai",
  BHAI_YE_HAI:    "bhai ye hai",
  AGAR_BHAI:      "agar bhai",
  NAHI_TO_BHAI:   "nahi to bhai",
  WARNA_BHAI:     "warna bhai",
  JAB_TAK_BHAI:   "jab tak bhai",
  BAS_KAR_BHAI:   "bas kar bhai",
  AGLA_DEKH_BHAI: "agla dekh bhai",
  NALLA:          "nalla",
  SAHI:           "sahi",
  GALAT:          "galat",
};

function loadCustomKeywords(customPath: string): Partial<KeywordMap> {
  try {
    const raw = fs.readFileSync(path.resolve(customPath), 'utf-8');
    return JSON.parse(raw) as Partial<KeywordMap>;
  } catch (err) {
    throw new Error(
      `BhaiLang: Could not load custom keywords file at "${customPath}". ` +
      `Make sure the file exists and contains valid JSON.\nError: ${(err as Error).message}`
    );
  }
}

export function loadKeywords(): KeywordMap {
  const customPath = process.env.BHAI_KEYWORDS;
  if (!customPath) return { ...DEFAULT_KEYWORDS };

  const custom = loadCustomKeywords(customPath);
  const validKeys = new Set(Object.keys(DEFAULT_KEYWORDS));

  for (const key of Object.keys(custom)) {
    if (!validKeys.has(key)) {
      throw new Error(
        `BhaiLang: Unknown keyword key "${key}" in custom keywords file. ` +
        `Valid keys are: ${[...validKeys].join(', ')}`
      );
    }
  }

  return { ...DEFAULT_KEYWORDS, ...custom };
}
