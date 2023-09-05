import {
  CeloTransactionRequest,
  CeloWallet,
} from '@celo-tools/celo-ethers-wrapper';
import { BigNumber } from 'ethers';
import * as sinon from 'sinon';

export function createMockTxRequest(): CeloTransactionRequest {
  return {
    from: '0x504F2ba0C45004BC82161531691BeB7e91C66cc7',
    to: '0x842FD370C7536d65D7A6831f66dfB56FBe6dCB64',
    value: BigNumber.from(1000000000), // 1 billion gwei or 1ETH
    feeCurrency: '0xbc1cdd0b2860fa2D5482124e874681BD222Ac8C1',
  };
}

export function createMockTxResponse(sandbox: sinon.SinonSandbox) {
  return {
    wait: sandbox.stub().resolves('Transaction Receipt'),
  };
}

export function createStubbedWallet(
  sandbox: sinon.SinonSandbox,
  walletPK: string = '0x5e468c59c7244fb7940079f0e1b5b67860db27d107752fe9c5b4f7a2f96ed28a',
  celoBalance: number = 2001260000,
): CeloWallet {
  const wallet = new CeloWallet(walletPK);

  sandbox
    .stub(wallet, 'sendTransaction')
    // @ts-ignore
    .resolves(createMockTxResponse(sandbox));
  sandbox.stub(wallet, 'estimateGas').resolves(BigNumber.from(21000)); // 21000 units of gas
  sandbox.stub(wallet, 'getGasPrice').resolves(BigNumber.from(60)); // each gas valued at 60 gwei. This would result in a gas fee of 21000 x 60 = 1,260,000 Gwei
  sandbox.stub(wallet, 'getBalance').resolves(BigNumber.from(celoBalance)); // user should have a wallet balance of at least (tx value + gas fee) = 1,001,260,000 Gwei

  return wallet;
}
