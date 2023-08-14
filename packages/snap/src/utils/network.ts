import { CELO_ALFAJORES, CELO_MAINNET } from "../constants";

const networks = [{
    "name": CELO_ALFAJORES,
    "chainIdHex": "0xaef3",
    "chainIdDecimal": 44787,
    "url": "https://alfajores-forno.celo-testnet.org",
    "explorer": "https://explorer.celo.org/alfajores"
}, {
    "name": CELO_MAINNET,
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

export async function getNetworkConfig(): Promise<Network> {
    const chainId = await ethereum.request({ method: 'eth_chainId' }) as string
    return getNetwork(chainId)
  }
