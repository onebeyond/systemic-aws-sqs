const debug = require('debug')('systemic-aws-sqs');
const path = require('path')
const { SQS, SQSClient } = require('@aws-sdk/client-sqs');

const commands = require('require-all')(path.join(__dirname, '/commands'));

let client = null;
let aggregatedSQS = null;

module.exports = () => {
  const start = async ({ config }) => {
    debug('Initializing SQSClient');
    client = new SQSClient(config);
    aggregatedSQS = new SQS(config);

    return {
      client,
      commandExecutor: commands.commandExecutor(aggregatedSQS),
      listenQueue: commands.listenQueue(client)
    };
  };

  return {
    start
  };
};
