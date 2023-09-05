import { expect } from 'chai';
import * as sinon from 'sinon';
import { createMockTxRequest, createStubbedWallet } from '../wallet.mock.test';
import { sendTransaction } from '../../src/sendTransaction';

describe('sendTransaction', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should send a transaction and return a transaction receipt', async () => {
    const mockTxRequest = createMockTxRequest();
    const wallet = createStubbedWallet(sandbox);
    const receipt = await sendTransaction(mockTxRequest, wallet);

    expect(receipt).to.equal('Transaction Receipt');
  });
});
