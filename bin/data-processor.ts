#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { DataProcessorStack } from "../lib/data-processor-stack";

export const SERVICE_NAME = "DataProcessor";

export enum Release {
  Dev = "Dev",
  Prod = "Prod",
}

const app = new cdk.App();

new DataProcessorStack(app, "Service" + SERVICE_NAME + "Stack" + Release.Dev, {
  env: { account: "271193253336", region: "eu-central-1" },
  release: Release.Dev,
});

// new DataProcessorStack(app, "Service" + SERVICE_NAME + "Stack" + Release.Prod, {
//   env: { account: "271193253336", region: "eu-central-1" },
//   release: Release.Prod,
// });
