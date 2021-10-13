const pEvent = require('p-event');

const startSQSComponent = require("../helpers/startSQSComponent");
const createSQSQueue = require("../helpers/createSQSQueue");
const deleteSQSQueue = require("../helpers/deleteSQSQueue");

const getLocalstackConfig = require("../fixtures/getLocalstackConfig");

let sqs;
let createQueue;
let deleteQueue;

const awsAccountId = "000000000000";

const sleep = (millis) => new Promise((resolve) => setTimeout(() => resolve(), millis));

describe("Systemic sqs Component Tests", () => {
  beforeAll(async () => {
    sqs = await startSQSComponent(getLocalstackConfig());
    createQueue = createSQSQueue(sqs);
    deleteQueue = deleteSQSQueue(sqs);
  });

  it("should read a message from a queue and process it", async () => {
    const messageBody = "Example message";
    const queueName = "listenQueueQueueName";
    const processMessage = jest.fn();
    await createQueue(queueName);

    const getUrlCommandParams = { QueueName: queueName, AwsAccountId: awsAccountId }
    const urlResponse = await sqs.commandExecutor({ commandParams: getUrlCommandParams, commandName: 'getQueueUrl' });

    const sendMessageCommandParams = { QueueUrl: urlResponse.QueueUrl, MessageBody: messageBody }
    await sqs.commandExecutor({ commandParams: sendMessageCommandParams, commandName: 'sendMessage' });

    const listener = await sqs.listenQueue({
      queueName,
      awsAccountId,
      processMessage,
      pollingPeriod: 1000,
    });
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

    const getUrlCommandParams = { QueueName: queueName, AwsAccountId: awsAccountId }
    const urlResponse = await sqs.commandExecutor({ commandParams: getUrlCommandParams, commandName: 'getQueueUrl' });

    const sendMessageCommandParams = { QueueUrl: urlResponse.QueueUrl, MessageBody: messageBody }
    await sqs.commandExecutor({ commandParams: sendMessageCommandParams, commandName: 'sendMessage' });

    const listener = await sqs.listenQueue({
      queueName,
      awsAccountId,
      processMessage,
      pollingPeriod: 1000,
    });
    await listener.start();

    await pEvent(listener.events, 'messageProcessed')

    await listener.stop();

    const receiveMessageCommandParams = { QueueUrl: urlResponse.QueueUrl }
    const res = await sqs.commandExecutor({ commandParams: receiveMessageCommandParams, commandName: 'receiveMessage' });
    expect(res.Messages).toBeUndefined();

    await deleteQueue(queueName);
  });

  it("should process a message that was eventually inserted in the queue", async () => {
    const messageBody = "Example message";
    const queueName = "listenQueueQueueName";
    const processMessage = jest.fn();
    await createQueue(queueName);

    const listener = await sqs.listenQueue({
      queueName,
      awsAccountId,
      processMessage,
      pollingPeriod: 1000,
    });
    await listener.start();

    await sleep(2000);

    const getUrlCommandParams = { QueueName: queueName, AwsAccountId: awsAccountId }
    const urlResponse = await sqs.commandExecutor({ commandParams: getUrlCommandParams, commandName: 'getQueueUrl' });

    const sendMessageCommandParams = { QueueUrl: urlResponse.QueueUrl, MessageBody: messageBody }
    await sqs.commandExecutor({ commandParams: sendMessageCommandParams, commandName: 'sendMessage' });

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

    const listener = await sqs.listenQueue({
      queueName,
      awsAccountId,
      processMessage,
      pollingPeriod: 1000,
    });

    await listener.start();
    await listener.stop();

    const getUrlCommandParams = { QueueName: queueName, AwsAccountId: awsAccountId }
    const urlResponse = await sqs.commandExecutor({ commandParams: getUrlCommandParams, commandName: 'getQueueUrl' });

    const sendMessageCommandParams = { QueueUrl: urlResponse.QueueUrl, MessageBody: messageBody }
    await sqs.commandExecutor({ commandParams: sendMessageCommandParams, commandName: 'sendMessage' });

    await sleep(2000);

    const receiveMessageCommandParams = { QueueUrl: urlResponse.QueueUrl }
    const res = await sqs.commandExecutor({ commandParams: receiveMessageCommandParams, commandName: 'receiveMessage' });
    expect(res.Messages).toHaveLength(1);

    await deleteQueue(queueName);
  });
});
