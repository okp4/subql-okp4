import type { CosmosMessage } from "@subql/types-cosmos";
import type { MsgStoreCode } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { AccessType } from "cosmjs-types/cosmwasm/wasm/v1/types";
import { Account, Contract, ContractPermissionAccount } from "../types";
import { contractPermissionAccountId, findEventAttribute } from "./helper";

export const handleStoreContract = async (
    msg: CosmosMessage<MsgStoreCode>,
): Promise<void> => {
    const contractId = findEventAttribute(
        msg.tx.tx.events,
        "store_code",
        "code_id",
    )?.value;

    const dataHash = findEventAttribute(
        msg.tx.tx.events,
        "store_code",
        "code_checksum",
    )?.value;

    if (!contractId || !dataHash) {
        return;
    }

    const { instantiatePermission, sender } = msg.msg.decodedMsg;
    const senderAccount = await Account.get(sender);

    if (!senderAccount) {
        const publicKey = msg.tx.decodedTx.authInfo.signerInfos.find(
            (signerInfo) => signerInfo.publicKey,
        )?.publicKey;

        await Account.create({
            id: sender,
            pubKey: publicKey && {
                typeUrl: publicKey.typeUrl,
                key: Buffer.from(publicKey.value).toString("base64"),
            },
            balances: [],
        }).save();
    }

    const permission =
        instantiatePermission && AccessType[instantiatePermission.permission];

    await Contract.create({
        id: contractId,
        dataHash,
        creatorId: sender,
        permission,
    }).save();

    for (const permissionAddress in instantiatePermission?.addresses) {
        if (!(await Account.get(permissionAddress))) {
            await Account.create({
                id: permissionAddress,
                balances: [],
            }).save();
        }

        await ContractPermissionAccount.create({
            id: contractPermissionAccountId(contractId, sender),
            contractId: permissionAddress,
            accountId: sender,
        }).save();
    }
};
