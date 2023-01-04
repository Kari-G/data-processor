import { Stack, StackProps } from 'aws-cdk-lib';
import { Queue, QueueEncryption } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { ApiManager } from './api/api-manager';
import { DataProcessorLambda } from './lambdas/lambda-data-processor';

export class DataProcessorStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const queue = new Queue(this, 'DataProcessorQueue', {
      encryption: QueueEncryption.KMS_MANAGED,
    });

    new ApiManager(this, "DataProcessorApiManager", queue, props);

    new DataProcessorLambda(this, "LambdaDataProcessor", queue, props);
  }
}
