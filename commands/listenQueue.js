const { EventEmitter } = require('events');
const debug = require("debug")("systemic-aws-sqs");

module.exports =
    (client) =>
        () => {
            debug("Calling listenQueue");
            let timeout = null;
            const events = new EventEmitter();
            let isProcessingMessage = false;

            const pollAndProcess = async ({
                  processMessage, pollingPeriod, queueUrl
              }) => {
                isProcessingMessage = true;

                const commandParams = { QueueUrl: queueUrl }
                const data = await client.commandExecutor({
                    commandParams,
                    commandName: 'receiveMessage'
                });

                await processMessage(data);

                await client.commandExecutor({
                    commandParams,
                    commandName: 'deleteMessage'
                });

                events.emit('messageProcessed')

                schedulePolling({
                    processMessage,
                    pollingPeriod,
                    queueUrl,
                }, pollingPeriod)

                isProcessingMessage = false;
            }

            const schedulePolling = (pollingParams, timeout) =>
                setTimeout(() => pollAndProcess(pollingParams), timeout);

            const start = async ({
                awsAccountId,
                queueName,
                processMessage,
                pollingPeriod,
            }) => {
                const commandParams = { QueueName: queueName, AwsAccountId: awsAccountId }
                const res = await client.commandExecutor({ commandParams, commandName: 'getQueueUrl' });

                schedulePolling({
                    queueUrl:  res.QueueUrl,
                    processMessage,
                    pollingPeriod,
                }, 0)
            }

            const stop = () => {
                if (timeout) {
                    clearTimeout(timeout);
                }
            }
            try {
                return {
                    start,
                    stop,
                    events
                }
            } catch (error) {
                debug(`Error executing listenQueue: ${error.message}`);
                throw error;
            }
        };
