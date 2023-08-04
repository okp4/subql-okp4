import type { CosmosMessage } from "@subql/types-cosmos";
import type { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { ObjectariumObject } from "../types";
import { getObjectariumObjectId } from "../utils/utils";

export const handleUnpinObject = async (
    msg: CosmosMessage<MsgExecuteContract>
): Promise<void> => {
    const objectId = getObjectariumObjectId(msg.tx.tx.events);
    const object = objectId ? await ObjectariumObject.get(objectId) : null;

    if (object?.pins) {
        const { sender } = msg.msg.decodedMsg;
        const filteredPins = object.pins.filter(
            (address) => address !== sender
        );

        if (filteredPins.length !== object.pins.length) {
            object.pins = filteredPins;
            await object.save();
        }
    }
};
