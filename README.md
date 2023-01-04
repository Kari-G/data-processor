# Welcome to data-processor project

This little project handles data pairs that arrives to its API.
API Gateway forwards this to a SQS queue.
Then a Lambda function processes the data pairs from SQS queue.
Lambda gathers records for a certain time, so it batch processes the requests.
