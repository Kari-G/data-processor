import { StackProps } from 'aws-cdk-lib';
import { AwsIntegration, EndpointType, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from "constructs";

export class ApiManager extends Construct {
  constructor(scope: Construct, id: string, queue: Queue, props?: StackProps) {
    super(scope, id);

    const api = new RestApi(this, "data-processor-api", {
      restApiName: "Data Processor API",
      description: "This API processes data.",
      endpointTypes: [EndpointType.REGIONAL]
    });

    api.root.addMethod("POST", this.getSendMessageIntegration(queue, props), {
      methodResponses: [{
        statusCode: "200",
      }],
    });
  }

  private getSendMessageIntegration = (queue: Queue, props?: StackProps): AwsIntegration => {
    const integrationRole = new Role(this, 'integration-role', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    });

    queue.grantSendMessages(integrationRole);

    const sendMessageIntegration = new AwsIntegration({
      service: 'sqs',
      region: props?.env?.region,
      path: `${props?.env?.account}/${queue.queueName}`,
      options: {
        credentialsRole: integrationRole,
        requestParameters: {
          'integration.request.header.Content-Type': `'application/x-www-form-urlencoded'`,
        },
        requestTemplates: {
          'application/json': 'Action=SendMessage&MessageBody=$input.body',
        },

        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              "application/json": "{\"body\": \"Message received.\"}"
          }
          },
        ]
      },
    });

    return sendMessageIntegration;
  };
}
