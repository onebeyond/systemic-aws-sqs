const { CreateQueueCommand } = require("@aws-sdk/client-sqs");

module.exports = (sqs) => (queueName) => sqs.client.send(new CreateQueueCommand({ QueueName: queueName }));
