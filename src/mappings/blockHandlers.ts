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
export const handleTransaction = async (
    tx: CosmosTransaction
): Promise<void> => {
    let status = TxStatus.Error;
    if (tx.tx.log) {
        try {
            JSON.parse(tx.tx.log);
            status = TxStatus.Success;
        } catch {
            // NB: assume tx failed
        }
    }

    const txId = tx.hash;
    const coinEntities =
        tx.decodedTx.authInfo.fee?.amount.map((coin, idx) =>
            Coin.create({
                id: coinId(tx, idx),
                denom: coin.denom,
                amount: BigInt(coin.amount),
                transactionId: txId,
            })
        ) || [];
    await saveAll(coinEntities);

    const txEntity = Transaction.create({
        id: txId,
        index: tx.idx,
        blockId: tx.block.block.id,
        gasUsed: BigInt(Math.trunc(tx.tx.gasUsed)),
        gasWanted: BigInt(Math.trunc(tx.tx.gasWanted)),
        memo: tx.decodedTx.body.memo,
        timeoutHeight: BigInt(tx.decodedTx.body.timeoutHeight.toString()),
        log: JSON.parse(tx.tx.log || "[]"),
        status,
    });
    await save(txEntity);
};
