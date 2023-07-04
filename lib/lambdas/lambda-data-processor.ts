import { Duration } from "aws-cdk-lib";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { join } from "path";
import { ExtendedStackProps } from "../data-processor-stack";

export class DataProcessorLambda extends Construct {
  dataProcessor: Function;
  constructor(
    scope: Construct,
    id: string,
    queue: Queue,
    table: Table,
    props: ExtendedStackProps
  ) {
    super(scope, id);

    this.dataProcessor = new NodejsFunction(this, id, {
      runtime: Runtime.NODEJS_18_X,
      entry: join(__dirname, "data-processor.ts"),
      functionName: id,
      environment: {
        REGION: props.env?.region
          ? props.env.region
          : "RegionWontAddItselfToEnv",
        ACCOUNT: props.env?.account
          ? props.env.account
          : "AccountWontAddItselfToEnv",
        RELEASE: props.release,
      },
    });

    this.dataProcessor.addEventSource(
      new SqsEventSource(queue, {
        maxBatchingWindow: Duration.minutes(5),
      })
    );

    table.grantReadWriteData(this.dataProcessor);
  }
}
