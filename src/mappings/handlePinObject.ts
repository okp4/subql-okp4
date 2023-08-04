import type { CosmosMessage } from "@subql/types-cosmos";
import type { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { ObjectariumObject } from "../types";
import { getObjectariumObjectId } from "../utils/utils";

export const handlePinObject = async (
    msg: CosmosMessage<MsgExecuteContract>
): Promise<void> => {
    const objectId = getObjectariumObjectId(msg.tx.tx.events);
    const object = objectId && (await ObjectariumObject.get(objectId));

    if (object) {
        if (object.pins && !object.pins.includes(msg.msg.decodedMsg.sender)) {
            object.pins.push(msg.msg.decodedMsg.sender);
            await object.save();
        }
        if (!object.pins) {
            object.pins = [msg.msg.decodedMsg.sender];
            await object.save();
        }
    }
};
