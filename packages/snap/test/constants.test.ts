import { BigNumber } from 'ethers';
import { SortedOraclesRates } from '../src/utils/types';
// currency.test.ts
export const REGISTRY_ADDRESS = '0x000000000000000000000000000000000000ce10';
export const CELO_MAINNET = 'mainnet';
export const CELO_ALFAJORES = 'alfajores';
export const cusdAddressAlfajores =
  '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1';
export const ceurAddressAlfajores =
  '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F';
export const crealAddressAlfajores =
  '0xE4D517785D091D3c54818832dB6094bcc2744545';
export const cusdAddressMainnet = '0x765DE816845861e75A25fCA122bb6898B8B1282a';
export const ceurAddressMainnet = '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73';
export const crealAddressMainnet = '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787';
export const CELO = 'celo';
export const CUSD = 'cusd';
export const CEUR = 'ceur';
export const CREAL = 'creal';
export const sortedOraclesAddress =
  '0xEb70DF9C0eCe284A5b7CCb88B9bBdC4d1E453d37';
export const feeCurrencyWhitelistAddress =
  '0xd9251192b3aE36CCE34D5D8471815d283B51C706';

export const walletAddressWithMoreUsd =
  '0x49e3aEA43AaD61d7a47efb2f993Bd9f58db5E60F';
export const walletAddressWithMoreEur =
  '0xa6DE49480dE155413f7D802513f409A5b23165F8';
export const walletAddressWithMoreReal =
  '0xD355fd821D13F70B6e313D3DE313D05524fc3703';
export const walletPKWithMoreUsd = // Private keys for these addresses
  '6820cfce5e3bcfd15e723d1252e05f429969a49dc50e80350c5f67b514871ad3';
export const walletPKWithMoreEur =
  'a3a79bfc80b94d1f48f7af82767b4eed8580abe8d7f149460b63807fc217630f';
export const walletPKWithMoreReal =
  'd68208fc514505c201221d6d1e03145784046fa07496821a38d64fe3f68ddfd5';

export const addressRatePair: Record<string, BigNumber[]> = {
  // 1:1 mapping with usd
  [cusdAddressAlfajores]: [BigNumber.from(100000), BigNumber.from(100)],
  // 1:1.18 euro to usd
  [ceurAddressAlfajores]: [BigNumber.from(118000), BigNumber.from(100)],
  // 1:0.19 real to usd
  [crealAddressAlfajores]: [BigNumber.from(19000), BigNumber.from(100)],
};
