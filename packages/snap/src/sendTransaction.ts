import {
  CeloTransactionRequest,
  CeloWallet,
} from '@celo-tools/celo-ethers-wrapper';

/**
 *
 * @param tx
 * @param wallet
 */
export async function sendTransaction(
  tx: CeloTransactionRequest,
  wallet: CeloWallet,
) {
  const txResponse = await wallet.sendTransaction({
    ...tx,
    gasLimit: (await wallet.estimateGas(tx)).mul(5),
    gasPrice: await wallet.getGasPrice(tx.feeCurrency),
  });

  return txResponse.wait();
}
