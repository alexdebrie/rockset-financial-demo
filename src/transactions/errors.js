const { KnownError } = require("../handlers/utils");

class TransactionDoesNotExistError extends KnownError {
  constructor({ transactionId }) {
    super();
    this.message = `Transaction with id ${transactionId} does not exist.`;
    this.status = 404;
  }
}

module.exports = {
  TransactionDoesNotExistError,
};
