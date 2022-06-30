const { getDynamoDBClient } = require("../clients/dynamodb");
const { getRocksetClient } = require("../clients/rockset");
const {
  Transaction,
  itemToTransaction,
  rocksetRowToTransaction,
} = require("./entities");
const { TransactionDoesNotExistError } = require("./errors");

const TABLE_NAME = process.env.TABLE_NAME;

class TransactionService {
  constructor(dynamoDBClient, rocksetClient) {
    this._dynamoDBClient = dynamoDBClient;
    this._rocksetClient = rocksetClient;
  }

  async createTransaction({
    organization,
    merchantName,
    category,
    amount,
    transactionTime,
  }) {
    const transaction = new Transaction({
      organization,
      merchantName,
      category,
      amount,
      transactionTime,
    });
    try {
      await this._dynamoDBClient
        .putItem({
          TableName: TABLE_NAME,
          Item: transaction.toItem(),
          ConditionExpression: "attribute_not_exists(Organization)",
        })
        .promise();

      return transaction;
    } catch (error) {
      throw error;
    }
  }

  async getTransaction({ organization, transactionId }) {
    const transaction = new Transaction({ organization, transactionId });

    const response = await this._dynamoDBClient
      .getItem({
        TableName: TABLE_NAME,
        Key: transaction.keys(),
      })
      .promise();

    if (!response.Item) {
      throw new TransactionDoesNotExistError(transactionId);
    }

    return itemToTransaction(response.Item);
  }

  async getTransactions({ organization }) {
    const response = await this._dynamoDBClient
      .query({
        TableName: TABLE_NAME,
        KeyConditionExpression: "organization = :organization",
        ExpressionAttributeValues: {
          ":organization": { S: organization },
        },
        ScanIndexForward: false,
        Limit: 20,
      })
      .promise();

    return response.Items.map((item) => itemToTransaction(item));
  }

  async filterTransactions({ organization, category, minAmount, maxAmount }) {
    const response = await this._rocksetClient.queries.query({
      sql: {
        query: `
              SELECT *
              FROM Transactions
              WHERE organization = :organization
              AND category = :category
              AND amount BETWEEN :minAmount AND :maxAmount
              ORDER BY transactionTime DESC
              LIMIT 20`,
        parameters: [
          {
            name: "organization",
            type: "string",
            value: organization,
          },
          {
            name: "category",
            type: "string",
            value: category,
          },
          {
            name: "minAmount",
            type: "float",
            value: minAmount,
          },
          {
            name: "maxAmount",
            type: "float",
            value: maxAmount,
          },
        ],
      },
    });
    return response.results.map((row) => rocksetRowToTransaction(row));
  }

  async fetchTransactionsByCategoryAndMonth({ organization }) {
    const response =
      await this._rocksetClient.queryLambdas.executeQueryLambdaByTag(
        "commons",
        "TransactionsByCategoryAndMonth",
        "latest",
        {
          parameters: [
            {
              name: "organization",
              type: "string",
              value: organization,
            },
          ],
        }
      );
    return response.results;
  }
}

let service = null;

module.exports.getTransactionService = (props) => {
  if (service) return service;

  let dynamoDBClient = (props || {}).dynamoDBClient;
  if (!dynamoDBClient) {
    dynamoDBClient = getDynamoDBClient();
  }

  let rocksetClient = (props || {}).rocksetClient;
  if (!rocksetClient) {
    rocksetClient = getRocksetClient();
  }

  service = new TransactionService(dynamoDBClient, rocksetClient);

  return service;
};
