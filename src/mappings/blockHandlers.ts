import type {
    CosmosBlock,
    CosmosMessage,
    CosmosTransaction,
} from "@subql/types-cosmos";
import { Block, Transaction, Message } from "../types";
import { messageId } from "./helper";

export const handleBlock = async (block: CosmosBlock): Promise<void> => {
    const {
        id,
        header: { chainId, height, time: timestamp },
    } = block.block;
    
    if (await Block.get(id)) {
        return;
    }
    await Block.create({
        id,
        chainId,
        height: BigInt(height),
        timestamp: timestamp.toISOString(),
    }).save();
};

export const handleTransaction = async (
    tx: CosmosTransaction
): Promise<void> => {
    const txId = tx.hash;

    await handleBlock(tx.block);
    await Transaction.create({
        id: txId,
        index: tx.idx,
        blockId: tx.block.block.id,
        gasUsed: BigInt(Math.trunc(tx.tx.gasUsed)),
        gasWanted: BigInt(Math.trunc(tx.tx.gasWanted)),
        fees:
            tx.decodedTx.authInfo.fee?.amount.map(({ denom, amount }) => ({
                denom,
                amount,
            })) || [],
        memo: tx.decodedTx.body.memo,
        timeoutHeight: BigInt(tx.decodedTx.body.timeoutHeight.toString()),
        log: JSON.parse(tx.tx.log || "[]"),
    }).save();
};

export const handleMessage = async (msg: CosmosMessage): Promise<void> => {
    const msgEntity = Message.create({
        id: messageId(msg),
        message: msg.msg,
        transactionId: msg.tx.hash,
        blockId: msg.block.block.id,
    });

    await msgEntity.save();
};
