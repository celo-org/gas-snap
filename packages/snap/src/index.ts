import { OnRpcRequestHandler } from '@metamask/snaps-types'
import { panel, text } from '@metamask/snaps-ui'
import { CeloProvider, CeloWallet } from '@celo-tools/celo-ethers-wrapper'
import { TransactionResponse, ethers } from 'ethers'
import { getBIP44AddressKeyDeriver, BIP44Node } from '@metamask/key-tree'
import { getNetwork } from './utils/network'

export type RequestParams = {
  provider: string
}

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
export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) => {
  const params = request.params as unknown as RequestParams
  if (!params.provider) {
    // TODO improve type safety
    throw new Error('TODO')
  }

  switch (request.method) {

    case 'celo_sendTransaction':
      await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            text(`Hello, **${origin}**!`),
            text('This custom confirmation is just for display purposes. HEYYYYYY'),
            text('But you can edit the snap source code to make it do something, if you want to!')
          ])
        }
      })
      let txReceipt
      let error 
      try {
        txReceipt = await sendTransaction(params)
      } catch (e) {
        error = e
      }
      await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            text(`Hello, **${origin}**!`),
            text(`txReceipt: ${txReceipt}`),
            text(`error: ${JSON.stringify(error)}`)
          ])
        }
      })

    default:
      throw new Error('Method not found.')
  }
}

/**
 * Gets the connected Provider.
 * 
 * @dev The ethereum object does not expose the RPC URL for non Ethereum networks,
 * however we are able to get chainId, which we use to resolve
 * provider URL.
 * @returns 
 */
async function getConnectedProvider(): Promise<any> {
  const provider = new ethers.providers.Web3Provider(ethereum as any)
  const { chainId } = await provider.getNetwork() 
   return getNetwork(chainId.toString());
}

async function sendTransaction(params: RequestParams): TransactionResponse {
  const { url }  = await getConnectedProvider();
  const provider = new CeloProvider(url)

  const PRIVATE_KEY = await getPrivateKey()
  const wallet = new CeloWallet(PRIVATE_KEY).connect(provider)

  const tx = {
    to: (await getBIP44Node(1)).address,
    value: 1,
  }

  const CUSD_ADDRESS = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"
  
  const txResponse: TransactionResponse = await wallet.sendTransaction({
    ...tx,
    gasLimit: (await wallet.estimateGas(tx)).mul(10),
    gasPrice: await wallet.getGasPrice(CUSD_ADDRESS),
    feeCurrency: CUSD_ADDRESS
  })

  return txResponse.wait()

  // const PRIVATE_KEY = await getPrivateKey()
  // kit.addAccount(PRIVATE_KEY)

  // const ONE_STABLE = kit.web3.utils.toWei('1', 'ether')
  // const stableToken = await kit.contracts.getStableToken(StableToken.cUSD)
  // await kit.setFeeCurrency(CeloContract.StableToken)
  // const tx = stableToken.transfer((await getBIP44Node(1)).address, ONE_STABLE)
  // return tx.sendAndWaitForReceipt()
  // return kit.sendTransaction(params.tx)
}

async function getBIP44Node(index: number = 0): Promise<BIP44Node> {
  // Get the bip44 node corresponding to the path m/44'/52752'/0'/0
  const bip44Node = await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 52752, // https://github.com/satoshilabs/slips/blob/master/slip-0044.md
    },
  })
  const deriveAddress = await getBIP44AddressKeyDeriver(bip44Node)
  // Derive account w index 
  return deriveAddress(index)
}

async function getPrivateKey(index: number = 0): Promise<string> {
  const account = await getBIP44Node(index)
  if (!account.privateKey) {
    throw new Error('Private key is undefined. BIP-44 node is public.')
  }
  return account.privateKey
}
