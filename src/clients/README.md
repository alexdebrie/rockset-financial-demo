## Clients

The `clients/` directory includes clients to interact with external services. In this application, those services are DynamoDB and Rockset.

Centralizing client creation logic helps in two aspects:

1. It allows us to provide client configuration options in a single location, rather than scattered across each module that needs the client.

2. It allows us to reuse an instance of a client across Lambda invocations, which will take advantage of HTTP connection reuse and result in faster responses.
