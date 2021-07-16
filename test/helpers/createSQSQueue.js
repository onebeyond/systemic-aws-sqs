const commandConfig = (queueName) => ({
    commandParams: {
        QueueName: queueName
    },
    commandName:'createQueue'
})
module.exports = (sqs) => (queueName) => sqs.commandExecutor(commandConfig(queueName))
