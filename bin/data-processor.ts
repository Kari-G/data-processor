#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { DataProcessorStack } from '../lib/data-processor-stack';

export const SERVICE_NAME = "DataProcessor";

const app = new cdk.App();

new DataProcessorStack(app, "Service" + SERVICE_NAME + "Stack", {
  env: { account: "271193253336", region: "eu-central-1" },
});
