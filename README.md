# ⚠️ This repository is not longer maintained ⚠️

This project is not longer maintained and has been archived. More details in [One Beyond Governance Tiers](https://onebeyond-maintainers.netlify.app/governance/tiers)

# Systemic AWS SQS

A [Systemic](https://guidesmiths.github.io/systemic/#/) component for the [AWS SQS SDK v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html).

## How to use it

### Configuration

A typical, simple configuration looks like this:

```json
{
  "region": "us-east-1",
  "credentials": {
    "secretAccessKey": "test",
    "accessKeyId": "test"
  }
}
```

[Here](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sqs/interfaces/sqsclientconfig.html) you can find the complete configuration interface of SQSClient class constructor that set the region, credentials and other options.

### Initialize the component

As with any other [Systemic component](https://guidesmiths.github.io/systemic/#/?id=components), you can run it with the `start` method:

```js
const initAWSSQS = require('systemic-aws-sqs');
const { start } = initAWSSQS();

const api = await start({ config }); // configuration similar to the one above
```

### Call the API commands

As the AWS API has dozens of commands, intead of having one wrapper for each of them, the component exposes one single command `commandExecutor` that can be used to call any of the commands exposed by the api:

```js
const res = await api.commandExecutor({
  commandParams: { <params of the method> },
  commandName: <name of the method>
});
```

For example, to create a sqs queue:

```js
const createSQSQueue = {
  commandParams: { QueueName: queueName },
  commandName: 'createQueue'
}
const res = await api.commandExecutor(createSQSQueue);
```

You can check all the available commands [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sqs/classes/sqs.html).

## Custom commands

Here is the current list of the custom commands that extends the SQS sdk functionality

### ListenQueue

This command will execute a repeated polling of messages in the queue. This iterative polling process will last until it is explicitly stopped.

This command requires the following parameters: 

| Name | Type | Required | Default Value | Description |
|:----:|:----:|:--------:|:-------------:|:-----------:|
|awsAccountId  |  string | Yes | - | Id of the AWS account who owns the SQS queue |
|queueName  |  string | Yes | - | Name of the queue to listen to |
|processMessage  | async function | yes | - | Function to execute when a message is received from the queue. This function will receive the message as input  |
|queueName  |  string | Yes | - | Name of the queue to listen to |
|pollingPeriod  | number | No | 1000 | Milliseconds between each polling process |

#### Returned Object

The `listenQueue` command will return an object with the following fields: 
- `start(): Promise<null>` once it is called, the listener will start polling messages from the queue.
- `stop(): Promise<null>` it will stop from polling messages from the queue. In case a polling is currently in process, it will wait until it finishes
- `events` an `EventEmitter` object that will emit the following events:
    - `messageProcessed` when a message is processed.
    - `pollingFinished` when a polling processed has been completed, even if a message was received or not.
    
`events` field is very useful for testing purposes and for some custom actions.

#### Code example

```js
const awsAccountId = '000000000000'
const queueName = 'test-service_v1_test-event'
const processMessage = (message) => console.log(message)
const pollingPeriod = 1000

const listener = await sqs.commandExecutor({
  commandParams: {
    queueName,
    awsAccountId,
    processMessage,
    pollingPeriod
  },
  commandName: 'listenQueue'
})

await listener.start()  // starting listening to the queue

// Printing all messages in the queue in console

await listener.stop()  // stop listening to the queue

// No more messages printed
```

## Guide for developers

### How to test it

You can test the whole test suite running one of these commands:

Once resources are up you can test the component running one of this commands:

```bash
# all tests will be executed once
npm run test

# tests will be executed every time code changes (useful when coding)
npm run test:watch
```
In case that you want to just execute a certain test case, you can also use these scripts to up / tear down the infra.

```bash
npm run infra:up
npm run infra:down
```
