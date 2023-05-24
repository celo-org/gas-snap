import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text, copyable } from '@metamask/snaps-ui';
import { CeloProvider, CeloWallet } from '@celo-tools/celo-ethers-wrapper';
import { ethers } from 'ethers';
import { getBIP44AddressKeyDeriver, BIP44Node } from '@metamask/key-tree';
import { Network, getNetwork } from './utils/network';

type SimpleTransaction = {
  to: string;
  value: string;
  feeCurrency?: string;
};

const supportedCurrencies: { [feeCurrencyName: string]: string | undefined } = {
  cusd: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
  ceur: '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F',
  creal: '0xE4D517785D091D3c54818832dB6094bcc2744545',
  celo: undefined,
};

export type RequestParams = {
  tx: SimpleTransaction; // TODO replace with better type
};

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
  const params = request.params as unknown as RequestParams; // TODO improve type safety

  switch (request.method) {
    case 'celo_sendTransaction':
      const result = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            text('Please approve the following transaction'),
            text(`to: ${params.tx.to}`),
            text(`value: ${params.tx.value} wei`),
          ]),
        },
      });

      const network = await getNetworkConfig();

      if (result === true) {
        params.tx.feeCurrency ??= await getOptimalFeeCurrency(params.tx);
        const suggestedFeeCurrency = getFeeCurrencyNameFromAddress(
          params.tx.feeCurrency,
        );

        const overrideFeeCurrency = await snap.request({
          method: 'snap_dialog',
          params: {
            type: 'prompt',
            content: panel([
              text(
                `The suggested gas currency for your tx is ${suggestedFeeCurrency}`,
              ),
              text(
                `If you would like to use a different gas currency, please enter it below`,
              ),
              text(`Otherwise, press submit`),
            ]),
            placeholder: `'cusd', 'ceur', 'creal', 'celo'`,
          },
        });

        if (
          // TODO find a cleaner way to do this, probably use an enum
          typeof overrideFeeCurrency == 'string' &&
          Object.keys(supportedCurrencies).includes(overrideFeeCurrency)
        ) {
          params.tx.feeCurrency =
            getFeeCurrencyAddressFromName(overrideFeeCurrency);
        }

        try {
          const txReceipt = await sendTransaction(params);
          await snap.request({
            method: 'snap_dialog',
            params: {
              type: 'alert',
              content: panel([
                text(`Your transaction succeeded!`),
                copyable(`${network.explorer}/tx/${txReceipt.transactionHash}`),
              ]),
            },
          });
        } catch (error) {
          await snap.request({
            method: 'snap_dialog',
            params: {
              type: 'alert',
              content: panel([
                text(`Your transaction failed!`),
                text(`error: ${JSON.stringify(error)}`),
              ]),
            },
          });
        }
      }

    default:
      throw new Error('Method not found.');
  }
};

async function getNetworkConfig(): Promise<Network> {
  const chainId = (await ethereum.request({ method: 'eth_chainId' })) as string;
  return getNetwork(chainId);
}

async function sendTransaction(params: RequestParams) {
  const network = await getNetworkConfig();
  const provider = new CeloProvider(network.url);
  const privateKey = await getPrivateKey();
  const wallet = new CeloWallet(privateKey).connect(provider);

  const txResponse = await wallet.sendTransaction({
    ...params.tx,
    value: ethers.utils.parseUnits(params.tx.value, 'wei').toHexString(),
    gasLimit: (await wallet.estimateGas(params.tx)).mul(5),
    gasPrice: await wallet.getGasPrice(params.tx.feeCurrency),
  });

  return txResponse.wait();
}

async function getBIP44Node(index: number = 0): Promise<BIP44Node> {
  // Get the bip44 node corresponding to the path m/44'/52752'/0'/0
  const bip44Node = await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 52752, // https://github.com/satoshilabs/slips/blob/master/slip-0044.md
    },
  });
  const deriveAddress = await getBIP44AddressKeyDeriver(bip44Node);
  // Derive account w index
  return deriveAddress(index);
}

async function getPrivateKey(
  bip44Node?: BIP44Node,
  index: number = 0,
): Promise<string> {
  if (!bip44Node) {
    bip44Node = await getBIP44Node(index);
  }
  if (!bip44Node.privateKey) {
    throw new Error('Private key is undefined. BIP-44 node is public.');
  }
  return bip44Node.privateKey;
}

/**
 * Finds the optimal gas currency to send a transaction with based on user balances.
 * This may differ from the feeCurrency specified in the transaction body.
 *
 * The returned feeCurrency will be Celo if the user has enough balance
 * to pay for the transaction in Celo, as native transactions are cheaper.
 * Otherwise, the returned feeCurrency will be whichever one the user would
 * have the greatest balance in after sending the transaction.
 *
 * @param tx - The transaction to select the optimal gas currency for
 * @returns - The address of the optimal feeCurrency, or undefined if the optimal
 * feeCurrency is Celo.
 */
async function getOptimalFeeCurrency(
  tx: SimpleTransaction,
): Promise<string | undefined> {
  // TODO
  return undefined;
}

// TODO find a better way to do this
function getFeeCurrencyNameFromAddress(
  feeCurrencyAddress: string | undefined,
): string {
  if (Object.values(supportedCurrencies).includes(feeCurrencyAddress)) {
    for (var name in supportedCurrencies) {
      if (supportedCurrencies[name] == feeCurrencyAddress) return name;
    }
  }
  throw new Error(`Fee currency address ${feeCurrencyAddress} not recognized.`);
}

function getFeeCurrencyAddressFromName(
  feeCurrencyName: string,
): string | undefined {
  if (Object.keys(supportedCurrencies).includes(feeCurrencyName)) {
    return supportedCurrencies[feeCurrencyName];
  }
  throw new Error(
    `Fee currency string ${feeCurrencyName} not recognized. Must be either 'celo', 'cusd', 'ceur' or 'creal'.`,
  );
}
