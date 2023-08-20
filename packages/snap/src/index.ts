import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { CeloProvider, CeloWallet } from '@celo-tools/celo-ethers-wrapper';
import { constants } from 'ethers';
import { getNetworkConfig } from './utils/network';
import { RequestParamsSchema } from './utils/types';
import { handleNumber } from './utils/utils';
import { sendTransaction } from './sendTransaction';
import { getKeyPair } from './getKeyPair';
import {
  getFeeCurrencyAddressFromName,
  getFeeCurrencyNameFromAddress,
  getOptimalFeeCurrency,
} from './currency';
import { invokeSnapDialog } from './utils/snapDialog';
import {
  INSUFFICIENT_FUNDS_MESSAGE,
  INVALID_CURRENCY_MESSAGE,
  REJECTION_MESSAGE,
  VALID_CURRENCIES,
} from './constants';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap, or if the request params are invalid.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  if (!RequestParamsSchema.is(request.params)) {
    await invokeSnapDialog({
      type: 'alert',
      contentArray: ['Invalid Request!', `${JSON.stringify(request.params)}`],
    });
    return;
  }

  const { tx } = request.params;
  tx.value = handleNumber(tx.value);
  const network = await getNetworkConfig();
  const provider = new CeloProvider(network.url);
  const keyPair = await getKeyPair(snap, tx.from);
  const wallet = new CeloWallet(keyPair.privateKey).connect(provider);
  tx.from = tx.from ? tx.from : wallet.address;
  if (tx.value === constants.Zero) {
    delete tx.value;
  }

  switch (request.method) {
    case 'celo_sendTransaction':
      {
        const result = await invokeSnapDialog({
          type: 'confirmation',
          contentArray: [
            'Please approve the following transaction',
            tx.to ? `to: ${tx.to}` : '',
            tx.from ? `from: ${tx.from}` : '',
            tx.nonce ? `nonce: ${tx.nonce}` : '',
            tx.gasLimit ? `gasLimit: ${tx.gasLimit}` : '',
            tx.gasPrice ? `gasPrice: ${tx.gasPrice}` : '',
            tx.data ? `data: ${tx.data}` : '',
            tx.value ? `value: ${BigInt(tx.value?.toString())} wei` : '',
            tx.chainId ? `chainId: ${tx.chainId}` : '',
            tx.feeCurrency ? `feeCurrency: ${tx.feeCurrency}` : '',
            tx.gatewayFeeRecipient
              ? `gatewayFeeRecipient: ${tx.gatewayFeeRecipient}`
              : '',
            tx.gatewayFee ? `gatewayFee: ${tx.gatewayFee}` : '',
          ].filter(Boolean), // This will remove any empty strings
        });

        if (result === false) {
          // user did not proceed approve the request in the tx summary screen
          throw new Error(REJECTION_MESSAGE);
        }

        tx.feeCurrency ??= await getOptimalFeeCurrency(tx, wallet);
        const suggestedFeeCurrency = getFeeCurrencyNameFromAddress(
          tx.feeCurrency,
          network.name,
        );

        const overrideFeeCurrency = await invokeSnapDialog({
          type: 'prompt',
          contentArray: [
            `The suggested gas currency for your tx is [${suggestedFeeCurrency.toUpperCase()}]`,
            `If you would like to use a different gas currency, please enter it below`,
            `Otherwise, press submit`,
          ],
          placeholder: `cusd, ceur, creal, celo`,
        });
        console.log(overrideFeeCurrency === '')
        if (overrideFeeCurrency !== '' && VALID_CURRENCIES.includes(overrideFeeCurrency.toLowerCase())) {
          tx.feeCurrency = getFeeCurrencyAddressFromName(
            overrideFeeCurrency.toLowerCase(),
            network.name,
          );
        } else {
          // user either rejected the request in the currency screen or entered an invalid currency
          throw new Error(
            overrideFeeCurrency === null
              ? REJECTION_MESSAGE
              : INVALID_CURRENCY_MESSAGE,
          );
        }

        try {
          const txReceipt = await sendTransaction(tx, wallet);
          await invokeSnapDialog({
            type: 'alert',
            contentArray: [
              'Your transaction succeeded!',
              `${network.explorer}/tx/${txReceipt?.transactionHash}`,
            ],
          });
          return txReceipt?.transactionHash;
        } catch (e) {
          const message = (e as Error).message.includes('insufficient funds')
            ? INSUFFICIENT_FUNDS_MESSAGE
            : (e as Error).message;
          await invokeSnapDialog({
            type: 'alert',
            contentArray: ['Your transaction failed!', `error: ${message}`],
          });
          throw new Error(message);
        }
      }
      break;
    default:
      throw new Error('Method not found.');
  }
};
