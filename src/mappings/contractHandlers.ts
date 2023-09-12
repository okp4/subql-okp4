import type { CosmosMessage } from "@subql/types-cosmos";
import type { MsgStoreCode } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { Contract } from "../types";
import { findEventAttribute } from "./helper";

enum AccessType {
    ACCESS_TYPE_UNSPECIFIED = 0,
    ACCESS_TYPE_NOBODY = 1,
    ACCESS_TYPE_ONLY_ADDRESS = 2,
    ACCESS_TYPE_EVERYBODY = 3,
    ACCESS_TYPE_ANY_OF_ADDRESSES = 4,
    UNRECOGNIZED = -1,
}

export const handleStoreContract = async (
    msg: CosmosMessage<MsgStoreCode>,
): Promise<void> => {
    const id = findEventAttribute(msg.tx.tx.events, "store_code", "code_id")
        ?.value;

    const dataHash = findEventAttribute(
        msg.tx.tx.events,
        "store_code",
        "code_checksum",
    )?.value;

    if (!id || !dataHash) {
        return;
    }

    const { instantiatePermission: instantiatePermissionWithEnums, sender } =
        msg.msg.decodedMsg;

    const instantiatePermission = instantiatePermissionWithEnums && {
        ...instantiatePermissionWithEnums,
        permission: AccessType[instantiatePermissionWithEnums.permission],
    };

    await Contract.create({
        id,
        dataHash,
        creator: sender,
        instantiatePermission,
    }).save();
};
