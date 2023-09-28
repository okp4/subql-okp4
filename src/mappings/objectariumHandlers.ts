import type { CosmosMessage } from "@subql/types-cosmos";
import type {
    MsgExecuteContract,
    MsgInstantiateContract,
} from "cosmjs-types/cosmwasm/wasm/v1/tx";
import {
    ObjectariumObject,
    Objectarium,
    BucketConfig,
    BucketLimits,
    ObjectariumObjectPin,
    Account,
} from "../types";
import {
    findEventAttribute,
    objectariumObjectPinId,
    referenceEntityInMessage,
} from "./helper";
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
    const senderAccount = await Account.get(sender);

    if (!senderAccount) {
        const publicKey = msg.tx.decodedTx.authInfo.signerInfos.find(
            (signerInfo) => signerInfo.publicKey,
        )?.publicKey;

        await Account.create({
            id: msg.msg.decodedMsg.sender,
            pubKey: publicKey && {
                typeUrl: publicKey.typeUrl,
                key: Buffer.from(publicKey.value).toString("base64"),
            },
            balances: [],
        }).save();
    }

    await ObjectariumObject.create({
        id: objectId,
        senderId: sender,
        objectariumId: contract,
    }).save();

    const { pin: isPinned } = msg.msg.decodedMsg.msg.store_object;

    isPinned &&
        (await ObjectariumObjectPin.create({
            id: objectariumObjectPinId(objectId, sender),
            objectariumObjectId: objectId,
            accountId: sender,
        }).save());

    await referenceEntityInMessage(msg, {
        messageField: "objectariumObjectId",
        id: objectId,
    });
};

export const handleForgetObject = async (
    msg: CosmosMessage<MsgExecuteContract>,
): Promise<void> => {
    const objectId = objectariumObjectId(msg.tx.tx.events);
    if (!objectId) {
        return;
    }

    await ObjectariumObject.remove(objectId);
    await referenceEntityInMessage(msg, {
        messageField: "objectariumObjectId",
        id: objectId,
    });
};

export const handlePinObject = async (
    msg: CosmosMessage<MsgExecuteContract>,
): Promise<void> => {
    const objectId = objectariumObjectId(msg.tx.tx.events);
    if (!objectId) {
        return;
    }

    const { sender } = msg.msg.decodedMsg;
    const objectPin = ObjectariumObjectPin.get(
        objectariumObjectPinId(objectId, sender),
    );

    if (!objectPin) {
        await ObjectariumObjectPin.create({
            id: objectariumObjectPinId(objectId, sender),
            objectariumObjectId: objectId,
            accountId: sender,
        }).save();
    }

    await referenceEntityInMessage(msg, {
        messageField: "objectariumObjectId",
        id: objectId,
    });
};

export const handleUnpinObject = async (
    msg: CosmosMessage<MsgExecuteContract>,
): Promise<void> => {
    const objectId = objectariumObjectId(msg.tx.tx.events);
    if (!objectId) {
        return;
    }
    const { sender } = msg.msg.decodedMsg;

    await ObjectariumObjectPin.remove(objectariumObjectPinId(objectId, sender));
    await referenceEntityInMessage(msg, {
        messageField: "objectariumObjectId",
        id: objectId,
    });
};

export const handleInitObjectarium = async (
    msg: CosmosMessage<ObjectariumMsg<Instantiate>>,
): Promise<void> => {
    const contractAddress = findEventAttribute(
        msg.tx.tx.events,
        "instantiate",
        "_contract_address",
    )?.value;

    // TODO: filter the calling of this handler through the manifest.
    // Justification: There seems to be a bug with the filtering of events
    // that make it impossible to filter on the contract code id. The
    // following codeId variable allows to filter the handling of the
    // message before treating the msg as a objectarium instantiate msg.
    const codeId = findEventAttribute(
        msg.tx.tx.events,
        "instantiate",
        "code_id",
    )?.value;

    if (!contractAddress || codeId !== "4") {
        return;
    }

    const {
        sender,
        admin,
        label,
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
        creatorId: sender,
        ownerId: admin,
        label,
        name: bucket,
        config,
        limits,
        contractId: codeId,
    }).save();

    await referenceEntityInMessage(msg, {
        messageField: "objectariumId",
        id: contractAddress,
    });
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
): string | undefined => findEventAttribute(events, "wasm", "id")?.value;
