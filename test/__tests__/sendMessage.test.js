const crypto = require("crypto");

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

  it("send a message", async () => {
    const messageBody = "Example message";
    const queueName = "testQName1";
    await createQueue(queueName);
    const queueUrl = await sqs.getQueueUrl({
      queueName,
      awsAccountId,
    });
    const res = await sqs.sendMessage({
      queueUrl,
      messageBody,
    });
    const md5MessageBodySent = crypto
      .createHash("md5")
      .update(messageBody)
      .digest("hex");
    expect(res.$metadata.httpStatusCode).toBe(200); //enviado
    expect(res.MD5OfMessageBody).toBe(md5MessageBodySent); // comprobación de md5

    await deleteQueue(queueName);
  });
});
