import { BigNumber } from 'ethers';
import {
  sortedOraclesAddress,
  feeCurrencyWhitelistAddress,
  addressRatePair,
  cusdAddressAlfajores,
  ceurAddressAlfajores,
  crealAddressAlfajores,
  walletAddressWithMoreEur,
  walletAddressWithMoreReal,
  walletAddressWithMoreUsd,
} from './constants.test';

export interface Contract {
  address: string;
  defaultBalance: BigNumber;
  getAddressForString: (name: string) => string;
  getWhitelist: () => string[];
  medianRate: (address: string) => BigNumber[] | undefined;
  balanceOf: (address: string) => BigNumber | undefined;
}

export class ContractMock implements Contract {
  public address: string;
  public defaultBalance: BigNumber = BigNumber.from(100000);

  constructor(tokenAddress: string, ABI: any, wallet: any) {
    this.address = tokenAddress;
  }

  public getAddressForString(name: string): string {
    if (name === 'SortedOracles') {
      return sortedOraclesAddress;
    } else {
      return feeCurrencyWhitelistAddress;
    }
  }

  public getWhitelist(): string[] {
    return Object.keys(addressRatePair);
  }

  public medianRate(address: string): BigNumber[] | undefined {
    const rate = addressRatePair[address];
    if (rate !== undefined) {
      return rate;
    }

    return undefined;
  }

  public balanceOf(walletAddress: string): BigNumber | undefined {
    switch (this.address) {
      case cusdAddressAlfajores:
        if (walletAddress === walletAddressWithMoreUsd) {
          return BigNumber.from(250000); // Make usd balance bigger than euro so that when multiplied with rates >>>
        } else {
          return this.defaultBalance;
        }
      case crealAddressAlfajores:
        if (walletAddress === walletAddressWithMoreReal) {
          return BigNumber.from(700000); // Make real balance bigger than euro & usd so when multiplied with rates >>>
        } else {
          return this.defaultBalance;
        }
      case ceurAddressAlfajores:
        return this.defaultBalance; // Since euro already larger than usd & real when used with rates
      default:
        return undefined;
    }
  }
}
