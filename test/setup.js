const waitOn = require('wait-on');

const setUpTest = async () => await waitOn({
  resources: ['http://localhost:4566/health'],
  timeout: '10000',
});

module.exports = setUpTest

