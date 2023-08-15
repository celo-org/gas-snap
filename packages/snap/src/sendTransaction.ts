import {
  CeloTransactionRequest,
  CeloWallet,
} from '@celo-tools/celo-ethers-wrapper';

/**
 * Sends a Celo transaction using the provided transaction request and wallet.
 *
 * @param tx - The Celo transaction request.
 * @param wallet - The Celo wallet instance.
 * @returns Promise<providers.TransactionReceipt> A promise that resolves with the transaction receipt after the transaction is mined.
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
