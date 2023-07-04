import { Stack, StackProps } from "aws-cdk-lib";
import { Queue, QueueEncryption } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { Release, SERVICE_NAME } from "../bin/data-processor";
import { ApiManager } from "./api/api-manager";
import { DataProcessorLambda } from "./lambdas/lambda-data-processor";
import { DDBTable } from "./table/ddb-table";

export interface ExtendedStackProps extends StackProps {
  release: Release;
}

export const generateID = (name: string, props: ExtendedStackProps): string => {
  return SERVICE_NAME + name + props.release;
};

export class DataProcessorStack extends Stack {
  constructor(scope: Construct, id: string, props: ExtendedStackProps) {
    super(scope, id, props);

    const queue = new Queue(this, generateID("Queue", props), {
      encryption: QueueEncryption.KMS_MANAGED,
    });

    new ApiManager(this, generateID("ApiManager", props), queue, props);

    const ddbTable = new DDBTable(this, generateID("Table", props), props);

    new DataProcessorLambda(
      this,
      generateID("Lambda", props),
      queue,
      ddbTable.ddbTable,
      props
    );
  }
}
