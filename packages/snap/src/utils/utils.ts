import { BigNumber, constants } from 'ethers';

/**
 * Checks if the provided error object represents an insufficient funds error.
 *
 * @param error - The error object to check.
 * @returns Returns true if the error is an insufficient funds error, otherwise false.
 */
export function isInsufficientFundsError(error: any): boolean {
  return (
    error.prototype.hasOwnProperty.call('code') &&
    error.code === 'INSUFFICIENT_FUNDS'
  );
}

/**
 * Handles a numeric value or hexadecimal string and converts it to a BigNumber.
 *
 * @param value - The numeric value or hexadecimal string to handle.
 * @returns The converted BigNumber instance.
 */
export function handleNumber(value: any): BigNumber {
  if (value === '0x' || !value) {
    return constants.Zero;
  }
  return BigNumber.from(value);
}
