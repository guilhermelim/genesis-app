export default class ConcurrencyError extends Error {
  constructor(message = 'The entity was changed by another operation.') {
    super(message)
    this.name = 'ConcurrencyError'
  }
}
