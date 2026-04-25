import SemanticError from './SemanticError';

export default class SymbolTable {
  private scopes: Map<string, boolean>[] = [];

  enterScope() {
    this.scopes.push(new Map());
  }

  exitScope() {
    this.scopes.pop();
    // console.log(this.scopes);
  }

  declare(identifier: string) {
    const currentScope = this.scopes[this.scopes.length - 1];
    if (!currentScope) {
      throw new SemanticError('No active scope found.');
    }
    if (currentScope.has(identifier)) {
      throw new SemanticError(
        `Variable "${identifier}" pehle se exist karta hai is scope mein bhai.`,
      );
    }
    currentScope.set(identifier, true);
  }

  resolve(identifier: string) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(identifier)) {
        return;
      }
    }
    throw new SemanticError(`Variable "${identifier}" bana to le pehle bhai.`);
  }
}
