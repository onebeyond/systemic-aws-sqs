const startSQSComponent = require("../helpers/startSQSComponent");
const createSQSQueue = require("../helpers/createSQSQueue");
const deleteSQSQueue = require("../helpers/deleteSQSQueue");

const getLocalstackConfig = require("../fixtures/getLocalstackConfig");

let sqs;
let createQueue;
let deleteQueue;

const awsAccountId = "000000000000";

const sleep = (millis) => new Promise((resolve) => setTimeout(() => resolve(), millis));

describe.skip("Systemic sqs Component Tests", () => {
  beforeAll(async () => {
    sqs = await startSQSComponent(getLocalstackConfig());
    createQueue = createSQSQueue(sqs);
    deleteQueue = deleteSQSQueue(sqs);
  });

  it("should read a message from a queue and process it", async () => {
    const messageBody = "Example message";
    const queueName = "listenQueueQueueName";
    const onHandleMessage = jest.fn();
    await createQueue(queueName);

    const queueUrl = await sqs.getQueueUrl({
      queueName,
      awsAccountId,
    });
    await sqs.sendMessage({
      queueUrl,
      messageBody,
    });

    const listener = await sqs.listenQueue({
      queueUrl,
      awsAccountId,
      onHandleMessage,
      pollingPeriod: 1000,
    });
    listener.start();

    await pEvent(listener, 'messageProcessed')

    listener.stop();

    expect(onHandleMessage).toHaveBeenCalledWith('');
    await deleteQueue(queueName);
  });

  it("should delete a message from the queue if it was successfully processed", async () => {
    const messageBody = "Example message";
    const queueName = "listenQueueQueueName";
    const onHandleMessage = jest.fn();
    await createQueue(queueName);

    const queueUrl = await sqs.getQueueUrl({
      queueName,
      awsAccountId,
    });
    await sqs.sendMessage({
      queueUrl,
      messageBody,
    });

    const listener = await sqs.listenQueue({
      queueUrl,
      awsAccountId,
      onHandleMessage,
      pollingPeriod: 1000,
    });
    listener.start();

    await pEvent(listener, 'messageProcessed')

    listener.stop();

    const res = await sqs.receiveMessage({
      queueUrl,
    });
    expect(res.Messages).toHaveLength(0);

    await deleteQueue(queueName);
  });

  it("should process a message that was eventually inserted in the queue", async () => {
    const messageBody = "Example message";
    const queueName = "listenQueueQueueName";
    const onHandleMessage = jest.fn();
    await createQueue(queueName);

    const listener = await sqs.listenQueue({
      queueUrl,
      awsAccountId,
      onHandleMessage,
      pollingPeriod: 1000,
    });
    listener.start();

    await sleep(2000);

    const queueUrl = await sqs.getQueueUrl({
      queueName,
      awsAccountId,
    });
    await sqs.sendMessage({
      queueUrl,
      messageBody,
    });

    await pEvent(listener, 'messageProcessed')

    listener.stop();

    expect(onHandleMessage).toHaveBeenCalledWith('');
    await deleteQueue(queueName);
  });

  it("should not process any queue message after stopping listening", async () => {
    const messageBody = "Example message";
    const queueName = "listenQueueQueueName";
    const onHandleMessage = jest.fn();
    await createQueue(queueName);

    const sleep = (millis) => new Promise((resolve) => setTimeout(() => resolve(), millis));

    const listener = await sqs.listenQueue({
      queueUrl,
      awsAccountId,
      onHandleMessage,
      pollingPeriod: 1000,
    });

    listener.start();
    listener.stop();

    const queueUrl = await sqs.getQueueUrl({
      queueName,
      awsAccountId,
    });
    await sqs.sendMessage({
      queueUrl,
      messageBody,
    });

    await sleep(2000);

    const res = await sqs.receiveMessage({
      queueUrl,
    });
    expect(res.Messages).toHaveLength(1);

    await deleteQueue(queueName);
  });
});
