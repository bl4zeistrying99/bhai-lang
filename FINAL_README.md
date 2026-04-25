# BhaiLang — Architectural Enhancement of a Hinglish DSL

<p align="center">
  <strong>Team CompileX &nbsp;|&nbsp; CD-VI-T043 &nbsp;</strong><br>
  BTech CSE — Compiler Design Project — Semester VI
</p>

---

## Team

| Name | Roll No | Email | Role |
|---|---|---|---|
| **Bhawesh Gunjiyal** | 23021700 | mailbl4ze99@gmail.com | Team Lead |
| Rahul Mehta | 23021291 | rahulmehta712004@gmail.com | Member |
| Aman Uniyal | 23021109 | amanuniyal123456@gmail.com | Member |
| Ajay Singh Jethi | 23021267 | ajayjethi416@gmail.com | Member |

---

## Project Overview

BhaiLang is an interpreted domain-specific language (DSL) where programs are written in Hinglish — a mix of Hindi and English. This project is a fork of [DulLabs/bhai-lang](https://github.com/DulLabs/bhai-lang) with two major architectural enhancements added across three phases.

### Problem Statement

The original BhaiLang had no semantic analysis phase. Its compiler pipeline went directly from parsing to execution:

```
Source Code → Parser → Interpreter
```

This meant semantic errors — like using a variable before declaring it, or placing a `break` statement outside a loop — were only caught at runtime inside the interpreter, after the program had already started executing. This produced confusing stack traces and allowed partial execution before failure.

### What We Built

```
Source Code → Parser (+ configurable keywords) → Semantic Analyzer → Interpreter
```

We introduced:
1. A complete **Semantic Analyzer** package that validates programs before execution (Phase 2)
2. A **JSON-based keyword configuration system** that makes BhaiLang's syntax customizable (Phase 3)

---

## Repository

```
Branch: develop
URL:    https://github.com/bl4zeistrying99/bhai-lang
```

---

## Installation

**Requirements:** Node.js >= 14, npm >= 7

```bash
git clone https://github.com/bl4zeistrying99/bhai-lang.git
cd bhai-lang
npm install
npm run build
```

---

## Running Programs

```bash
node packages/cli/bin/index.js <path-to-file.bhai>
```

**Example:**
```bash
node packages/cli/bin/index.js test-programs/test_valid.bhai
```

---

## BhaiLang Language Reference

| Construct | Keyword | Example |
|---|---|---|
| Program start | `hi bhai` | `hi bhai` |
| Program end | `bye bhai` | `bye bhai` |
| Declare variable | `bhai ye hai` | `bhai ye hai x = 10;` |
| Print | `bol bhai` | `bol bhai x;` |
| If | `agar bhai` | `agar bhai (x > 5) { }` |
| Else if | `nahi to bhai` | `nahi to bhai (x == 5) { }` |
| Else | `warna bhai` | `warna bhai { }` |
| While loop | `jab tak bhai` | `jab tak bhai (x < 10) { }` |
| Break | `bas kar bhai` | `bas kar bhai;` |
| Continue | `agla dekh bhai` | `agla dekh bhai;` |
| True | `sahi` | `bhai ye hai flag = sahi;` |
| False | `galat` | `bhai ye hai flag = galat;` |
| Null | `nalla` | `bhai ye hai x = nalla;` |

### Operators

| Type | Operators |
|---|---|
| Arithmetic | `+` `-` `*` `/` `%` |
| Assignment | `=` `+=` `-=` `*=` `/=` `%=` |
| Comparison | `==` `!=` `<` `>` `<=` `>=` |
| Logical | `&&` `\|\|` |

---

## Example Programs

### Hello World
```
hi bhai
  bol bhai "Namaste Duniya!";
bye bhai
```

### Variables and Arithmetic
```
hi bhai
  bhai ye hai a = 10;
  bhai ye hai b = 20;
  bol bhai "Sum:", a + b;
  bol bhai "Product:", a * b;
bye bhai
```

### Conditional
```
hi bhai
  bhai ye hai marks = 85;
  agar bhai (marks >= 90) {
    bol bhai "A grade";
  } nahi to bhai (marks >= 70) {
    bol bhai "B grade";
  } warna bhai {
    bol bhai "Keep trying bhai";
  }
bye bhai
```

### While Loop
```
hi bhai
  bhai ye hai i = 1;
  jab tak bhai (i <= 5) {
    bol bhai i;
    i = i + 1;
  }
bye bhai
```

---

## Phase 1 — Analysis and Design

**What was done:**
- Forked the original DulLabs/bhai-lang repository
- Studied the entire codebase — tokenizer, recursive descent parser, AST node types, interpreter visitor pattern
- Identified that BhaiLang was missing the semantic analysis phase (Phase 3 of compiler design theory)
- Designed the symbol table structure and semantic analyzer architecture before any implementation

**Key finding:** The interpreter's `Scope` class was performing semantic checks (undeclared variable detection) at runtime during execution. This needed to be moved to a dedicated compile-time validation step.

---

## Phase 2 — Semantic Analyzer

### Overview

A new package `bhai-lang-semantic-analyzer` was built from scratch and inserted between the parser and interpreter in the execution pipeline.

### New Package Structure

```
packages/semantic-analyzer/
  src/
    SemanticAnalyzer.ts   ← AST visitor — validates all 19 node types
    SemanticError.ts      ← Custom typed error class
    SymbolTable.ts        ← Stack-based scope management
  index.ts                ← Public API: exports analyze(ast)
  package.json
  tsconfig.json
```

### SemanticError.ts

```typescript
export default class SemanticError extends Error {
  constructor(errorMessage: string) {
    super(errorMessage);
    this.name = 'SemanticError';
    this.message = errorMessage;
  }
}
```

The `name` property is critical — the CLI catch block checks `ex.name === 'SemanticError'` to print a clean one-line message instead of a stack trace.

### SymbolTable.ts

Implemented as a **stack of Maps** (`Map<string, boolean>[]`). Each Map represents one scope.

```typescript
enterScope()          // push new Map — called on any { } block entry
exitScope()           // pop top Map — called on block exit
declare(name)         // check top Map only — catches same-scope redeclaration
resolve(name)         // walk stack top → bottom — lexical scope lookup
```

**Why a stack:**
- `declare()` checks only the top Map — so the same name in an inner scope is valid (variable shadowing)
- `resolve()` walks top to bottom — so inner scopes can access outer scope variables
- When a scope is popped, all variables declared in it cease to exist

### SemanticAnalyzer.ts

Implements the Visitor Pattern — mirrors the interpreter's existing architecture. Two state variables:

- `symbolTable` — the `SymbolTable` instance
- `loopDepth: number` — integer counter, incremented entering a loop, decremented exiting

**All node types handled:**

| Node Type | Semantic Rule |
|---|---|
| `Program` | Delegates to body |
| `InitStatement` | Opens root scope, visits all statements |
| `VariableStatement` | Visits each declaration |
| `VariableDeclaration` | `declare(name)` — catches redeclaration |
| `AssignmentExpression` | `resolve(left)` — catches undeclared assignment target |
| `IdentifierExpression` | `resolve(name)` — catches undeclared variable usage |
| `BlockStatement` | `enterScope()` → visit body → `exitScope()` |
| `IfStatement` | Visits condition + all branches |
| `WhileStatement` | `loopDepth++` → visit body → `loopDepth--` |
| `BreakStatement` | Throws if `loopDepth === 0` |
| `ContinueStatement` | Throws if `loopDepth === 0` |
| `PrintStatement` | Visits each expression |
| `ExpressionStatement` | Visits the expression |
| `BinaryExpression` | Visits left and right operands |
| `LogicalExpression` | Visits left and right operands |
| All literals | `return` — always valid |

### CLI Integration

Only one existing file was modified — `packages/cli/src/index.ts`:

```typescript
// Before
interpreter.interpret(data);

// After
const parser = require('bhai-lang-parser').default;
const { analyze } = require('bhai-lang-semantic-analyzer');
const ast = parser.parse(data);
analyze(ast);                    // ← new step
interpreter.interpret(data);
```

If `analyze()` throws a `SemanticError`, the catch block prints a clean red message and exits. The interpreter never runs.

### Errors Detected

All errors are caught **before execution begins** — zero output before the error message.

| Error | Trigger | Message |
|---|---|---|
| Undeclared variable | `bol bhai x` — x never declared | `Variable "x" bana to le pehle bhai.` |
| Redeclaration | `bhai ye hai a = 5;` twice in same scope | `Variable "a" pehle se exist karta hai is scope mein bhai.` |
| Break outside loop | `bas kar bhai` outside `jab tak bhai` | `Kya "bas kar bhai"?? Loop kahan hai bhai?` |
| Continue outside loop | `agla dekh bhai` outside `jab tak bhai` | `Kya "agla dekh bhai"?? Loop kahan hai bhai?` |

### What Was NOT Changed

- `packages/parser/` — parser logic untouched
- `packages/interpreter/` — completely untouched
- All existing `.bhai` programs — run identically

---

## Phase 3 — JSON Keyword Mapping

### Overview

BhaiLang's keywords (`hi bhai`, `bol bhai`, `jab tak bhai` etc.) were previously hardcoded as regex literals inside `bhaiLangSpec.ts`. Phase 3 externalizes them into a JSON configuration file and allows users to supply their own custom keyword files.

### New Files

```
packages/parser/src/constants/
  keywords.default.json   ← All 13 default keyword definitions
  keywordLoader.ts        ← loadKeywords() — reads defaults + merges custom
  bhaiLangSpec.ts         ← Now exports buildSpec(keywords) instead of hardcoded SPEC
```

### keywords.default.json

```json
{
  "HI_BHAI":        "hi bhai",
  "BYE_BHAI":       "bye bhai",
  "BOL_BHAI":       "bol bhai",
  "BHAI_YE_HAI":    "bhai ye hai",
  "AGAR_BHAI":      "agar bhai",
  "NAHI_TO_BHAI":   "nahi to bhai",
  "WARNA_BHAI":     "warna bhai",
  "JAB_TAK_BHAI":   "jab tak bhai",
  "BAS_KAR_BHAI":   "bas kar bhai",
  "AGLA_DEKH_BHAI": "agla dekh bhai",
  "NALLA":          "nalla",
  "SAHI":           "sahi",
  "GALAT":          "galat"
}
```

### keywordLoader.ts

Default keywords are **inlined as a TypeScript constant** (not read from the JSON file at runtime). This is required because tsup bundles everything into a single file — `__dirname`-based file reads are unreliable in bundled output.

The JSON file serves as authoritative reference documentation for which keys exist.

Custom keywords are loaded from disk only when `BHAI_KEYWORDS` is set — the user supplies the full path so runtime resolution works correctly.

```typescript
export function loadKeywords(): KeywordMap {
  const customPath = process.env.BHAI_KEYWORDS;
  if (!customPath) return { ...DEFAULT_KEYWORDS };   // use inlined defaults

  const custom = loadCustomKeywords(customPath);      // read user file from disk
  // validate no unknown keys, then merge
  return { ...DEFAULT_KEYWORDS, ...custom };
}
```

### bhaiLangSpec.ts

```typescript
function escapeRegex(str: string): RegExp {
  const escaped = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^\\b${escaped}\\b`);
}

export function buildSpec(keywords: KeywordMap) {
  return [
    // ... fixed tokens (whitespace, symbols, operators)
    { regex: escapeRegex(keywords.HI_BHAI),  tokenType: TokenTypes.HI_BHAI_TYPE },
    { regex: escapeRegex(keywords.BYE_BHAI), tokenType: TokenTypes.BYE_BHAI_TYPE },
    // ... all other keywords built dynamically
  ];
}

const _keywords = loadKeywords();     // called once at module init
export const SPEC = buildSpec(_keywords);
```

The semantic analyzer and interpreter are **completely unaffected** by keyword changes. Only the tokenizer reads the keyword config.

### Using Custom Keywords

**Step 1 — Create a custom keywords JSON file** (only include keys you want to change):

```json
{
  "HI_BHAI": "start",
  "BYE_BHAI": "end",
  "BOL_BHAI": "print",
  "BHAI_YE_HAI": "var",
  "JAB_TAK_BHAI": "while",
}
```

**Step 2 — Run with the custom file (Windows PowerShell):**

```powershell
$env:BHAI_KEYWORDS="./test-programs/custom-keywords.json"
node packages/cli/bin/index.js test-programs/test_custom_keywords.bhai
```

**Step 3 — Reset back to default keywords:**

```powershell
Remove-Item Env:BHAI_KEYWORDS
```

**Linux / Mac:**
```bash
BHAI_KEYWORDS=./test-programs/custom-keywords.json node packages/cli/bin/index.js program.bhai
```

---

## Test Programs

All test programs are in `test-programs/`. Run from the repo root.

### Phase 2 — Semantic Analyzer Tests

```bash
# Valid program — runs and prints output
node packages/cli/bin/index.js test-programs/test_valid.bhai

# Full demo — variables, loops, conditionals, break
node packages/cli/bin/index.js test-programs/demo_full.bhai

# Error: undeclared variable — stops with SemanticError, no output
node packages/cli/bin/index.js test-programs/test_error_undeclared.bhai

# Error: redeclaration in same scope — stops with SemanticError
node packages/cli/bin/index.js test-programs/test_error_redeclare.bhai
```

### Phase 3 — Keyword Mapping Tests (Windows PowerShell)

```powershell
# Set custom keywords
$env:BHAI_KEYWORDS="./test-programs/custom-keywords.json"

# Run program written with custom keywords
node packages/cli/bin/index.js test-programs/test_custom_keywords.bhai

# Reset to default
Remove-Item Env:BHAI_KEYWORDS

# Confirm default still works
node packages/cli/bin/index.js test-programs/test_valid.bhai
```

### Expected Results

| Test File | Expected |
|---|---|
| `test_valid.bhai` | Prints: `30`, then `10 11 12 13 14` |
| `demo_full.bhai` | Prints score progression with level info |
| `test_error_undeclared.bhai` | `SemanticError: Variable "x" bana to le pehle bhai.` |
| `test_error_redeclare.bhai` | `SemanticError: Variable "a" pehle se exist karta hai...` |
| `test_custom_keywords.bhai` | Runs with custom keywords, prints score progression |

---

## Architecture

### Full Pipeline

```
┌─────────────┐   ┌──────────────────────────────────────┐   ┌─────────────────────┐   ┌─────────────┐
│ Source Code │──▶│              Parser                  │──▶│  Semantic Analyzer  │──▶│ Interpreter │
│  (.bhai)   │   │  Tokenizer + Recursive Descent       │   │   Phase 2 — NEW     │   │ Tree-walker │
└─────────────┘   └──────────────────────────────────────┘   └─────────────────────┘   └─────────────┘
                                    ▲
                   ┌────────────────────────────────┐
                   │  keywords.default.json         │
                   │  + BHAI_KEYWORDS env var       │  ← Phase 3 — NEW
                   └────────────────────────────────┘
```

### Package Dependency Graph

```
bhailang (CLI)
  ├── bhai-lang-parser
  │     └── keywordLoader  ← Phase 3
  ├── bhai-lang-semantic-analyzer  ← Phase 2
  └── bhai-lang-interpreter
```

### Parser Type

BhaiLang uses a **Recursive Descent Parser (LL(1) Top-Down Parser)**. Each grammar rule is a method. Methods call each other recursively from the top (Program) to the bottom (literals). One token of lookahead is sufficient at each decision point.

**Operator precedence** is encoded through the call chain — lower-precedence operators call higher-precedence rules first:

```
AssignmentExpression → LogicalOR → LogicalAND → Equality →
Relational → Additive → Multiplicative → PrimaryExpression
```

### Interpreter Type

BhaiLang uses a **Tree-Walking Interpreter** — it executes the AST directly without compiling to bytecode. Each node type has a dedicated Visitor class in `packages/interpreter/src/components/visitor/`.

---


## Quick Reference

| Action | Command (Windows PowerShell) |
|---|---|
| Build project | `npm run build` |
| Run program | `node packages/cli/bin/index.js file.bhai` |
| Use custom keywords | `$env:BHAI_KEYWORDS="./path/to/keywords.json"` |
| Reset to default keywords | `Remove-Item Env:BHAI_KEYWORDS` |
| Check active keyword file | `echo $env:BHAI_KEYWORDS` |

---

## References

1. DulLabs, "BhaiLang Official Website." https://bhailang.js.org
2. DulLabs, "bhai-lang GitHub Repository." https://github.com/DulLabs/bhai-lang
3. R. Nystrom, *Crafting Interpreters*. Genever Benning, 2021. https://craftinginterpreters.com
4. A. V. Aho, M. S. Lam, R. Sethi, J. D. Ullman, *Compilers: Principles, Techniques, and Tools*, 2nd ed. Pearson, 2006.
5. T. Parr, *Language Implementation Patterns*. Pragmatic Programmers, 2010.
6. M. Fowler, *Domain-Specific Languages*. Addison-Wesley Professional, 2010.

---

<p align="center">
  &nbsp; BTech CSE Semester VI &nbsp;|&nbsp; CD-VI-T043 &nbsp;|&nbsp; Team CompileX
</p>
