import { OnRpcRequestHandler } from '@metamask/snaps-types'
import { panel, text } from '@metamask/snaps-ui'
import { newKit } from '@celo/contractkit'
import { CeloTx, TransactionResult } from '@celo/connect'
import { getBIP44AddressKeyDeriver } from '@metamask/key-tree'

export type RequestParams = {
  tx: CeloTx
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
  if (!params.tx || !params.provider) {
    // TODO improve type safety
    throw new Error('TODO')
  }

  switch (request.method) {

    case 'celo_sendTransaction':
      // TODO the dapp should probably ask for confirmation before sending the transaction
      return (await sendTransaction(params)).waitReceipt().then(txReceipt => 
        snap.request({
          method: 'snap_dialog',
          params: {
            type: 'confirmation',
            content: panel([
              text(`Hello, **${origin}**!`),
              text('This custom confirmation is just for display purposes.'),
              text('But you can edit the snap source code to make it do something, if you want to!'),
              text(`txReceipt: ${txReceipt}`)
            ])
          }
        })
      )

    default:
      throw new Error('Method not found.')
  }
}

async function sendTransaction(params: RequestParams): Promise<TransactionResult> {
  const kit = newKit(params.provider)
  const PRIVATE_KEY = await getPrivateKey()
  kit.addAccount(PRIVATE_KEY)
  return kit.sendTransaction(params.tx)
}

async function getPrivateKey(): Promise<string> {
  // Get the bip44 node corresponding to the path m/44'/52752'/0'/0
  const bip44Node = await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 52752, // https://github.com/satoshilabs/slips/blob/master/slip-0044.md
    },
  })
  const deriveAddress = await getBIP44AddressKeyDeriver(bip44Node)
  // Derive account w index 0
  const account = await deriveAddress(0)
  if (!account.privateKey) {
    throw new Error('Private key is undefined. BIP-44 node is public.')
  }
  return account.privateKey
}