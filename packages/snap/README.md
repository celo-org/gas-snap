# Gas Snap

A MetaMask snap for sending Celo transactions with alternate gas currencies

[![Open Source Love svg1](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)

## Install

```
yarn add @celo/gas-snap
```

## Usage

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

Once connected, you can call the RPC method exposed in this snap as follows:

```javascript
 const result = await ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: snapId,
    request: {
      method: 'celo_sendTransaction',
      params: {
          tx: { to, value }
      }
    },
  },
});

console.log(result);
  
```

MetaMask will automatically fetch the Snap from the npm registry.

Please refer to the documentation for more about the parameters field https://docs.metamask.io/snaps/reference/rpc-api/#example-1
