const { ulid } = require("ulid");

class Transaction {
  constructor({
    transactionId,
    organization,
    merchantName,
    category,
    amount,
    transactionTime,
  }) {
    this.transactionId = transactionId
      ? transactionId
      : ulid(transactionTime.getTime());
    this.organization = organization;
    this.merchantName = merchantName;
    this.category = category;
    this.amount = amount;
    this.transactionTime = transactionTime;
  }

  keys() {
    return {
      organization: { S: this.organization },
      transactionId: { S: this.transactionId },
    };
  }

  toItem() {
    return {
      ...this.keys(),
      merchantName: { S: this.merchantName },
      category: { S: this.category },
      amount: { N: this.amount.toString() },
      transactionTime: { S: this.transactionTime.toISOString() },
    };
  }
}

const itemToTransaction = (item) => {
  return new Transaction({
    transactionId: item.transactionId.S,
    organization: item.organization.S,
    merchantName: item.merchantName.S,
    category: item.category.S,
    amount: parseFloat(item.amount.N),
    transactionTime: new Date(item.transactionTime.S),
  });
};

const rocksetRowToTransaction = (row) => {
  return new Transaction({
    transactionTime: new Date(row.transactionTime),
    ...row,
  });
};

module.exports = {
  Transaction,
  itemToTransaction,
  rocksetRowToTransaction,
};
