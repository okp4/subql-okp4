import type { CosmosMessage } from "@subql/types-cosmos";
import type { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { ObjectariumObject } from "../types";
import { getObjectariumObjectId } from "../utils/utils";

type StoreObject = {
    pin: boolean;
};

type Msg = {
    store_object: StoreObject;
};

type ObjectariumMsgExecuteContract = Omit<MsgExecuteContract, "msg"> & {
    msg: Msg;
};

export const handleForgetObject = async (
    msg: CosmosMessage<MsgExecuteContract>
): Promise<void> => {
    const objectId = getObjectariumObjectId(msg.tx.tx.events);

    objectId && (await ObjectariumObject.remove(objectId));
};

export const handleStoreObject = async (
    msg: CosmosMessage<ObjectariumMsgExecuteContract>
): Promise<void> => {
    const objectId = getObjectariumObjectId(msg.tx.tx.events);

    if (objectId) {
        const { sender, contract } = msg.msg.decodedMsg;
        const { pin: isPinned } = msg.msg.decodedMsg.msg.store_object;

        await ObjectariumObject.create({
            id: objectId,
            sender,
            contract,
            pins: isPinned ? [sender] : [],
        }).save();
    }
};

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
