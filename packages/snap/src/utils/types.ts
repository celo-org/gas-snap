import * as t from 'io-ts'

export const TransactionConfig = t.partial({
    from: t.union([t.string, t.number]),
    to: t.string,
    value: t.union([t.number, t.string, t.bigint]),
    gas: t.union([t.string, t.number]),
    gasPrice: t.union([t.number, t.string, t.bigint]),
    data: t.string,
    nonce: t.number,
    chainId: t.string,
    common: t.string,
    chain: t.string,
    hardfork: t.string
})

export const CeloParams = t.partial({
    feeCurrency: t.string,
    gatewayFeeRecipient: t.string,
    gatewayFee: t.string
})

export const CeloTx = t.intersection([
    TransactionConfig,
    CeloParams
])

export const RequestParams = t.type({
    tx:  CeloTx
})

export type StableTokenBalance = {
    value: string
    token: string
  }
