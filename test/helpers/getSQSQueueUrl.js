const commandConfig = (queueName, awsAccountId) => ({
    commandParams:{
        QueueName: queueName,
        AwsAccountId: awsAccountId
    },
    commandName:'getQueueUrl'
})
module.exports = (sqs) => (queueName, awsAccountId) => sqs.commandExecutor(commandConfig(queueName, awsAccountId))
