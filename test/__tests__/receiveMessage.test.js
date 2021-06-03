const startSQSComponent = require("../helpers/startSQSComponent");
const createSQSQueue = require("../helpers/createSQSQueue");
const deleteSQSQueue = require("../helpers/deleteSQSQueue");

const getLocalstackConfig = require("../fixtures/getLocalstackConfig");

let sqs;
let createQueue;
let deleteQueue;

const awsAccountId = "000000000000";

describe("Systemic sqs Component Tests", () => {
  beforeAll(async () => {
    sqs = await startSQSComponent(getLocalstackConfig());
    createQueue = createSQSQueue(sqs);
    deleteQueue = deleteSQSQueue(sqs);
  });

  it("should receive a message from the queue", async () => {
    const messageBody = "Example message";
    const queueName = "receiveMessageQueueName";
    await createQueue(queueName);
    const queueUrl = await sqs.getQueueUrl({
      queueName,
      awsAccountId,
    });
    await sqs.sendMessage({
      queueUrl,
      messageBody,
    });
    const res = await sqs.receiveMessage({
      queueUrl,
    });
    expect(res.Messages).toHaveLength(1);
    expect(res.Messages[0].Body).toBe(messageBody);

    await deleteQueue(queueName);
  });
});
