const debug = require("debug")("systemic-aws-s3");
const { GetQueueUrlCommand } = require("@aws-sdk/client-sqs");

module.exports = (client) => async ({ queueName, awsAccountId }) => {
  debug("Calling GetQueueUrlCommand");
  const commandParams = {
    QueueName: queueName,
    QueueOwnerAWSAccountId: awsAccountId || undefined,
  };

  const command = new GetQueueUrlCommand(commandParams);

  try {
    const data = await client.send(command);
    return data.QueueUrl;
  } catch (error) {
    debug(`Error executing GetQueueUrlCommand: ${error.message}`);
    throw error;
  }
};
