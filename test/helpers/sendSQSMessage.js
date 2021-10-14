const commandConfig = (queueUrl, messageBody) => ({
    commandParams: {
        QueueUrl: queueUrl,
        MessageBody: messageBody
    },
    commandName:'sendMessage'
})
module.exports = (sqs) => (queueUrl, messageBody) => sqs.commandExecutor(commandConfig(queueUrl, messageBody))
