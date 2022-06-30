const { getTransactionService } = require("../transactions/service");
const { makeHandler } = require("./utils");

const handler = async (event, context) => {
  const {
    category,
    minAmount = 0,
    maxAmount = 1000,
  } = event.queryStringParameters;
  const { Authorization: _organization } = event.headers;
  const organization = _organization.replace("Bearer ", "");

  const transactionServce = getTransactionService();

  const transactions = await transactionServce.filterTransactions({
    organization,
    category,
    minAmount,
    maxAmount,
  });
  return {
    statusCode: 200,
    body: JSON.stringify({ transactions }),
  };
};

module.exports.handler = makeHandler({ handler });
