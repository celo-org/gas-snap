import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text } from '@metamask/snaps-ui';


async function getFees() {
  const response = await fetch('https://beaconcha.in/api/v1/execution/gasnow'); 
  return response.text();
}

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = ({ origin, request }) => {
  switch (request.method) {
    case 'getGas':
      return getFees().then(fees => {
        return snap.request({
          method: 'snap_dialog',
          params: {
            type: 'Alert',
            content: panel([
              text(`Hello, **${origin}**!`),
              text(`Current gas fee estimates: ${fees}`),
            ])
          }
        })
      })

      // case 'payWithCUSD':
      //   return payWithUSD().then(fees => {
      //     return snap.request({
      //       ...
      //       util.payWithCUSD(...)
      //     })
      //   })

        // case 'payWithCEURO':
        //   return payWithCEURO().then(fees => {
        //     return snap.request({
        //       ...
        //       util.payWithCEURO(...)
        //     })
        //   })

        //   case 'payWithCREAL':
        //     return payWithCREAL().then(fees => {
        //       return snap.request({
        //         ...
        //         util.payWithCREAL(...)
        //       })
        //     })


    default:
      throw new Error('Method not found.');
  }
};
