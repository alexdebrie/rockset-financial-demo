const { getTransactionService } = require("../transactions/service");
const { makeHandler } = require("./utils");

const handler = async (event, context) => {
  const { Authorization: _organization } = event.headers;
  const organization = _organization.replace("Bearer ", "");

  const transactionServce = getTransactionService();

  const transactions = await transactionServce.getTransactions({
    organization,
  });
  return {
    statusCode: 200,
    body: JSON.stringify({ transactions }),
  };
};

module.exports.handler = makeHandler({ handler });
