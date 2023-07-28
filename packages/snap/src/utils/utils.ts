import { BigNumber, constants } from "ethers";

export function isInsufficientFundsError(error: any): boolean {
    return error.hasOwnProperty('code') && error.code === 'INSUFFICIENT_FUNDS';
}

export function handleNumber(value: any): BigNumber {
    if (value === "0x") {
      return constants.Zero;
    }
    return BigNumber.from(value);
}
