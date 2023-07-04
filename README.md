# Welcome to my project in which I save energy by optimizing the ventilation of rooms.

Households often waste electricity due to improper timing of room ventilation. For instance, people may need to open windows at night and close them in the morning during the summer to prevent hot air from entering. This, in turn, increases the operating hours of air conditioning units and leads to higher electricity bills.

In this project, I propose using two temperature sensors connected to an IoT device. One sensor is placed inside the house, while the other is located outside, in an area shielded from direct sunlight throughout the day. The IoT device collects temperature data from these sensors and sends it to the backend, which is housed in this repository.

The project's backend receives data pairs through its API. The API Gateway then forwards this data to an SQS queue. A Lambda function processes the data pairs from the SQS queue. The Lambda function collects records for a specific time period, allowing it to batch process requests and store the data pairs in DynamoDB.

As a future feature, this backend will send two daily emails to the user. One email will indicate the optimal time to open the windows, while the other will provide the ideal time to close them.

API Gateway -> SQS queue -> Lambda -> DynamoDB
                                  (-> Email to user)
