import {
  CeloProvider,
  CeloTransactionRequest,
  CeloWallet,
} from '@celo-tools/celo-ethers-wrapper';
import { BigNumber } from 'ethers';

// export async function sendTransaction(params: any) {
//     try {
//         // todo
//     }
//     catch {
//         throw new Error("");
//     }
// }

/**
 *
 * @param tx
 * @param wallet
 */
export async function sendTransaction(
  tx: CeloTransactionRequest,
  wallet: CeloWallet,
) {
  tx.value = BigNumber.from(tx.value); // todo investigate why we get a hex error w/o this.
  const txResponse = await wallet.sendTransaction({
    ...tx,
    gasLimit: (await wallet.estimateGas(tx)).mul(5),
    gasPrice: await wallet.getGasPrice(tx.feeCurrency),
  });

  return txResponse.wait();
}
