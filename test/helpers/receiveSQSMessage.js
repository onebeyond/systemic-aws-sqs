const commandConfig = (queueUrl) => ({
    commandParams: {
        QueueUrl: queueUrl,
    },
    commandName:'receiveMessage'
})
module.exports = (sqs) => (queueUrl) => sqs.commandExecutor(commandConfig(queueUrl))
