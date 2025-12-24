import { env } from "node:process";
const parseChainRecord = (value) => {
    if (!value)
        return {};
    return value.split(",").reduce((acc, chunk) => {
        const [chainIdRaw, ...rest] = chunk.split(/[:=]/);
        const rawValue = rest.join(":").trim();
        const chainId = Number(chainIdRaw?.trim());
        if (Number.isFinite(chainId) && rawValue) {
            acc[chainId] = rawValue;
        }
        return acc;
    }, {});
};
const parseStartBlocks = (value) => {
    if (!value)
        return {};
    return value.split(",").reduce((acc, chunk) => {
        const [chainIdRaw, ...rest] = chunk.split(/[:=]/);
        const rawValue = rest.join(":").trim();
        const chainId = Number(chainIdRaw?.trim());
        const start = Number(rawValue);
        if (Number.isFinite(chainId) && Number.isFinite(start)) {
            acc[chainId] = Math.max(0, start);
        }
        return acc;
    }, {});
};
export const loadWorkerConfig = () => {
    const rpcUrls = parseChainRecord(env.RPC_URLS);
    const contractAddresses = parseChainRecord(env.CONTRACT_ADDRESS);
    const startBlocks = parseStartBlocks(env.START_BLOCK);
    if (!Object.keys(rpcUrls).length) {
        throw new Error("RPC_URLS must be defined in the environment");
    }
    if (!Object.keys(contractAddresses).length) {
        throw new Error("CONTRACT_ADDRESS must be defined in the environment");
    }
    const confirmations = Number(env.INDEXER_CONFIRMATIONS ?? 6);
    const pollIntervalMs = Number(env.INDEXER_POLL_MS ?? 5_000);
    const chunkSize = Number(env.INDEXER_CHUNK_SIZE ?? 1_000);
    const reorgSafetyBlocks = Number(env.INDEXER_REORG_BLOCKS ?? 12);
    return {
        rpcUrls,
        contractAddresses,
        startBlocks,
        confirmations,
        chunkSize,
        pollIntervalMs,
        reorgSafetyBlocks,
    };
};
