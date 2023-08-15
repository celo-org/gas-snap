// TODO Retrieve this onchain, this would need Update to the FeeCurrencyWhitelist.sol

import {
  CeloTransactionRequest,
  CeloWallet,
} from '@celo-tools/celo-ethers-wrapper';
import { BigNumber, Contract, ethers } from 'ethers';
import { CELO_ALFAJORES, CELO_MAINNET, REGISTRY_ADDRESS } from './constants';
import { REGISTRY_ABI } from './abis/Registry';
import { SORTED_ORACLES_ABI } from './abis/SortedOracles';
import { FEE_CURRENCY_WHITELIST_ABI } from './abis/FeeCurrencyWhitelist';
import { SortedOraclesRates, TokenInfo } from './utils/types';
import { STABLE_TOKEN_ABI } from './abis/StableToken';

// contract to also store currency name.
/**
 * Retrieves the corresponding fee currency name based on the provided fee currency address and network.
 *
 * @param feeCurrencyAddress - The fee currency address.
 * @param network - The network (CELO_ALFAJORES or CELO_MAINNET).
 * @returns The corresponding fee currency name.
 * @throws {Error} If the fee currency address or network is not recognized.
 */
export function getFeeCurrencyNameFromAddress(
  feeCurrencyAddress: string | undefined,
  network: string,
): string {
  switch (network) {
    case CELO_ALFAJORES:
      switch (feeCurrencyAddress) {
        case undefined:
          return 'celo';
        case '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1':
          return 'cusd';
        case '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F':
          return 'ceur';
        case '0xE4D517785D091D3c54818832dB6094bcc2744545':
          return 'creal';
        default:
          throw new Error(
            `Fee currency address ${feeCurrencyAddress} not recognized.`,
          );
      }

    case CELO_MAINNET:
      switch (feeCurrencyAddress) {
        case undefined:
          return 'celo';
        case '0x765DE816845861e75A25fCA122bb6898B8B1282a':
          return 'cusd';
        case '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73':
          return 'ceur';
        case '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787':
          return 'creal';
        default:
          throw new Error(
            `Fee currency address ${feeCurrencyAddress} not recognized.`,
          );
      }

    default:
      throw new Error(`Network ${network} not recognized.`);
  }
}

/**
 * Retrieves the corresponding fee currency address based on the provided fee currency name and network.
 *
 * @param feeCurrencyName - The fee currency name ('celo', 'cusd', 'ceur', or 'creal').
 * @param network - The network (CELO_ALFAJORES or CELO_MAINNET).
 * @returns The corresponding fee currency address, or undefined if not applicable.
 * @throws {Error} If the fee currency name or network is not recognized.
 */
export function getFeeCurrencyAddressFromName(
  feeCurrencyName: string,
  network: string,
): string | undefined {
  switch (network) {
    case CELO_ALFAJORES: {
      switch (feeCurrencyName) {
        case 'celo':
          return undefined;
        case 'cusd':
          return '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1';
        case 'ceur':
          return '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F';
        case 'creal':
          return '0xE4D517785D091D3c54818832dB6094bcc2744545';
        default:
          throw new Error(
            `Fee currency string ${feeCurrencyName} not recognized. Must be either 'celo', 'cusd', 'ceur' or 'creal'.`,
          );
      }
    }

    case CELO_MAINNET:
      switch (feeCurrencyName) {
        case 'celo':
          return undefined;
        case 'cusd':
          return '0x765DE816845861e75A25fCA122bb6898B8B1282a';
        case 'ceur':
          return '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73';
        case 'creal':
          return '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787';
        default:
          throw new Error(
            `Fee currency string ${feeCurrencyName} not recognized. Must be either 'celo', 'cusd', 'ceur' or 'creal'.`,
          );
      }

    default:
      return undefined;
  }
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
 * @param tx - The transaction to select the optimal gas currency for.
 * @param wallet - The wallet.
 * @returns The address of the optimal feeCurrency, or undefined if the optimal feeCurrency is Celo.
 */
export async function getOptimalFeeCurrency(
  tx: CeloTransactionRequest,
  wallet: CeloWallet,
): Promise<string | undefined> {
  const registry = new Contract(REGISTRY_ADDRESS, REGISTRY_ABI, wallet);
  const sortedOraclesAddress = await registry.getAddressForString(
    'SortedOracles',
  );
  const feeCurrencyWhitelistAddress = await registry.getAddressForString(
    'FeeCurrencyWhitelist',
  );
  const sortedOraclesContract = new Contract(
    sortedOraclesAddress,
    SORTED_ORACLES_ABI,
    wallet,
  );
  const feeCurrencyWhitelistContract = new Contract(
    feeCurrencyWhitelistAddress,
    FEE_CURRENCY_WHITELIST_ABI,
    wallet,
  );
  const gasLimit = (await wallet.estimateGas(tx)).mul(5);
  const celoBalance = await wallet.getBalance();
  const tokenAddresses = await feeCurrencyWhitelistContract.getWhitelist();

  if (gasLimit.add(tx.value ?? 0) >= celoBalance) {
    console.log('using stable token for gas');
    const tokens: Contract[] = tokenAddresses.map(
      (tokenAddress: string) =>
        new Contract(tokenAddress, STABLE_TOKEN_ABI, wallet),
    );

    const [ratesResults, balanceResults] = await Promise.all([
      Promise.allSettled(
        tokens.map(
          (t) => sortedOraclesContract.medianRate(t.address) as BigNumber[],
        ),
      ),
      Promise.allSettled(
        tokens.map((t) => t.balanceOf(wallet.address) as BigNumber),
      ),
    ]);

    const tokenInfos: TokenInfo[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const [address, ratesRes, balanceRes] = [
        tokens[i].address,
        ratesResults[i],
        balanceResults[i],
      ];
      const rates =
        ratesRes.status === 'fulfilled'
          ? ({
              numerator: ratesRes.value[0],
              denominator: ratesRes.value[1],
            } as SortedOraclesRates)
          : undefined;
      const balance =
        balanceRes.status === 'fulfilled' ? balanceRes.value : undefined;
      const value =
        rates && balance
          ? balance.mul(rates.numerator.div(rates.denominator))
          : ethers.constants.Zero;
      tokenInfos.push({ address, value, rates, balance });
    }

    // TODO: consider edge case where the transaction itself sends a stable token
    // sort in descending order
    const sortedTokenInfos = tokenInfos.sort((a, b) =>
      b.value.sub(a.value).toNumber(),
    );

    return sortedTokenInfos[0].address;
  }
  return undefined;
}
