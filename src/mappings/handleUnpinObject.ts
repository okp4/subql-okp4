import type { CosmosMessage } from "@subql/types-cosmos";
import type { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { ObjectariumObject } from "../types";
import { getObjectariumObjectId } from "../utils/utils";

export const handleUnpinObject = async (
    msg: CosmosMessage<MsgExecuteContract>
): Promise<void> => {
    const objectId = getObjectariumObjectId(msg.tx.tx.events);
    const object = objectId && (await ObjectariumObject.get(objectId));

    if (object && object.pins) {
        const filteredPins = object.pins.filter(
            (address) => address !== msg.msg.decodedMsg.sender
        );

        if (!object.pins.every((address) => filteredPins.includes(address))) {
            object.pins = filteredPins;
            await object.save();
        }
    }
};
