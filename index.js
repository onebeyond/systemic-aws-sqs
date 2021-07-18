const debug = require("debug")("systemic-aws-sqs");
const { SQS, SQSClient } = require("@aws-sdk/client-sqs");

const commands = require("require-all")(__dirname + "/commands");

let client = null;
let aggregatedSQS = null;

module.exports = () => {
  const start = async ({ config }) => {
    debug("Initializing SQSClient");
    client = new SQSClient(config);
    aggregatedSQS = new SQS(config);

    return {
      client,
      commandExecutor: commands['commandExecutor'](aggregatedSQS),
    };
  };

  return {
    start,
  };
};
