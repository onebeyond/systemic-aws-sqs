const debug = require("debug")("systemic-aws-sqs");
const { SendMessageCommand } = require("@aws-sdk/client-sqs");

module.exports =
  (client) =>
  async ({
    queueUrl,
    messageBody,
    delayseconds,
    messageAttributes,
    messageDeduplicationId,
    messageGroupId,
    messageSystemAttributes,
  }) => {
    debug("Calling SendMessageCommand");
    const commandParams = {
      QueueUrl: queueUrl,
      MessageBody: messageBody,
      DelaySeconds: delayseconds || undefined,
      MessageAttributes: messageAttributes || undefined,
      MessageDeduplicationId: messageDeduplicationId || undefined,
      MessageGroupId: messageGroupId || undefined,
      MessageSystemAttributes: messageSystemAttributes || undefined,
    };

    const command = new SendMessageCommand(commandParams);

    try {
      const data = await client.send(command);
      return data;
    } catch (error) {
      debug(`Error executing SendMessageCommand: ${error.message}`);
      throw error;
    }
  };
