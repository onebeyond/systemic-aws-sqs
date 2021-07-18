const { EventEmitter } = require('events');
const debug = require("debug")("systemic-aws-sqs");

const pollAndProcess = async ({
      client, events, timeout, processMessage, pollingPeriod
                              }) => {
    const data = await client.commandExecutor({});
    await processMessage(data);
    await client.commandExecutor({});
    timeout = setTimeout(() => pollAndProcess(
        { client, events, timeout, processMessage, pollingPeriod }
        ),pollingPeriod
    )
}

const start = ({ client, events, timeout }) => async ({ processMessage, pollingPeriod }) => pollAndProcess(
    { client, events, timeout, processMessage, pollingPeriod }
)

const stop = ({ client, events }) =>  () => {

}

module.exports =
    (client) =>
        () => {
            debug("Calling listenQueue");
            try {
                let timeout = null;
                const events = new EventEmitter();
                return {
                    start: start({ client, events, timeout }),
                    stop: stop({ client, events, timeout }),
                    events
                }
            } catch (error) {
                debug(`Error executing listenQueue: ${error.message}`);
                throw error;
            }
        };
