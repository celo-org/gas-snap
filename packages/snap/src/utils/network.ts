import networkJson from "./networks.json";

export const getNetwork = (chainId: string) => { // todo expect proper type
    const network = Object.values(networkJson).find(x => x.chainId == chainId);
    if (!network) {
        throw new Error("Unsupported Network")
    }
    return network;
};
