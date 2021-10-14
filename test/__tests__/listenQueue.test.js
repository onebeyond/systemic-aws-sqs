const pEvent = require('p-event');

const {
  startSQSComponent,
  createSQSQueue,
  deleteSQSQueue,
  getSQSQueueUrl,
  sendSQSMessage,
  receiveSQSMessage
} = require("../helpers");

const getLocalstackConfig = require("../fixtures/getLocalstackConfig");

let sqs;
let createQueue;
let deleteQueue;
let getQueueUrl;
let sendMessage;
let receiveMessage;

const awsAccountId = "000000000000";

const sleep = (millis) => new Promise((resolve) => setTimeout(() => resolve(), millis));

const getListenQueueParams = (queueName, awsAccountId, processMessage) => ({
  commandParams: {
    queueName,
    awsAccountId,
    processMessage,
  },
  commandName: 'listenQueue'
})

describe("Systemic sqs Component Tests", () => {
  beforeAll(async () => {
    sqs = await startSQSComponent(getLocalstackConfig());
    createQueue = createSQSQueue(sqs);
    deleteQueue = deleteSQSQueue(sqs);
    getQueueUrl = getSQSQueueUrl(sqs);
    sendMessage = sendSQSMessage(sqs);
    receiveMessage = receiveSQSMessage(sqs);
  });

  it("should read a message from a queue and process it", async () => {
    const messageBody = "Example message";
    const queueName = "listenQueueQueueName";
    const processMessage = jest.fn();
    await createQueue(queueName);

    const urlResponse = await getQueueUrl(queueName, awsAccountId);
    await sendMessage(urlResponse.QueueUrl, messageBody);

    const listener = await sqs.commandExecutor(getListenQueueParams(queueName, awsAccountId, processMessage))

    await listener.start();
    await pEvent(listener.events, 'messageProcessed')
    await listener.stop();

    expect(processMessage).toHaveBeenCalledTimes(1);
    expect(processMessage).toHaveBeenCalledWith(expect.objectContaining({
      Messages: [
          expect.objectContaining({ Body: messageBody })
      ]}));
    await deleteQueue(queueName);
  });

  it("should delete a message from the queue if it was successfully processed", async () => {
    const messageBody = "Example message";
    const queueName = "listenQueueQueueName";
    const processMessage = jest.fn();
    await createQueue(queueName);

    const urlResponse = await getQueueUrl(queueName, awsAccountId);
    await sendMessage(urlResponse.QueueUrl, messageBody);

    const listener = await sqs.commandExecutor(getListenQueueParams(queueName, awsAccountId, processMessage))

    await listener.start();
    await pEvent(listener.events, 'messageProcessed')
    await listener.stop();

    const res = await receiveMessage(urlResponse.QueueUrl)
    expect(res.Messages).toBeUndefined();

    await deleteQueue(queueName);
  });

  it("should process a message that was eventually inserted in the queue", async () => {
    const messageBody = "Example message";
    const queueName = "listenQueueQueueName";
    const processMessage = jest.fn();
    await createQueue(queueName);

    const listener = await sqs.commandExecutor(getListenQueueParams(queueName, awsAccountId, processMessage))

    await listener.start();

    await sleep(2000);

    const urlResponse = await getQueueUrl(queueName, awsAccountId);
    await sendMessage(urlResponse.QueueUrl, messageBody);

    await pEvent(listener.events, 'messageProcessed')

    await listener.stop();

    expect(processMessage).toHaveBeenCalledTimes(1);
    expect(processMessage).toHaveBeenCalledWith(expect.objectContaining({
      Messages: [
        expect.objectContaining({ Body: messageBody })
      ]}));

    await deleteQueue(queueName);
  });

  it("should not process any queue message after stopping listening", async () => {
    const messageBody = "Example message";
    const queueName = "listenQueueQueueName";
    const processMessage = jest.fn();
    await createQueue(queueName);

    const listener = await sqs.commandExecutor(getListenQueueParams(queueName, awsAccountId, processMessage))

    await listener.start();
    await listener.stop();

    const urlResponse = await getQueueUrl(queueName, awsAccountId);
    await sendMessage(urlResponse.QueueUrl, messageBody);

    await sleep(2000);

    const res = await receiveMessage(urlResponse.QueueUrl)
    expect(res.Messages).toHaveLength(1);

    await deleteQueue(queueName);
  });
});
