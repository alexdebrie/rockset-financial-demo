const AWS = require("aws-sdk");

let client = null;

const getDynamoDBClient = () => {
  if (client) return client;
  client = new AWS.DynamoDB({
    httpOptions: {
      connectTimeout: 1000,
      timeout: 1000,
    },
  });
  return client;
};

module.exports = {
  getDynamoDBClient,
};
