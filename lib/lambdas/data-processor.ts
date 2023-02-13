import { APIGatewayProxyStructuredResultV2, SQSEvent } from "aws-lambda";

type DataPair = {
  data1: number;
  data2: number;
};

const validateData = (dataPair: DataPair): string => {
  if (
    Object.keys(dataPair).length !== 2 ||
    Object.keys(dataPair)[0] !== "data1" ||
    Object.keys(dataPair)[1] !== "data2"
  ) {
    return "Validation error. Please check the required fields for this request.";
  }

  if (
    typeof dataPair.data1 !== "number" ||
    typeof dataPair.data2 !== "number"
  ) {
    return "Validation error. Values must be numbers in this request.";
  }
  return "";
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
    parsedBody.forEach((dataPair) => {
      const validationResult: string = validateData(dataPair);

      if (!validationResult) {
        validData.push(dataPair);
        return;
      }
      console.warn(validationResult);
      console.warn(dataPair);
    });

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
