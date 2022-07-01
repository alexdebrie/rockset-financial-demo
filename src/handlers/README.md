## Handlers

The `handlers/` directory contains all the top-level handlers for our Lambda functions. The `serverless.yml` file specifies which function goes to which handler.

Generally, the Lambda handlers are narrowly focused on parsing incoming requests and returning outgoing responses. They don't contain business logic. Rather, business logic is contained within the [TransactionService class](./../transactions).

Each handler uses a [Middy.js](https://middy.js.org/) middleware to handle errors that are thrown from the application. If the error is a subclass of `KnownError`, the middleware will transform the error into an API Gateway response object with a relevant status code and message. The middleware code can be found in the [utils.js file](./utils.js).
