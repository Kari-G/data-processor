import { Duration, StackProps } from "aws-cdk-lib";
import { Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { join } from "path";

export class DataProcessorLambda extends Construct {
  dataProcessor: Function;
  constructor(scope: Construct, id: string, queue: Queue, props?: StackProps) {
    super(scope, id);

    this.dataProcessor = new NodejsFunction(this, "DataProcessorHandler", {
      runtime: Runtime.NODEJS_18_X,
      entry: join(__dirname, "data-processor.ts"),
      functionName: "DataProcessorHandlerProd",
      environment: {
        REGION: props?.env?.region
          ? props.env.region
          : "RegionWontAddItselfToEnv",
        ACCOUNT: props?.env?.account
          ? props.env.account
          : "AccountWontAddItselfToEnv",
      },
    });

    this.dataProcessor.addEventSource(
      new SqsEventSource(queue, {
        maxBatchingWindow: Duration.minutes(5),
      })
    );
  }
}
