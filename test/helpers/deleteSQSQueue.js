const { DeleteQueueCommand } = require("@aws-sdk/client-sqs");

module.exports = (sqs) => (queueName) => sqs.client
    .send(new DeleteQueueCommand({ QueueUrl: `https://localhost/000000000000/${queueName}` }));
