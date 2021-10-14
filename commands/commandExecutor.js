const debug = require('debug')('systemic-aws-sqs');
const { join } = require('path');
const customClient = require('require-all')(join(__dirname, '/custom'));

module.exports = s3Client => async ({ commandParams, commandName }) => {
  try {
    debug(`Calling ${commandName}`);
    const data = customClient[commandName]
      ? await customClient[commandName](s3Client)(commandParams)
      : await s3Client[commandName](commandParams);
    debug(`${commandName} executed successfully`);
    return data;
  } catch (error) {
    debug(`Error executing ${commandName}: ${error.message}`);
    throw error;
  }
};
