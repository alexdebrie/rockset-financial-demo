const { getTransactionService } = require("../transactions/service");
const { makeHandler } = require("./utils");

const handler = async (event, context) => {
  const { Authorization: _organization } = event.headers;
  const organization = _organization.replace("Bearer ", "");

  const transactionServce = getTransactionService();

  const results = await transactionServce.fetchTransactionsByCategoryAndMonth({
    organization,
  });
  return {
    statusCode: 200,
    body: JSON.stringify({ results }),
  };
};

module.exports.handler = makeHandler({ handler });
