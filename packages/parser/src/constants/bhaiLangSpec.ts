import { KeywordMap, loadKeywords } from './keywordLoader';

export const TokenTypes = {
  NULL_TYPE: null,
  HI_BHAI_TYPE: "hi bhai",
  BYE_BHAI_TYPE: "bye bhai",
  BOL_BHAI_TYPE: "bol bhai",
  BHAI_YE_HAI_TYPE: "bhai ye hai",
  AGAR_BHAI: "agar bhai",
  WARNA_BHAI: "warna bhai",
  NAHI_TO_BHAI: "nahi to bhai",
  JAB_TAK_BHAI: "jab tak bhai",
  BAS_KAR_BHAI: "bas kar bhai",
  AGLA_DEKH_BHAI: "agla dekh bhai",
  NALLA_TYPE: "NALLA",
  SEMI_COLON_TYPE: ";",
  OPEN_CURLY_BRACE_TYPE: "{",
  CLOSED_CURLY_BRACE_TYPE: "}",
  OPEN_PARENTHESIS_TYPE: "(",
  CLOSED_PARENTHESIS_TYPE: ")",
  COMMA_TYPE: ",",
  NUMBER_TYPE: "NUMBER",
  IDENTIFIER_TYPE: "IDENTIFIER",
  SIMPLE_ASSIGN_TYPE: "SIMPLE_ASSIGN",
  COMPLEX_ASSIGN_TYPE: "COMPLEX_ASSIGN",
  ADDITIVE_OPERATOR_TYPE: "ADDITIVE_OPERATOR",
  MULTIPLICATIVE_OPERATOR_TYPE: "MULTIPLICATIVE_OPERATOR",
  RELATIONAL_OPERATOR: "RELATIONAL_OPERATOR",
  EQUALITY_OPERATOR: "EQUALITY_OPERATOR",
  STRING_TYPE: "STRING",
  BOOLEAN_TYPE: "BOOLEAN",
  LOGICAL_AND: "LOGICAL_AND",
  LOGICAL_OR: "LOGICAL_OR"
};

/**
 * Escapes a string so it can be safely embedded in a RegExp.
 */
function escapeRegex(str: string): RegExp {
  const escaped = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^\\b${escaped}\\b`);
}

/**
 * Builds the tokenizer SPEC from a KeywordMap.
 * Called once at module initialization time.
 * If BHAI_KEYWORDS env variable is set, custom keywords are merged in.
 */
export function buildSpec(keywords: KeywordMap) {
  return [
    // Whitespace (skip)
    { regex: /^\s+/, tokenType: TokenTypes.NULL_TYPE },

    // Single line comments (skip)
    { regex: /^\/\/.*/, tokenType: TokenTypes.NULL_TYPE },

    // Multi line comments (skip)
    { regex: /^\/\*[\s\S]*?\*\//, tokenType: TokenTypes.NULL_TYPE },

    // Symbols and delimiters
    { regex: /^;/,  tokenType: TokenTypes.SEMI_COLON_TYPE },
    { regex: /^\{/, tokenType: TokenTypes.OPEN_CURLY_BRACE_TYPE },
    { regex: /^\}/, tokenType: TokenTypes.CLOSED_CURLY_BRACE_TYPE },
    { regex: /^\(/, tokenType: TokenTypes.OPEN_PARENTHESIS_TYPE },
    { regex: /^\)/, tokenType: TokenTypes.CLOSED_PARENTHESIS_TYPE },
    { regex: /^,/,  tokenType: TokenTypes.COMMA_TYPE },

    // Keywords — built dynamically from keyword map
    { regex: escapeRegex(keywords.HI_BHAI),       tokenType: TokenTypes.HI_BHAI_TYPE },
    { regex: escapeRegex(keywords.BYE_BHAI),      tokenType: TokenTypes.BYE_BHAI_TYPE },
    { regex: escapeRegex(keywords.BOL_BHAI),      tokenType: TokenTypes.BOL_BHAI_TYPE },
    { regex: escapeRegex(keywords.BHAI_YE_HAI),   tokenType: TokenTypes.BHAI_YE_HAI_TYPE },
    { regex: escapeRegex(keywords.AGAR_BHAI),     tokenType: TokenTypes.AGAR_BHAI },
    { regex: escapeRegex(keywords.NAHI_TO_BHAI),  tokenType: TokenTypes.NAHI_TO_BHAI },
    { regex: escapeRegex(keywords.WARNA_BHAI),    tokenType: TokenTypes.WARNA_BHAI },
    { regex: escapeRegex(keywords.NALLA),         tokenType: TokenTypes.NALLA_TYPE },
    { regex: escapeRegex(keywords.JAB_TAK_BHAI),  tokenType: TokenTypes.JAB_TAK_BHAI },
    { regex: escapeRegex(keywords.BAS_KAR_BHAI),  tokenType: TokenTypes.BAS_KAR_BHAI },
    { regex: escapeRegex(keywords.AGLA_DEKH_BHAI),tokenType: TokenTypes.AGLA_DEKH_BHAI },

    // Number (supports floats)
    { regex: /^[+-]?([\d]*[.])?[\d]+/, tokenType: TokenTypes.NUMBER_TYPE },

    // Booleans — also configurable
    { regex: escapeRegex(keywords.SAHI),  tokenType: TokenTypes.BOOLEAN_TYPE },
    { regex: escapeRegex(keywords.GALAT), tokenType: TokenTypes.BOOLEAN_TYPE },

    // Identifier (must come after keywords)
    { regex: /^\w+/, tokenType: TokenTypes.IDENTIFIER_TYPE },

    // Equality operators: ==, !=
    { regex: /^[=!]=/, tokenType: TokenTypes.EQUALITY_OPERATOR },

    // Assignment operators: =, *=, /=, +=, -=
    { regex: /^=/,           tokenType: TokenTypes.SIMPLE_ASSIGN_TYPE },
    { regex: /^[\*\%\/\+\-]=/, tokenType: TokenTypes.COMPLEX_ASSIGN_TYPE },

    // Arithmetic operators
    { regex: /^[+\-]/,  tokenType: TokenTypes.ADDITIVE_OPERATOR_TYPE },
    { regex: /^[*\/\%]/, tokenType: TokenTypes.MULTIPLICATIVE_OPERATOR_TYPE },

    // Relational operators: <, >, <=, >=
    { regex: /^[><]=?/, tokenType: TokenTypes.RELATIONAL_OPERATOR },

    // Logical operators: &&, ||
    { regex: /^&&/,   tokenType: TokenTypes.LOGICAL_AND },
    { regex: /^\|\|/, tokenType: TokenTypes.LOGICAL_OR },

    // String literals
    { regex: /^"[^"]*"/, tokenType: TokenTypes.STRING_TYPE },
    { regex: /^'[^']*'/, tokenType: TokenTypes.STRING_TYPE },
  ];
}

// Load keywords at module initialization time (once)
const _keywords = loadKeywords();

// Build and export the SPEC — used by BhaiLangModule
export const SPEC = buildSpec(_keywords);

export type Spec = typeof SPEC;
