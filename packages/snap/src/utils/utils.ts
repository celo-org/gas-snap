export function isInsufficientFundsError(error: any): boolean {
    return error.hasOwnProperty('code') && error.code === 'INSUFFICIENT_FUNDS';
}
  