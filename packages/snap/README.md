# Gas Snap

A MetaMask snap for sending Celo transactions with alternate gas currencies

[![Open Source Love svg1](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)

## Usage

### Connect to the Snap

To interact with this Snap, you will need to install [MetaMask Flask](https://metamask.io/flask/), a canary distribution for developers that provides access to upcoming features.

Then use Snap ID to connect to this Snap:

```javascript
const snapId = 'npm:@celo/gas-snap';

async function connect() {
  let requestParams = {};
  requestParams[snapId] = {};
  const result = await ethereum.request({
    method: 'wallet_requestSnaps',
    params: requestParams,
  });

  if (result) {
    // user is now connected
    console.log("connected")
  }
}
  
```

### Simple Transfer Example
Once connected, you can call the RPC method exposed in this snap as follows:

```javascript

 import { CeloTransactionRequest } from '@celo-tools/celo-ethers-wrapper';

 const tx: CeloTransactionRequest = {
        to: <address>,
        value: ethers.utils.parseUnits("1", "wei")
    }
 const result = await ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: snapId,
    request: {
      method: 'celo_sendTransaction',
      params: {
          tx
      }
    },
  },
});

console.log(result);
  
```
MetaMask will automatically fetch the Snap from the npm registry.

Please refer to the documentation for more about the parameters field https://docs.metamask.io/snaps/reference/rpc-api/#example-1

### More Generic Transaction Example
This example shows how one can use the snap to send a more generic transaction.

```javascript

  import { CeloTransactionRequest } from '@celo-tools/celo-ethers-wrapper';

  const abi = ['function deposit() external payable']
  const iface = new ethers.utils.Interface(abi)
  const data = iface.encodeFunctionData("deposit")

  let tx: CeloTransactionRequest = {
      from: <wallet_address>,
      to: <destination_contract_address>,
      data
      value: ethers.utils.parseUnits("1", "wei")
  }

  const gasLimit = (await wallet.estimateGas(tx)).mul(10)

  tx = {
      ...tx,
      feeCurrency,
      gasPrice,
      gasLimit,
  }

  const result = await ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: snapId,
      request: {
        method: 'celo_sendTransaction',
        params: {
            tx
        }
      },
    },
  });
  
```

## Publishing a new version of the Snap.

In other to update the snap to publish a new change, Update the `version` tag in both `packages/snap/snap.config.js` and `packages/snap/pakcage.json` to the same. Then from you console run the following commands. 

Note: You must be logged into NPM on your terminal as well as added to the celo organization on npm.

```
cd packages/snap

npm publish --access public
```

## Register a new coin type.
To Register a new coin type, add a new entry `snap_getBip44Entropy` with the desired coin type.
See list for reference.
https://github.com/satoshilabs/slips/blob/master/slip-0044.md
