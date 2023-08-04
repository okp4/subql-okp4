import type { CosmosMessage } from "@subql/types-cosmos";
import type { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { ObjectariumObject } from "../types";
import { getObjectariumObjectId } from "../utils/utils";

export const handlePinObject = async (
    msg: CosmosMessage<MsgExecuteContract>
): Promise<void> => {
    const objectId = getObjectariumObjectId(msg.tx.tx.events);
    const object = objectId ? await ObjectariumObject.get(objectId) : null;

    if (object) {
        const { sender } = msg.msg.decodedMsg;

        object.pins = object.pins || [];

        if (!object.pins.includes(sender)) {
            object.pins.push(sender);
            await object.save();
        }
    }
};
