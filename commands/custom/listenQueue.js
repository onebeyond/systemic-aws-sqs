const pEvent = require('p-event');
const { EventEmitter } = require('events');
const { GetQueueUrlCommand, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
const debug = require('debug')('systemic-aws-sqs');

module.exports =
    (client) =>
      ({
        awsAccountId,
        queueName,
        processMessage,
        pollingPeriod = 1000
      }) => {
        debug('Calling listenQueue');
        let timeout = null;
        const events = new EventEmitter();
        let isPollingMessages = false;
        let isClosing = false;

        const pollAndProcess = async (queueUrl) => {
          if (!isClosing) {
            isPollingMessages = true;

            const receiveCommandParams = { QueueUrl: queueUrl }
            const receiveMessageCommand = new ReceiveMessageCommand(receiveCommandParams);
            const data = await client.send(receiveMessageCommand);

            if (data && data.Messages && data.Messages.length > 0) {
              await processMessage(data);

              const deleteCommandParams = { QueueUrl: queueUrl, ReceiptHandle: data.Messages[0].ReceiptHandle }
              const deleteMessageCommand = new DeleteMessageCommand(deleteCommandParams);
              await client.send(deleteMessageCommand);

              events.emit('messageProcessed');
            }

            schedulePolling(queueUrl, pollingPeriod);

            events.emit('pollingFinished');
            isPollingMessages = false;
          }
        }

        const schedulePolling = (queueUrl, ms) => { timeout = setTimeout(() => pollAndProcess(queueUrl), ms); }

        const start = async () => {
          isClosing = false;
          isPollingMessages = false;
          const commandParams = { QueueName: queueName, AwsAccountId: awsAccountId };
          const command = new GetQueueUrlCommand(commandParams);
          const res = await client.send(command);
          schedulePolling(res.QueueUrl, 0);
        }

        const stop = async () => {
          isClosing = true;
          if (isPollingMessages) {
            await pEvent(events, 'pollingFinished');
          }
          if (timeout) {
            clearTimeout(timeout);
          }
          isClosing = false;
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
