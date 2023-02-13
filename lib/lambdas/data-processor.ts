import Ajv, { JSONSchemaType } from "ajv";
import { APIGatewayProxyStructuredResultV2, SQSEvent } from "aws-lambda";

const ajv = new Ajv({ allErrors: true });

type DataPair = {
  data1: number;
  data2: number;
};

const DATA1_FIELD = "data1";
const DATA2_FIELD = "data2";

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

    let currentValue: number = 0;
    dataPairs.forEach((dataPair) => {
      currentValue = currentValue + dataPair.data1 - dataPair.data2;
    });

    if (currentValue > 0) {
      console.log("Do something");
    }

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
