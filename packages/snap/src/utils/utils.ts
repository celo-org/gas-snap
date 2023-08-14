import { BigNumber, constants } from 'ethers';

/**
 *
 * @param error
 */
export function isInsufficientFundsError(error: any): boolean {
  return error.hasOwnProperty('code') && error.code === 'INSUFFICIENT_FUNDS';
}

/**
 *
 * @param value
 */
export function handleNumber(value: any): BigNumber {
  if (value === '0x' || !value) {
    return constants.Zero;
  }
  return BigNumber.from(value);
}
