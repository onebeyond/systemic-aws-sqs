const { EventEmitter } = require('events');
const { GetQueueUrlCommand, ReceiveMessageCommand, DeleteMessageCommand } = require("@aws-sdk/client-sqs");
const debug = require("debug")("systemic-aws-sqs");

module.exports =
    (client) =>
        ({
             awsAccountId,
             queueName,
             processMessage,
             pollingPeriod,
         }) => {
            debug("Calling listenQueue");
            let timeout = null;
            const events = new EventEmitter();
            let isProcessingMessage = false;

            const pollAndProcess = async (queueUrl) => {
                isProcessingMessage = true;

                const receiveCommandParams = { QueueUrl: queueUrl }
                const receiveMessageCommand = new ReceiveMessageCommand(receiveCommandParams);
                const data = await client.send(receiveMessageCommand);

                if (data && data.Messages && data.Messages.length > 0) {
                    await processMessage(data);

                    const deleteCommandParams = { QueueUrl: queueUrl, ReceiptHandle: data.Messages[0].ReceiptHandle }
                    const deleteMessageCommand = new DeleteMessageCommand(deleteCommandParams);
                    await client.send(deleteMessageCommand);

                    events.emit('messageProcessed')
                }

                schedulePolling(queueUrl, pollingPeriod)

                isProcessingMessage = false;
            }

            const schedulePolling = (queueUrl, timeout) =>
                setTimeout(() => pollAndProcess(queueUrl), timeout);

            const start = async () => {
                const commandParams = { QueueName: queueName, AwsAccountId: awsAccountId }
                const command = new GetQueueUrlCommand(commandParams);
                const res = await client.send(command);
                schedulePolling(res.QueueUrl, 0)
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
