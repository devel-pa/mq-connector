'use strict';

const { expect, getSinonSandbox } = require('@itavy/test-utilities');
const connLib = require('../../');
const fixtures = require('./Fixtures');


describe('SendMessage', () => {
  let sandbox;
  let testConnector;

  beforeEach((done) => {
    sandbox = getSinonSandbox();
    testConnector = connLib.getConnector(connLib.types.RABBIT_MQ, Object.assign(
      {},
      fixtures.rabbitmqConnOptions,
      {
        amqplib: fixtures.amqpLib,
      }
    ));
    return done();
  });

  afterEach((done) => {
    sandbox.restore();
    testConnector = null;
    done();
  });

  it('Should fail with known error', () => {
    const parseStub = sandbox.stub(testConnector, 'parsePublishOptions')
      .rejects(fixtures.testingError);

    return testConnector.sendMessage(fixtures.publishMessage)
      .should.be.rejected
      .then((response) => {
        fixtures.testExpectedError({
          error: response,
          name:  'MQ_SEND_MESSAGE_ERROR',
        });
        expect(parseStub.callCount).to.be.equal(1);
        expect(parseStub.getCall(0).args[0]).to.be.equal(fixtures.publishMessage.options);

        return Promise.resolve();
      });
  });

  it('Should call getPublishChannel', () => {
    const parseStub = sandbox.stub(testConnector, 'getPublishChannel')
      .rejects(fixtures.testingError);

    return testConnector.sendMessage(fixtures.publishMessage)
      .should.be.rejected
      .then((response) => {
        fixtures.testExpectedError({
          error: response,
          name:  'MQ_SEND_MESSAGE_ERROR',
        });
        expect(parseStub.callCount).to.be.equal(1);

        return Promise.resolve();
      });
  });

  it('Should send provided message', () => {
    const sendSpy = sandbox.spy(testConnector, 'sendMessageToMQ');

    return testConnector.sendMessage(fixtures.publishMessage)
      .should.be.fulfilled
      .then(() => {
        expect(sendSpy.callCount).to.be.equal(1);
        expect(sendSpy.getCall(0).args[0]).to.be.eql({
          exchange: fixtures.publishMessage.exchange,
          queue:    fixtures.publishMessage.queue,
          message:  fixtures.publishMessage.message,
          options:  fixtures.publishMessage.options,
          ch:       testConnector.publishChannel,
        });

        return Promise.resolve();
      });
  });

  it('Should use default options if none provided', () => {
    const sendSpy = sandbox.spy(testConnector, 'sendMessageToMQ');

    return testConnector.sendMessage(fixtures.publishMessageDefault)
      .should.be.fulfilled
      .then(() => {
        expect(sendSpy.callCount).to.be.equal(1);
        expect(sendSpy.getCall(0).args[0]).to.be.eql({
          exchange: '',
          queue:    fixtures.publishMessageDefault.queue,
          message:  fixtures.publishMessageDefault.message,
          options:  {},
          ch:       testConnector.publishChannel,
        });

        return Promise.resolve();
      });
  });
});
