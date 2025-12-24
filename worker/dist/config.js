"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadWorkerConfig = void 0;
const node_process_1 = require("node:process");
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
const loadWorkerConfig = () => {
    const rpcUrls = parseChainRecord(node_process_1.env.RPC_URLS);
    const contractAddresses = parseChainRecord(node_process_1.env.CONTRACT_ADDRESS);
    const startBlocks = parseStartBlocks(node_process_1.env.START_BLOCK);
    if (!Object.keys(rpcUrls).length) {
        throw new Error("RPC_URLS must be defined in the environment");
    }
    if (!Object.keys(contractAddresses).length) {
        throw new Error("CONTRACT_ADDRESS must be defined in the environment");
    }
    const confirmations = Number(node_process_1.env.INDEXER_CONFIRMATIONS ?? 6);
    const pollIntervalMs = Number(node_process_1.env.INDEXER_POLL_MS ?? 5_000);
    const chunkSize = Number(node_process_1.env.INDEXER_CHUNK_SIZE ?? 1_000);
    const reorgSafetyBlocks = Number(node_process_1.env.INDEXER_REORG_BLOCKS ?? 12);
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
exports.loadWorkerConfig = loadWorkerConfig;
