

const networks = [{
    "name": "Celo Alfajores",
    "chainIdHex": "0xaef3",
    "chainIdDecimal": 44787,
    "url": "https://alfajores-forno.celo-testnet.org"
}, {
    "name": "Celo Mainnet",
    "chainIdHex": "0xa4ec",
    "chainIdDecimal": 42220,
    "url": "https://forno.celo.org"
}
]

export interface Network {
    name: string;
    chainIdHex: string,
    chainIdDecimal: number,
    url: string
}

export const getNetwork = (chainId: string): Network => {
    const network = networks.filter((n: Network) => n.chainIdHex == chainId)
    if (network.length == 0) {
        throw new Error("Unsupported Network")
    }
    return network[0];
};
