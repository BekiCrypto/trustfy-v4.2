"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAuthMessage = buildAuthMessage;
exports.hashNonce = hashNonce;
exports.signatureMatchesMessage = signatureMatchesMessage;
const ethers_1 = require("ethers");
const node_crypto_1 = require("node:crypto");
function buildAuthMessage(payload) {
    return [
        `${payload.domain} requests signature for Trustfy authentication.`,
        `Address: ${payload.address}`,
        `Chain ID: ${payload.chainId}`,
        `Nonce: ${payload.nonce}`,
        `Issued At: ${payload.issuedAt}`,
        `Expiration Time: ${payload.expirationTime}`,
    ].join("\n");
}
function hashNonce(nonce) {
    return (0, node_crypto_1.createHash)("sha256").update(nonce).digest("hex");
}
function signatureMatchesMessage(signature, message, address) {
    try {
        const digest = (0, ethers_1.hashMessage)(message);
        const recovered = (0, ethers_1.recoverAddress)(digest, signature);
        return recovered.toLowerCase() === address.toLowerCase();
    }
    catch (error) {
        return false;
    }
}
