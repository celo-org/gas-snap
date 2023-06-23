import * as t from 'io-ts'
import { CeloTransactionRequest } from '@celo-tools/celo-ethers-wrapper'
import { BigNumber, BigNumberish, Bytes, ethers } from 'ethers';

export const BigNumberSchema: t.Type<BigNumber> = new t.Type(
    `BigNumberSchema`,
    BigNumber.isBigNumber,
    (unk: unknown, ctx: t.Context): t.Validation<BigNumber> => {
        if (BigNumber.isBigNumber(unk)) {
            return t.success(unk as BigNumber)
        }
        return t.failure(unk, ctx)
    },
    (bn: BigNumber) => bn
)

export const BytesSchema: t.Type<Bytes> = new t.Type(
    `BytesSchema`,
    ethers.utils.isBytes,
    (unk: unknown, ctx: t.Context): t.Validation<Bytes> => {
        if (ethers.utils.isBytes(unk)) {
            return t.success(unk as Bytes)
        }
        return t.failure(unk, ctx)
    },
    (bytes: Bytes) => bytes
)

export const BigNumberishSchema: t.Type<BigNumberish> = t.union([t.string, t.number, t.bigint, BigNumberSchema, BytesSchema])

export const CeloTransactionRequestSchema: t.Type<CeloTransactionRequest> = t.partial({
    to: t.union([t.string, t.undefined]),
    from: t.union([t.string, t.undefined]),
    nonce: t.union([BigNumberishSchema, t.undefined]),

    gasLimit: t.union([BigNumberishSchema, t.undefined]),
    gasPrice: t.union([BigNumberishSchema, t.undefined]),

    data: t.union([t.union([BytesSchema, t.string]), t.undefined]),
    value: t.union([BigNumberishSchema, t.undefined]),
    chainId: t.union([t.number, t.undefined]),

    feeCurrency: t.union([t.string, t.undefined]),
    gatewayFeeRecipient: t.union([t.string, t.undefined]),
    gatewayFee: t.union([BigNumberishSchema, t.undefined]),
})

export interface RequestParams { 
    tx: CeloTransactionRequest
}

export const RequestParamsSchema: t.Type<RequestParams> = t.type({
    tx:  CeloTransactionRequestSchema
})

export type SortedOraclesRates = {
    numerator: BigNumber
    denominator: BigNumber
}

export type TokenInfo = {
    address: string
    value: BigNumber
    balance?: BigNumber
    rates?: SortedOraclesRates
}