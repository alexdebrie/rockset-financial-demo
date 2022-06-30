const { getTransactionService } = require("../transactions/service");
const { makeHandler } = require("./utils");

const handler = async (event, context) => {
  const { transactionId } = event.pathParameters;
  const { Authorization: _organization } = event.headers;
  const organization = _organization.replace("Bearer ", "");

  const transactionServce = getTransactionService();

  const transaction = await transactionServce.getTransaction({
    organization,
    transactionId,
  });
  return {
    statusCode: 200,
    body: JSON.stringify({ transaction }),
  };
};

module.exports.handler = makeHandler({ handler });
