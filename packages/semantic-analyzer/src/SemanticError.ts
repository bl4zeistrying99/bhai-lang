export default class SemanticError extends Error {
  constructor(errorMessage: string) {
    super(errorMessage);
    this.name = 'SemanticError';
    this.message = errorMessage;
  }
}
