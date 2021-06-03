const debug = require("debug")("systemic-aws-sqs");
const { ReceiveMessageCommand } = require("@aws-sdk/client-sqs");

module.exports =
  (client) =>
  async ({
    queueUrl,
    attributeNames,
    waitTimeSeconds,
    maxNumberOfMessages,
    receiveRequestAttemptId,
    messageAttributeNames,
    visibilityTimeout,
  }) => {
    debug("Calling ReceiveMessageCommand");
    const commandParams = {
      QueueUrl: queueUrl,
      AttributeNames: attributeNames || undefined,
      WaitTimeSeconds: waitTimeSeconds || undefined,
      MaxNumberOfMessages: maxNumberOfMessages || undefined,
      ReceiveRequestAttemptId: receiveRequestAttemptId || undefined,
      MessageAttributeNames: messageAttributeNames || undefined,
      VisibilityTimeout: visibilityTimeout || undefined,
    };

    const command = new ReceiveMessageCommand(commandParams);

    try {
      const data = await client.send(command);
      return data;
    } catch (error) {
      debug(`Error executing ReceiveMessageCommand: ${error.message}`);
      throw error;
    }
  };
