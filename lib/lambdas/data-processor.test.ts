import {
  APIGatewayProxyStructuredResultV2,
  SQSEvent,
  SQSRecord
} from "aws-lambda";
import { handler } from "./data-processor";

let recordObject: SQSRecord = {
  messageId: "abcd01234",
  receiptHandle: "receiptHandle",
  body: '{\n\t"data1": 5,\n\t"data2": 0\n}',
  attributes: {
    ApproximateReceiveCount: "2",
    SentTimestamp: "SentTimestamp",
    SenderId: "SenderId",
    ApproximateFirstReceiveTimestamp: "ApproximateFirstReceiveTimestamp",
  },
  messageAttributes: {},
  md5OfBody: "zzz",
  eventSource: "aws:sqs",
  eventSourceARN: "arn:aws:sqs:eu-central-1:xxx:yyy",
  awsRegion: "eu-central-1",
};

const event: SQSEvent = {
  Records: [recordObject],
};

beforeEach(() => {
  jest.clearAllMocks();
  console.log = jest.fn(console.log);
  console.warn = jest.fn(console.warn);
});

describe("Data processor handler runs with", () => {
  describe("proper input with single record", () => {
    it("returns statuscode 200", async () => {
      const response: APIGatewayProxyStructuredResultV2 = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(console.warn).not.toBeCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("Do something")
      );
    });
  });

  describe("proper input with multiple record", () => {
    it("returns statuscode 200", async () => {
      const eventWithMultipleRecords: SQSEvent = {
        Records: [recordObject, recordObject],
      };
      const response: APIGatewayProxyStructuredResultV2 = await handler(
        eventWithMultipleRecords
      );

      expect(response.statusCode).toBe(200);
      expect(console.warn).not.toBeCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("Do something")
      );
    });
  });

  describe("incorrect body", () => {
    const eventWithNotValidBody: SQSEvent = {
      Records: [
        {
          ...recordObject,
          body: '{\n\t"data1": 5,\n\t"data2": 0,\n\t"data3": -5\n}',
        },
      ],
    };

    it("returns statuscode 400", async () => {
      const response: APIGatewayProxyStructuredResultV2 = await handler(
        eventWithNotValidBody
      );

      expect(response.statusCode).toBe(400);
      expect(console.warn).toBeCalled();
    });
  });

  describe("no body", () => {
    const eventWithNotValidBody: SQSEvent = {
      Records: [
        {
          ...recordObject,
          body: "",
        },
      ],
    };

    it("returns statuscode 400", async () => {
      const response: APIGatewayProxyStructuredResultV2 = await handler(
        eventWithNotValidBody
      );

      expect(response.statusCode).toBe(400);
      expect(console.warn).toBeCalled();
    });
  });
});
