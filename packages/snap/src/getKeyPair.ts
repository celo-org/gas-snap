import { SnapsGlobalObject } from '@metamask/snaps-types';
import { panel, text } from '@metamask/snaps-ui';
import {
  getBIP44AddressKeyDeriver,
  BIP44Node,
  JsonBIP44CoinTypeNode,
} from '@metamask/key-tree';
import { KeyPair } from './utils/types';

/**
 *
 * @param snap
 * @param address
 * @param addressIndex
 */
export async function getKeyPair(
  snap: SnapsGlobalObject,
  address?: string,
  addressIndex = 0,
): Promise<KeyPair> {
  const derivationPath = "m/44'/60'/0'/0"; // Todo - read from state config
  let derivedKey;
  let _addressIndex = 0;
  const MAX_SEARCH_DEPTH = 50;

  const [, , coinType, account, change] = derivationPath.split('/');
  const bip44Code = coinType.replace("'", '');

  const bip44Node = (await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: Number(bip44Code),
    },
  })) as JsonBIP44CoinTypeNode;

  const addressKeyDeriver = await getBIP44AddressKeyDeriver(bip44Node, {
    account: parseInt(account),
    change: parseInt(change),
  });

  if (address) {
    let search;
    do {
      search = await addressKeyDeriver(Number(_addressIndex));
      if (search.address.toLowerCase() == address.toLowerCase()) {
        derivedKey = search;
      }
      _addressIndex += 1;
    } while (
      address.toLowerCase() != search.address.toLowerCase() &&
      _addressIndex <= MAX_SEARCH_DEPTH
    );
  } else {
    derivedKey = await addressKeyDeriver(Number(addressIndex));
  }

  if (!derivedKey) {
    await snap.request({
      method: 'snap_dialog',
      params: {
        type: 'alert',
        content: panel([
          text(
            `The Transaction specifies from ${address} however that address could not be signed by the private key derived from the MetaMask Mnemonic.`,
          ),
        ]),
      },
    });
    throw new Error('Unable to locate private key for account');
  }

  return {
    address: derivedKey.address,
    privateKey: derivedKey.privateKey,
    publicKey: derivedKey.publicKey,
  };
}
