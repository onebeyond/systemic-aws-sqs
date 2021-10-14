const crypto = require("crypto");


const {
  startSQSComponent,
  createSQSQueue,
  deleteSQSQueue,
} = require("../helpers");

const getLocalstackConfig = require("../fixtures/getLocalstackConfig");

let sqs;
let createQueue;
let deleteQueue;

describe("Systemic SQS - commandExecutor function", () => {
  beforeAll(async () => {
    sqs = await startSQSComponent(getLocalstackConfig());
    createQueue = createSQSQueue(sqs);
    deleteQueue = deleteSQSQueue(sqs);
  });

  it("should execute the \"getQueueUrl\" command and retrieve it", async () => {
    const awsAccountId = "000000000000";
    const queueName = "testQName";
    await createQueue(queueName);

    const commandParams = { QueueName: queueName, AwsAccountId: awsAccountId }
    const res = await sqs.commandExecutor({ commandParams, commandName: 'getQueueUrl' });

    expect(res.QueueUrl).toBe(`http://localhost/${awsAccountId}/${queueName}`);

    await deleteQueue(queueName);
  });

  it("should execute the \"receiveMessage\" command and receive a message from the queue", async () => {
    const awsAccountId = "000000000000";
    const messageBody = "Example message";
    const queueName = "receiveMessageQueueName";

    await createQueue(queueName);

    const getUrlCommandParams = { QueueName: queueName, AwsAccountId: awsAccountId }
    const urlResponse = await sqs.commandExecutor({ commandParams: getUrlCommandParams, commandName: 'getQueueUrl' });

    const sendMessageCommandParams = { QueueUrl: urlResponse.QueueUrl, MessageBody: messageBody }
    await sqs.commandExecutor({ commandParams: sendMessageCommandParams, commandName: 'sendMessage' });

    const res = await sqs.commandExecutor({ commandParams: { QueueUrl: urlResponse.QueueUrl }, commandName: 'receiveMessage' });

    expect(res.Messages).toHaveLength(1);
    expect(res.Messages[0].Body).toBe(messageBody);

    await deleteQueue(queueName);
  });

  it("should execute the \"sendMessage\" command and send a message", async () => {
    const awsAccountId = "000000000000";
    const messageBody = "Example message";
    const queueName = "testQName1";
    await createQueue(queueName);

    const getUrlCommandParams = { QueueName: queueName, AwsAccountId: awsAccountId }
    const urlResponse = await sqs.commandExecutor({ commandParams: getUrlCommandParams, commandName: 'getQueueUrl' });

    const sendMessageCommandParams = { QueueUrl: urlResponse.QueueUrl, MessageBody: messageBody }
    const res = await sqs.commandExecutor({ commandParams: sendMessageCommandParams, commandName: 'sendMessage' });

    const md5MessageBodySent = crypto
        .createHash("md5")
        .update(messageBody)
        .digest("hex");
    expect(res.$metadata.httpStatusCode).toBe(200); //enviado
    expect(res.MD5OfMessageBody).toBe(md5MessageBodySent); // comprobación de md5

    await deleteQueue(queueName);
  });
});
