'use strict';

const connLib = require('../../../lib/v6x');
const fixtures = require('./Fixtures/Fixtures');
const amqplib = require('amqplib');

const tap = require('@itavy/test-utilities').getTap();

tap.test('Send message simple queue', (t) => {
  t.plan(1);
  let testConnector;
  let assertConn;

  t.tearDown(() => {
    testConnector.close();
    assertConn.close();
  });

  testConnector = connLib.getConnector(connLib.types.RABBIT_MQ, {
    mqURI: fixtures.mqUri,
  });

  amqplib.connect(fixtures.mqUri)
    .then((conn) => {
      assertConn = conn;
      return conn.createConfirmChannel();
    })
    .then(ch => ch.consume(fixtures.workQueues.simpleQueue, (qMessage) => {
      t.same(qMessage.content, fixtures.testMessages.simpleQueue, 'Not equal');
    }, { noAck: true }))
    .then(() => testConnector.sendMessage({
      message: fixtures.testMessages.simpleQueue,
      queue:   fixtures.workQueues.simpleQueue,
    }))
    .catch(err => t.bailout(err));
});
