# Systemic AWS SQS

A [Systemic](https://guidesmiths.github.io/systemic/#/) component for the [AWS SQS SDK v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html).

## How to use it

### Configuration

A typical, simple configuration looks like this:

```json
{
  region: 'us-east-1',
  credentials: {
    secretAccessKey: 'test',
    accessKeyId: 'test'
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

### Custom commands

In the future, this component will also expose some custom commands which are not supported by the official API.

## Guide for developers

### How to test it

Set up / tear down local resources running:

```bash
npm run infra:up
npm run infra:down
```

Once resources are up you can test the component running one of this commands:

```bash
# all tests will be executed once
npm run test

# tests will be executed every time code changes (useful when coding)
npm run test:watch
```
