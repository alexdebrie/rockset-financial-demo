const { getTransactionService } = require("../transactions/service");
const { makeHandler } = require("./utils");

const handler = async (event, context) => {
  const {
    merchantName,
    category,
    amount,
    transactionTime: _transactionTime,
  } = JSON.parse(event.body);
  const transactionTime = new Date(_transactionTime);
  const { Authorization: _organization } = event.headers;
  const organization = _organization.replace("Bearer ", "");

  const transactionServce = getTransactionService();

  const transaction = await transactionServce.createTransaction({
    organization,
    merchantName,
    category,
    amount,
    transactionTime,
  });
  return {
    statusCode: 200,
    body: JSON.stringify({ transaction }),
  };
};

module.exports.handler = makeHandler({ handler });
