## Using Rockset for advanced DynamoDB queries

This repository contains an example FinTech application that combines Amazon DynamoDB with Rockset. DynamoDB is used for the core features around the application, such as recording transactions and viewing a feed of most recent transactions. Rockset supplements these core features with delightful features such as allowing users to filter their data or perform aggregations.

To understand the application and the fundamental concepts further, check out the corresponding walkthrough that goes with this application.

## Table of Contents

- [Usage](#usage)
  - [Seeding with data](#seeding-with-data)
- [Integrating with Rockset](#integrating-with-rockset)
  - [Create a DynamoDB integration in Rockset](#create-a-dynamodb-integration-in-rockset)
  - [Create a Rockset collection](#creating-a-rockset-collection)
  - [Add a Rockset API key to our application](#adding-a-rockset-api-key-to-your-application)
  - [Configure a Query Lambda in Rockset](#configuring-a-query-lambda-in-rockset)
- [Clean up](#clean-up)

## Usage

This application is a serverless application using Rockset, DynamoDB, AWS Lambda, and AWS API Gateway. It is deployed using the [Serverless Framework](https://www.serverless.com/).

Before you deploy, you will need to install the Serverless Framework. You can do so with the following command:

```bash
npm install -g serverless
```

You will also need AWS credentials that allow you to deploy a project to AWS. You can follow the [Serverless guide to AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials) if you need them.

Once you have Serverless installed and your credentials configured, you can deploy your application using the following command:

```bash
sls deploy
```

After the deployment is complete, you'll see information about your deployed application. This will include the registered endpoints as below:

```
endpoints:
  POST - https://6qaymrfunl.execute-api.us-east-1.amazonaws.com/dev/transactions
  GET - https://6qaymrfunl.execute-api.us-east-1.amazonaws.com/dev/transactions
  GET - https://6qaymrfunl.execute-api.us-east-1.amazonaws.com/dev/transactions/{transactionId}
  GET - https://6qaymrfunl.execute-api.us-east-1.amazonaws.com/dev/filterTransactions
  GET - https://6qaymrfunl.execute-api.us-east-1.amazonaws.com/dev/transactionsByCategory
```

Notice that five endpoints are displayed. However, only the first three endpoints are currently functional. You will need to follow the instructions to [integrate with Rockset](#integrating-with-rockset) and [configuring a Query Lambda](#configuring-a-query-lambda-in-rockset) below for the last two to work.

If you want to interact with the endpoints, you can find pre-configured Postman and Insomnia collections in the [`collections/`](./collections) directory.

Each endpoint has a base URL. The one above is `https://6qaymrfunl.execute-api.us-east-1.amazonaws.com/dev`, but it will be slightly different for your deployment. Be sure to save this endpoint as a `baseUrl` variable in Postman or Insomnia to use across requests.

### Seeding with data

You can use the collections mentioned above to record a bunch of transactions, but that can be slow.

If you want to seed your table with a lot of random data, you can use the [`seed.mjs`](./seed.mjs) script in this repository.

Before you do, set an environment variable of `ENDPOINT` that contains the full URL for the `recordTransaction` endpoint:

```bash
export ENDPOINT=https://6qaymrfunl.execute-api.us-east-1.amazonaws.com/dev/transactions
```

Then, execute the `seed.mjs` script with the following command:

```bash
node seed.mjs
```

Each time you execute the script, it will record 100 random transactions for one of three organizations: Rockset, Acme Corp., and Vandelay Industries.

After you have seeded with initial data, you can use the read-based operation to browse transactions for one of the organizations.

## Integrating with Rockset

The instructions above will configure the resources for the core features of the application, but we still need to integrate with Rockset. To do that, we need to:

- [Create a DynamoDB integration in Rockset](#create-a-dynamodb-integration-in-rockset)
- [Create a Rockset collection](#creating-a-rockset-collection)
- [Add a Rockset API key to our application](#adding-a-rockset-api-key-to-your-application)
- [Configure a Query Lambda in Rockset](#configuring-a-query-lambda-in-rockset)

Before we get started, you will need to [create a Rockset account](https://rockset.com/create/) if you don't already have one.

### Create a DynamoDB integration in Rockset

Let's create our DynamoDB integration. Navigate to the [New Integration](https://console.rockset.com/integrations/new?path=dynamodb) page in the Rockset console, and click the Start button to create a DynamoDB integration.

Give your integration a name (I'm using "FinTech"). Then, scroll to the bottom of the page. The page includes some step-by-step instructions for creating the AWS resources you need for Rockset to access your table, but we're going to do it with infrastructure-as-code.

At the bottom of the page, find the Rockset Account ID and the External ID.

![Rockset Account ID and External ID](https://user-images.githubusercontent.com/6509926/176739036-4a7a78b4-a64f-4c09-9eb1-31ed3f46e3d7.png)

Copy these values into the corresponding places on lines 6 and 7 in your [serverless.yml](./serverless.yml) file.

Then, uncomment lines 71 - 122 in your `serverless.yml` file. This will create an S3 bucket for your initial DynamoDB table export, an IAM user, and an IAM policy that will give access to Rockset. It will also register some CloudFormation outputs that you will use for your Rockset configuration.

Run a deployment to create these resources:

```bash
sls deploy
```

After the deployment is complete, run the following command to display your Output values:

```bash
sls info --verbose
```

Find the values for `RocksetExportBucketName` and `RocksetIAMRoleArn`. Copy and paste them into the proper place in Rockset's DynamoDB Integration creation page.

![Rockset Account ID and External ID](https://user-images.githubusercontent.com/6509926/176747142-48fc5d54-f2c3-4949-9374-2a971b83d654.png)

Then, click Save Integration.

### Creating a Rockset collection

Our DynamoDB integration allows Rockset to access our DynamoDB table. Now we need to create a collection in Rockset to ingest that data and begin indexing.

Navigate to the [Collections section](https://console.rockset.com/collections/new?selected=dynamodb) of the Rockset console to create a new DynamoDB collection. Select your newly created 'FinTech' integration and click Start.

Give your collection a name of 'FinTech' and keep it in the 'commons' collection for now.

You will need to enter the table name of your DynamoDB table for the collection. From the output of the `sls info --verbose` command, find the value for `TransactionsTableName`. Paste that value into the DynamoDB Table Name configuration.

![Rockset Collection Creation](https://user-images.githubusercontent.com/6509926/176748119-491327ad-e72c-499e-98e9-b022cb1d8594.png)

You will also need to select the AWS region for your DynamoDB table.

The other default configuration should work. Head to the bottom and click Create.

This will begin the ingestion process. It will take 5 - 10 minutes for the initial ingestion, as it waits for DynamoDB to create an S3 export. While that is happening, you can move on to the API key step.

### Adding a Rockset API Key to your application

Next, we need to add an API key to our application so that we can call the Rockset API from our application.

Navigate to the [API keys section](https://console.rockset.com/apikeys) of the Rockset console.

Click the Create API Key button, and give your key a name. Then, copy the value in the `Key` column of the API keys table.

For simplicity of this demo, we will inject the API key into our application as an environment variable. Paste the value of your key into line 8 of your [serverless.yml](./serverless.yml) file.

In a real application, you would want to use something like [Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) or [Secrets Manager](https://aws.amazon.com/secrets-manager/) to handle your application secrets.

### Configuring a Query Lambda in Rockset

The last thing we need to do is configure a Query Lambda in Rockset. This will handle the aggregation query in our `transactionsByCategory` endpoint.

Navigate to the [Queries](https://console.rockset.com/query) section of the Rockset console. Then, paste the following query into the Query Editor:

```sql
SELECT
    category,
    EXTRACT(
        month
        FROM
            PARSE_DATETIME_ISO8601(transactionTime)
    ) as month,
    EXTRACT(
        year
        FROM
            PARSE_DATETIME_ISO8601(transactionTime)
    ) as year,
    TRUNCATE(sum(amount), 2) AS amount
FROM
    Transactions
WHERE
    organization = :organization
    AND PARSE_DATETIME_ISO8601(transactionTime) > CURRENT_TIMESTAMP() - INTERVAL 3 MONTH
GROUP BY
    category,
    month,
    year
ORDER BY
    category,
    month,
    year DESC
```

Then, click the `Save As` button, and select `Save as Query Lambda`.

Give your Query Lambda a name of `TransactionsByCategoryAndMonth` and keep it in the `commons` workspace. Click the Create Query Lambda button to save.

Finally, update your serverless application by running a new deployment:

```bash
sls deploy
```

You can now use the `filterTransactions` and `transactionsByCategory` endpoints in your application.

## Clean up

After you are done with the application, you can delete the stack.

Before you do so, you will need to empty your Rockset Export S3 bucket, as CloudFormation will not remove a bucket that contains objects.

To remove all items in the bucket, execute the following command:

```bash
aws s3 rm s3://${BUCKET_NAME} --recursive
```

Be sure to replace `${BUCKET_NAME}` with the name of your S3 bucket.

Once the bucket is empty, you can remove the entire application with the following command:

```bash
sls remove
```
