import type { CosmosBlock, CosmosMessage, CosmosTransaction } from "@subql/types-cosmos";
import { Coin, Block, TxStatus, Transaction, Message } from "../types";
import { save, saveAll } from "../utils/utils";
import { messageId } from "./helper";

export const handleBlock = async (block: CosmosBlock): Promise<void> => {
    const {
        id,
        header: { chainId, height, time: timestamp },
    } = block.block;
    const blockEntity = Block.create({
        id,
        chainId,
        height: BigInt(height),
        timestamp: timestamp.toISOString(),
    });

    await blockEntity.save();
};
