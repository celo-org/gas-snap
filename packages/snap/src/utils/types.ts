import * as t from 'io-ts'

export const SimpleTransaction = t.intersection([
    t.type({
        to: t.string,
        value: t.string
    }),
    t.partial({
        feeCurrency: t.union([t.string, t.undefined])
    })
])

export const RequestParams = t.type({
    tx:  SimpleTransaction
})

export type StableTokenBalance = {
    value: string
    token: string
  }
