const commandConfig = (queueName) => ({
    commandParams: {
        QueueUrl: queueName
    },
    commandName:'deleteQueue'
})
module.exports = (sqs) => (queueName) => sqs
    .commandExecutor(commandConfig(`https://localhost/000000000000/${queueName}`))
