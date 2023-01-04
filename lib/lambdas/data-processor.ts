import { APIGatewayProxyResultV2, SQSEvent } from "aws-lambda";

const badRequestResponse: APIGatewayProxyResultV2 = {
  body: "Request is not valid. Please check the required fields for this request.",
  statusCode: 400,
};

type DataPair = {
  data1: number;
  data2: number;
};

const validateData = (dataPair: DataPair): string => {
  if (
    Object.keys(dataPair).length !== 2 ||
    !dataPair.data1 ||
    !dataPair.data2
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
): Promise<APIGatewayProxyResultV2> => {
  try {
    const dataPair: DataPair = JSON.parse(event.Records[0].body) as DataPair;

    const validationResult: string = validateData(dataPair);

    if (validationResult) {
      console.warn(validationResult);
      console.warn(event.Records[0].body);
      return badRequestResponse;
    }

    console.log("Data pair 👉");
    console.log(JSON.stringify(dataPair));

    if (dataPair.data1 >= dataPair.data2) {
      console.log("do something");
    }

    return {
      body: JSON.stringify({ messages: dataPair }),
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error happened during data processing.");
    console.error(JSON.stringify(error));

    return {
      body: JSON.stringify(error),
      statusCode: 500,
    };
  }
};
