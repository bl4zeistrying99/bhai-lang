# BhaiLang — Architectural Enhancement
### Phase 2: Semantic Analyzer | Team CompileX | CD-VI-T043

---

## What Changed

BhaiLang originally had **no semantic analysis step**. Errors like using an undeclared variable or placing `bas kar bhai` outside a loop were only caught at runtime inside the interpreter — meaning the program would start executing and crash partway through.

This phase introduces a new package — `bhai-lang-semantic-analyzer` — that runs **between the parser and interpreter**, catching semantic errors at compile time before any code executes.

### Pipeline Before vs After

| | Pipeline |
|---|---|
| **Before** | `Source Code → Parser → Interpreter` |
| **After** | `Source Code → Parser → Semantic Analyzer → Interpreter` |

---

## New Package

```
packages/semantic-analyzer/
  src/
    SemanticAnalyzer.ts   ← AST visitor, validates all node types
    SemanticError.ts      ← typed error class
    SymbolTable.ts        ← stack-based scope tracker
  index.ts                ← public API: exports analyze()
  package.json
  tsconfig.json
```

---

## How It Works

### SymbolTable.ts
A stack of `Map` objects — each Map is one scope. Entering a block pushes a new Map, exiting pops it.

- `enterScope()` — push new scope
- `exitScope()` — pop current scope  
- `declare(name)` — adds variable to current scope, throws if already declared
- `resolve(name)` — walks stack top-to-bottom, throws if not found in any scope

### SemanticAnalyzer.ts
Mirrors the interpreter's visitor pattern. Walks every AST node and enforces semantic rules:

| AST Node | Rule Enforced |
|---|---|
| `VariableDeclaration` | Calls `declare()` — catches redeclaration |
| `IdentifierExpression` | Calls `resolve()` — catches undeclared usage |
| `AssignmentExpression` | Calls `resolve()` on left-hand variable |
| `BlockStatement` | Enters and exits scope |
| `IfStatement` | Validates condition and both branches |
| `WhileStatement` | Increments `loopDepth`, validates body |
| `BreakStatement` | Throws if `loopDepth === 0` |
| `ContinueStatement` | Throws if `loopDepth === 0` |
| `PrintStatement` | Validates each expression |
| `BinaryExpression` | Validates left and right operands |
| Literals | No validation needed |

### SemanticError.ts
Custom error class with a clean name so the CLI can identify and display it without a stack trace:
```
SemanticError: Variable "x" bana to le pehle bhai.
```

---

## Errors Detected

| Error | Example | Message |
|---|---|---|
| Undeclared variable | `bol bhai x;` without declaring `x` | `Variable "x" bana to le pehle bhai.` |
| Redeclaration | `bhai ye hai a = 5;` twice in same scope | `Variable "a" pehle se exist karta hai is scope mein bhai.` |
| Break outside loop | `bas kar bhai;` outside `jab tak bhai` | `Kya "bas kar bhai"?? Loop kahan hai bhai?` |
| Continue outside loop | `agla dekh bhai;` outside `jab tak bhai` | `Kya "agla dekh bhai"?? Loop kahan hai bhai?` |

---

## Setup & Usage

### 1. Install & Build

```bash
git clone https://github.com/bl4zeistrying99/bhai-lang
cd bhai-lang
npm install
npm run build
```

### 2. Run a program

```bash
node packages/cli/bin/index.js your-program.bhai
```

If the program is valid — runs normally as before.  
If it has a semantic error — stops immediately with a clear message. No partial execution.

---

## Test Programs

Test files are in the `test-programs/` folder.

```bash
# Should run successfully
node packages/cli/bin/index.js test-programs/test_valid.bhai

# Should throw SemanticError — undeclared variable
node packages/cli/bin/index.js test-programs/test_error_undeclared.bhai

# Should throw SemanticError — redeclaration in same scope
node packages/cli/bin/index.js test-programs/test_error_redeclare.bhai

# Should throw SemanticError — break outside loop
node packages/cli/bin/index.js test-programs/test_error_break.bhai

# Should throw SemanticError — continue outside loop
node packages/cli/bin/index.js test-programs/test_error_continue.bhai
```

### Expected Output

**Valid program:**
```
> 30
> 10
> 11
> 12
```

**Error program:**
```
SemanticError: Variable "x" bana to le pehle bhai.
```

---

## What Was NOT Changed

- `packages/parser` — untouched
- `packages/interpreter` — untouched  
- AST structure — no new node types
- All existing `.bhai` programs — run identically as before

The semantic analyzer is a **purely additive** change.

---

## Design Decisions

- **Visitor pattern** — mirrors the interpreter's architecture, easy to extend
- **Stack-based symbol table** — correctly handles nested scopes and shadowing
- **loopDepth counter** — simple integer that tracks valid break/continue context
- **Separate package** — keeps concerns isolated, interpreter is untouched
- **Hinglish error messages** — consistent with BhaiLang's existing style

---

## Team

| Name | Roll No |
|---|---|
| Bhawesh Gunjiyal *(Team Lead)* | 23021700 |
| Rahul Mehta | 23021291 |
| Aman Uniyal | 23021109 |
| Ajay Singh Jethi | 23021267 |

**Graphic Era (Deemed to be University) | CD-VI-T043**
