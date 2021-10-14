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

        const receiveMessage = (queueUrl) => {
          const receiveCommandParams = { QueueUrl: queueUrl }
          const receiveMessageCommand = new ReceiveMessageCommand(receiveCommandParams);
          return client.send(receiveMessageCommand);
        }

        const deleteMessage = (queueUrl, receiptHandle) => {
          const deleteCommandParams = { QueueUrl: queueUrl, ReceiptHandle: receiptHandle }
          const deleteMessageCommand = new DeleteMessageCommand(deleteCommandParams);
          return client.send(deleteMessageCommand);
        }

        const getQueueUrl = (_queueName, _awsAccountId) => {
          const commandParams = { QueueName: _queueName, AwsAccountId: awsAccountId };
          const command = new GetQueueUrlCommand(commandParams);
          return client.send(command);
        }

        const pollAndProcess = async (queueUrl) => {
          if (!isClosing) {
            isPollingMessages = true;

            const data = await receiveMessage(queueUrl);

            if (data && data.Messages && data.Messages.length > 0) {
              await processMessage(data);
              await deleteMessage(queueUrl, data.Messages[0].ReceiptHandle);
              events.emit('messageProcessed');
            }

            schedulePolling(queueUrl, pollingPeriod);
            events.emit('pollingFinished');
            isPollingMessages = false;
          }
        }

        const schedulePolling = (queueUrl, ms) => {
          timeout = setTimeout(() => pollAndProcess(queueUrl), ms);
        }

        const start = async () => {
          isClosing = false;
          isPollingMessages = false;
          const res = await getQueueUrl(queueName, awsAccountId);
          schedulePolling(res.QueueUrl, 0);
        }

        const stop = async () => {
          isClosing = true;
          if (isPollingMessages) {
            await pEvent(events, 'pollingFinished');
          }
          if (timeout) {
            clearTimeout(timeout);
            timeout = null;
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
