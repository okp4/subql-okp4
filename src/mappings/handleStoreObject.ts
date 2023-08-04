import type { CosmosMessage } from "@subql/types-cosmos";
import type { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { ObjectariumObject } from "../types";
import { getObjectariumObjectId } from "../utils/utils";

export const handleStoreObject = async (
    msg: CosmosMessage<MsgExecuteContract>
): Promise<void> => {
    const objectId = getObjectariumObjectId(msg.tx.tx.events);

    objectId &&
        (await ObjectariumObject.create({
            id: objectId,
            sender: msg.msg.decodedMsg.sender,
            contract: msg.msg.decodedMsg.contract,
        }).save());
};
