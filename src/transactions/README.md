## Transactions Service

The `transactions/` directory includes the Transaction Service business logic and objects.

The exported `getTransactionService` function will initialize or retrieve an instance of the TransactionService class. This function will [reuse client instances](../clients/) to ease usage and improve performance of the TransactionService.

The [`entities/`](./entities/) directory includes objects for the Transaction entity in this service. The object has a method to serialize into a DynamoDB item, and the module includes functions to deserialize from DynamoDB items or Rockset records into Transaction objects.
