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
