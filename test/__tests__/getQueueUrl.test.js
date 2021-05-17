const startSQSComponent = require("../helpers/startSQSComponent");
const createSQSQueue = require("../helpers/createSQSQueue");
const deleteSQSQueue = require("../helpers/deleteSQSQueue");

const getLocalstackConfig = require("../fixtures/getLocalstackConfig");

let sqs;
let createQueue;
let deleteQueue;

describe("Systemic sqs Component Tests", () => {
  beforeAll(async () => {
    sqs = await startSQSComponent(getLocalstackConfig());
    createQueue = createSQSQueue(sqs);
    deleteQueue = deleteSQSQueue(sqs);
  });

  it("should return queue url", async () => {
    const awsAccountId = "000000000000";
    const queueName = "testQName";
    await createQueue(queueName);

    const res = await sqs.getQueueUrl({
      queueName,
      awsAccountId,
    });
    expect(res).toBe(`https://localhost/${awsAccountId}/${queueName}`);

    await deleteQueue(queueName);
  });
});
