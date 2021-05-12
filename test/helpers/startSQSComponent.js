const initSQS = require('../../index');
const sqsComponent = initSQS();

module.exports = config => sqsComponent.start(config);
