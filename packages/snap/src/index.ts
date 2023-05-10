import { OnRpcRequestHandler } from '@metamask/snaps-types'
import { panel, text } from '@metamask/snaps-ui'
import { CeloProvider, CeloWallet } from '@celo-tools/celo-ethers-wrapper'
import { ethers } from 'ethers'
import { getBIP44AddressKeyDeriver, BIP44Node } from '@metamask/key-tree'
import { getNetwork } from './utils/network'

type SimpleTransaction = {
  to: string
  from: string
  value: string
}

export type RequestParams = {
  tx: SimpleTransaction // TODO replace with better type
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
  // const params = request.params as unknown as RequestParams  // TODO improve type safety

  const { address } = await getBIP44Node()

  const params: RequestParams = {
    tx: {
      to: (await getBIP44Node(1)).address,
      from: address,
      value: ethers.utils.parseUnits("1", "wei").toHexString(),
    }
  }

  switch (request.method) {

    case 'celo_sendTransaction':
      const result = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            text(`Hello, **${origin}**!`),
            text('Please approve the following transaction'),
            text(`tx: ${JSON.stringify(params.tx)}`)
          ])
        }
      })

      if (result === true) {
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
            type: 'alert',
            content: panel([
              text(`Hello, **${origin}**!`),
              text(`txReceipt: ${JSON.stringify(txReceipt)}`),
              text(`error: ${JSON.stringify(error)}`),
            ])
          }
        })
      }

    default:
      throw new Error('Method not found.')
  }
}

async function sendTransaction(params: RequestParams) {
  const chainId = await ethereum.request({ method: 'eth_chainId' })
  const network =   getNetwork(String(chainId))
  const provider = new CeloProvider(network.url)
  const bip44Node = await getBIP44Node()
  const privateKey = await getPrivateKey(bip44Node)
  const wallet = new CeloWallet(privateKey).connect(provider)

  const CUSD_ADDRESS = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"
  
  const txResponse = await wallet.sendTransaction({
    ...params.tx,
    gasLimit: (await wallet.estimateGas(params.tx)).mul(10),
    gasPrice: await wallet.getGasPrice(CUSD_ADDRESS),
    feeCurrency: CUSD_ADDRESS
  })

  return txResponse.wait()
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

async function getPrivateKey(bip44Node?: BIP44Node, index: number = 0): Promise<string> {
  if (!bip44Node) {
    bip44Node = await getBIP44Node(index)
  }
  if (!bip44Node.privateKey) {
    throw new Error('Private key is undefined. BIP-44 node is public.')
  }
  return bip44Node.privateKey
}
