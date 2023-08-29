import type { CosmosMessage } from "@subql/types-cosmos";
import type { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { Message, ObjectariumObject } from "../types";
import { messageId } from "./helper";
import type { Event } from "@cosmjs/tendermint-rpc/build/tendermint37";

type StoreObject = {
    pin: boolean;
};

type Msg = {
    store_object: StoreObject;
};

type ObjectariumMsgExecuteContract = Omit<MsgExecuteContract, "msg"> & {
    msg: Msg;
};

export const handleStoreObject = async (
    msg: CosmosMessage<ObjectariumMsgExecuteContract>,
): Promise<void> => {
    const objectId = objectariumObjectId(msg.tx.tx.events);
    if (!objectId) {
        return;
    }

    const { sender, contract } = msg.msg.decodedMsg;
    const { pin: isPinned } = msg.msg.decodedMsg.msg.store_object;

    await ObjectariumObject.create({
        id: objectId,
        sender,
        contract,
        pins: isPinned ? [sender] : [],
    }).save();

    await referenceObjectInMessage(msg, objectId);
};

export const handleForgetObject = async (
    msg: CosmosMessage<MsgExecuteContract>,
): Promise<void> => {
    const objectId = objectariumObjectId(msg.tx.tx.events);
    if (!objectId) {
        return;
    }

    await ObjectariumObject.remove(objectId);
    await referenceObjectInMessage(msg, objectId);
};

export const handlePinObject = async (
    msg: CosmosMessage<MsgExecuteContract>,
): Promise<void> => {
    const object = await retrieveObjectariumObject(msg);
    if (!object) {
        return;
    }

    const { sender } = msg.msg.decodedMsg;

    if (!object.pins.includes(sender)) {
        object.pins.push(sender);
        await object.save();
    }

    await referenceObjectInMessage(msg, object.id);
};

export const handleUnpinObject = async (
    msg: CosmosMessage<MsgExecuteContract>,
): Promise<void> => {
    const object = await retrieveObjectariumObject(msg);
    if (!object) {
        return;
    }

    const { sender } = msg.msg.decodedMsg;
    const filteredPins = object.pins.filter((address) => address !== sender);

    if (filteredPins.length !== object.pins.length) {
        object.pins = filteredPins;
        await object.save();
    }

    await referenceObjectInMessage(msg, object.id);
};

export const referenceObjectInMessage = async (
    msg: CosmosMessage,
    objectId: string,
): Promise<void> => {
    const message = await Message.get(messageId(msg));
    if (!message) {
        return;
    }

    message.objectariumObjectId = objectId;
    await message.save();
};

export const retrieveObjectariumObject = async (
    msg: CosmosMessage,
): Promise<ObjectariumObject | undefined> => {
    const objectId = objectariumObjectId(msg.tx.tx.events);
    if (!objectId) {
        return;
    }

    return await ObjectariumObject.get(objectId);
};

export const objectariumObjectId = (
    events: Readonly<Event[]>,
): string | undefined =>
    events
        .find((event) => event.type === "wasm")
        ?.attributes.find((attribute) => attribute.key === "id")?.value;
