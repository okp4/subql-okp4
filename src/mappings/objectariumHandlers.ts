import type { CosmosMessage } from "@subql/types-cosmos";
import type {
    MsgExecuteContract,
    MsgInstantiateContract,
} from "cosmjs-types/cosmwasm/wasm/v1/tx";
import {
    Message,
    ObjectariumObject,
    Objectarium,
    BucketConfig,
    BucketLimits,
} from "../types";
import { messageId } from "./helper";
import type { Event } from "@cosmjs/tendermint-rpc/build/tendermint37";

type StoreObject = {
    pin: boolean;
};

type Execute = Omit<MsgExecuteContract, "msg"> & {
    msg: {
        store_object: StoreObject;
    };
};

type ObjectariumBucketConfig = {
    hash_algorithm?: string;
    accepted_compression_algorithms?: string[];
};

type ObjectariumBucketLimits = {
    max_total_size?: bigint;
    max_objects?: bigint;
    max_object_size?: bigint;
    max_object_pins?: bigint;
};

type Instantiate = Omit<MsgInstantiateContract, "msg"> & {
    msg: {
        bucket: string;
        config?: ObjectariumBucketConfig;
        limits?: ObjectariumBucketLimits;
    };
};

type ContractCalls = Execute | Instantiate;
type ObjectariumMsg<T extends ContractCalls> = T;

export const handleStoreObject = async (
    msg: CosmosMessage<ObjectariumMsg<Execute>>,
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
        objectariumId: contract,
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

export const handleInitObjectarium = async (
    msg: CosmosMessage<ObjectariumMsg<Instantiate>>,
): Promise<void> => {
    const contractAddress = msg.tx.tx.events
        .find(({ type }) => type === "instantiate")
        ?.attributes.find((attribute) => attribute.key === "_contract_address")
        ?.value;

    // TODO: filter the calling of this handler through the manifest.
    // Justification: There seems to be a bug with the filtering of events
    // that make it impossible to filter on the contract code id. The
    // following codeId variable allows to filter the handling of the
    // message before treating the msg as a objectarium instantiate msg.
    const codeId = msg.tx.tx.events
        .find(({ type }) => type === "instantiate")
        ?.attributes.find((attribute) => attribute.key === "code_id")?.value;

    if (!contractAddress || codeId !== "4") {
        return;
    }

    const {
        sender,
        msg: { bucket, limits: bucketLimits, config: bucketConfig },
    } = msg.msg.decodedMsg;
    const limits: BucketLimits = {
        maxTotalSize: bucketLimits?.max_total_size,
        maxObjectSize: bucketLimits?.max_object_size,
        maxObjects: bucketLimits?.max_objects,
        maxObjectPins: bucketLimits?.max_object_pins,
    };
    const config: BucketConfig = {
        hashAlgorithm: bucketConfig?.hash_algorithm,
        acceptedCompressionAlgorithms:
            bucketConfig?.accepted_compression_algorithms,
    };

    await Objectarium.create({
        id: contractAddress,
        owner: sender,
        name: bucket,
        config,
        limits,
    }).save();
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
