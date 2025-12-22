import { hashMessage, recoverAddress } from "ethers";
import { createHash } from "node:crypto";
export function buildAuthMessage(payload) {
    return [
        `${payload.domain} requests signature for Trustfy authentication.`,
        `Address: ${payload.address}`,
        `Chain ID: ${payload.chainId}`,
        `Nonce: ${payload.nonce}`,
        `Issued At: ${payload.issuedAt}`,
        `Expiration Time: ${payload.expirationTime}`,
    ].join("\n");
}
export function hashNonce(nonce) {
    return createHash("sha256").update(nonce).digest("hex");
}
export function signatureMatchesMessage(signature, message, address) {
    const digest = hashMessage(message);
    const recovered = recoverAddress(digest, signature);
    return recovered.toLowerCase() === address.toLowerCase();
}
//# sourceMappingURL=auth.helpers.js.map