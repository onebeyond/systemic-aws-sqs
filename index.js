const debug = require("debug")("systemic-aws-sqs");
const { SQSClient } = require("@aws-sdk/client-sqs");

const commands = require("require-all")(__dirname + "/commands");

let client = null;

module.exports = () => {
  const start = async ({ config }) => {
    debug("Initializing SQSClient");
    client = new SQSClient(config);

    return {
      client,
      getQueueUrl: commands["getQueueUrl"](client),
    };
  };

  return {
    start,
  };
};
