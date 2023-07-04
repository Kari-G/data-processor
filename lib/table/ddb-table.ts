import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { ExtendedStackProps } from "../data-processor-stack";

export class DDBTable extends Construct {
  ddbTable: Table;

  constructor(scope: Construct, id: string, props: ExtendedStackProps) {
    super(scope, id);

    this.ddbTable = new Table(this, id, {
      tableName: "Table" + props.release,
      partitionKey: {
        name: "PK",
        type: AttributeType.STRING,
      },
    });
  }
}
