import { ASTNode } from 'bhai-lang-parser';

import SemanticAnalyzer from './src/SemanticAnalyzer';

export { default as SemanticError } from './src/SemanticError';

export function analyze(ast: ASTNode): void {
  const analyzer = new SemanticAnalyzer();
  analyzer.analyze(ast);
}
