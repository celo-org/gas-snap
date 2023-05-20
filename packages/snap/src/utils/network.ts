

const networks = [{
    "name": "Celo Alfajores",
    "chainIdHex": "0xaef3",
    "chainIdDecimal": 44787,
    "url": "https://alfajores-forno.celo-testnet.org",
    "explorer": "https://explorer.celo.org/alfajores"
}, {
    "name": "Celo Mainnet",
    "chainIdHex": "0xa4ec",
    "chainIdDecimal": 42220,
    "url": "https://forno.celo.org",
    "explorer": "https://explorer.celo.org/mainnet"
}
]

export interface Network {
    name: string;
    chainIdHex: string,
    chainIdDecimal: number,
    url: string,
    explorer: string
}

export const getNetwork = (chainId: string): Network => {
    const network = networks.filter((n: Network) => n.chainIdHex == chainId)
    if (network.length == 0) {
        throw new Error("Unsupported Network")
    }
    return network[0];
};
