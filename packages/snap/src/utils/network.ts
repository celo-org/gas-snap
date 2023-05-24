interface Networks {
  [key: string]: Network;
}

export interface Network {
  name: string;
  chainIdHex: string;
  chainIdDecimal: number;
  url: string;
  explorer: string;
}

const networks: Networks = {
  '0xaef3': {
    name: 'Celo Alfajores',
    chainIdHex: '0xaef3',
    chainIdDecimal: 44787,
    url: 'https://alfajores-forno.celo-testnet.org',
    explorer: 'https://explorer.celo.org/alfajores',
  },
  '0xa4ec': {
    name: 'Celo Mainnet',
    chainIdHex: '0xa4ec',
    chainIdDecimal: 42220,
    url: 'https://forno.celo.org',
    explorer: 'https://explorer.celo.org/mainnet',
  },
};

export const getNetwork = (chainId: string): Network => {
  const network = networks[chainId];
  if (network == undefined) {
    throw new Error('Unsupported Network');
  }
  return network;
};
