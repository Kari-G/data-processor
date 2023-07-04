import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import Ajv, { JSONSchemaType } from "ajv";
import { APIGatewayProxyStructuredResultV2, SQSEvent } from "aws-lambda";

const ajv = new Ajv({ allErrors: true });

type DataPair = {
  data1: number;
  data2: number;
};

const DATA1_FIELD = "data1";
const DATA2_FIELD = "data2";

const deviceID = "randomDeviceID";

export const processDataSchema: JSONSchemaType<DataPair> = {
  type: "object",
  properties: {
    [DATA1_FIELD]: { type: "number" },
    [DATA2_FIELD]: { type: "number" },
  },
  required: [DATA1_FIELD, DATA2_FIELD],
  additionalProperties: false,
};

export const validateSchema = (schema: any, data: any) => {
  const validate = ajv.compile(schema);

  if (validate(data)) {
    return true;
  }

  console.warn(ajv.errorsText(validate.errors));
  console.warn(data);
  return false;
};

const DDBClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

const DDBDocClient = DynamoDBDocumentClient.from(DDBClient);

export const handler = async (
  event: SQSEvent
): Promise<APIGatewayProxyStructuredResultV2> => {
  try {
    const parsedBody = event.Records.filter((record) => {
      if (!record.body) {
        return false;
      }
      return true;
    }).map((record) => JSON.parse(record.body));

    let validData: any[] = [];
    for (const dataPair of parsedBody) {
      const isDataPairValid: boolean = validateSchema(
        processDataSchema,
        dataPair
      );

      isDataPairValid && validData.push(dataPair);
    }

    if (validData.length === 0) {
      const warningMessage = "There is no valid data that can be processed.";
      console.warn(warningMessage);
      return {
        body: warningMessage,
        statusCode: 400,
      };
    }

    const dataPairs: DataPair[] = validData as DataPair[];

    console.log("Data pairs 👉");
    console.log(JSON.stringify(dataPairs));

    let averageDataPair: DataPair = {
      data1: 0,
      data2: 0,
    };

    dataPairs.forEach((dataPair) => {
      averageDataPair.data1 += dataPair.data1;
      averageDataPair.data2 += dataPair.data2;
    });

    averageDataPair = {
      data1: averageDataPair.data1 / dataPairs.length,
      data2: averageDataPair.data2 / dataPairs.length,
    };

    const avgDataPairToPut = {
      PK: deviceID + "#" + new Date().toISOString(),
      created: new Date().toISOString(),
      id: deviceID,
      ...averageDataPair,
    };

    console.log("avgDataPairToPut:");
    console.log(avgDataPairToPut);

    const putCommand = new PutCommand({
      ConditionExpression: "attribute_not_exists(PK)",
      Item: avgDataPairToPut,
      TableName: "Table" + process.env.RELEASE,
    });

    const putResult = await DDBDocClient.send(putCommand);

    console.log("putResult:");
    console.log(putResult);

    return {
      body: "SQS doesnt care about this message",
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error happened during data processing.");
    console.error(error);

    return {
      body: JSON.stringify(error),
      statusCode: 500,
    };
  }
};
