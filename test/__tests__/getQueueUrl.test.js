const { CreateQueueCommand } = require("@aws-sdk/client-sqs");

const initSqs = require("../../index");

const sqsComponent = initSqs();

let sqs;

describe("Systemic sqs Component Tests", () => {
  beforeAll(async () => {
    sqs = await sqsComponent.start({
      config: {
        region: "us-east-1",
        endpoint: "http://localhost:4566",
        credentials: {
          secretAccessKey: "test",
          accessKeyId: "test",
        },
      },
    });
  });

  // http --> https

  it("should return queue url", async () => {
    const awsAccountId = "000000000000";
    const queueName = "testQName";
    await sqs.client.send(new CreateQueueCommand({ QueueName: queueName }));

    const res = await sqs.getQueueUrl({
      queueName,
      awsAccountId: awsAccountId,
    });
    expect(res).toBe("http://localhost" + "/" + awsAccountId + "/" + queueName);
  });
});
