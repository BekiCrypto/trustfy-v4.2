"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatEscrowId = exports.parseEscrowId = void 0;
const common_1 = require("@nestjs/common");
const ESCROW_ID_REGEX = /^0x[0-9a-fA-F]{64}$/;
const parseEscrowId = (value) => {
    if (!value) {
        throw new common_1.BadRequestException("escrowId is required");
    }
    const normalized = value.startsWith("0x") ? value : `0x${value}`;
    if (!ESCROW_ID_REGEX.test(normalized)) {
        throw new common_1.BadRequestException("invalid escrowId format");
    }
    return Buffer.from(normalized.slice(2), "hex");
};
exports.parseEscrowId = parseEscrowId;
const formatEscrowId = (value) => {
    if (!value)
        return "";
    return `0x${value.toString("hex")}`;
};
exports.formatEscrowId = formatEscrowId;
