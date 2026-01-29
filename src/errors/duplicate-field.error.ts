export class DuplicateFieldError extends Error {
  constructor(public readonly message: string) {
    super(message);
    this.name = 'DuplicateFieldError';
  }
}