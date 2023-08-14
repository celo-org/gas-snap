import { OnRpcRequestHandler, SnapsGlobalObject } from '@metamask/snaps-types';
import {
  CeloProvider,
  CeloTransactionRequest,
  CeloWallet,
} from '@celo-tools/celo-ethers-wrapper';
import { constants } from 'ethers';
import { getNetworkConfig } from './utils/network';
import { RequestParamsSchema } from './utils/types';
import { handleNumber, isInsufficientFundsError } from './utils/utils';
import { sendTransaction } from './sendTransaction';
import { getKeyPair } from './getKeyPair';
import {
  getFeeCurrencyAddressFromName,
  getFeeCurrencyNameFromAddress,
  getOptimalFeeCurrency,
} from './currency';
import { invokeSnapDialog } from './utils/snapDialog';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap, or if the request params are invalid.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  if (!RequestParamsSchema.is(request.params)) {
    await invokeSnapDialog({
      type: 'alert',
      contentArray: ['Invalid Request!', `${JSON.stringify(request.params)}`],
    });
    return;
  }

  const { tx } = request.params;
  tx.value = handleNumber(tx.value); // todo find way to do this within io-ts transformation
  const network = await getNetworkConfig();
  const provider = new CeloProvider(network.url);
  const keyPair = await getKeyPair(snap, tx.from);
  const wallet = new CeloWallet(keyPair.privateKey).connect(provider);
  if (tx.value == constants.Zero) {
    delete tx.value;
  }

  switch (request.method) {
    case 'celo_sendTransaction':
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

      if (result === true) {
        tx.feeCurrency ??= await getOptimalFeeCurrency(tx, wallet);
        const suggestedFeeCurrency = getFeeCurrencyNameFromAddress(
          tx.feeCurrency,
          network.name,
        );

        const overrideFeeCurrency = await invokeSnapDialog({
          type: 'prompt',
          contentArray: [
            `The suggested gas currency for your tx is ${suggestedFeeCurrency}`,
            `If you would like to use a different gas currency, please enter it below`,
            `Otherwise, press submit`,
          ],
          placeholder: `'cusd', 'ceur', 'creal', 'celo'`,
        });
        if (
          // TODO find a cleaner way to do this, probably use an enum
          overrideFeeCurrency === 'cusd' ||
          overrideFeeCurrency === 'ceur' ||
          overrideFeeCurrency === 'creal' ||
          overrideFeeCurrency === 'celo'
        ) {
          tx.feeCurrency = getFeeCurrencyAddressFromName(
            overrideFeeCurrency,
            network.name,
          );
        } else if (overrideFeeCurrency === null) {
          return;
        }

        try {
          const txReceipt = await sendTransaction(tx, wallet);
          await invokeSnapDialog({
            type: 'alert',
            contentArray: [
              'Your transaction succeeded!',
              `${network.explorer}/tx/${txReceipt.transactionHash}`,
            ],
          });
        } catch (error) {
          let message = JSON.stringify(error);

          if (isInsufficientFundsError(error)) {
            message = `Oops! Looks like you don't have sufficient funds in the chosen gas currency to complete the operation. Please try again using another currency.`;
          }

          await invokeSnapDialog({
            type: 'alert',
            contentArray: ['Your transaction failed!', `error: ${message}`],
          });
        }
      } else {
        // user didn't proceed with transaction
      }
      break;
    default:
      throw new Error('Method not found.');
  }
};
