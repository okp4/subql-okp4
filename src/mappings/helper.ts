import type { CosmosEvent, CosmosMessage } from "@subql/types-cosmos";
import { Message } from "../types";
import type {
    Event,
    Attribute,
} from "@cosmjs/tendermint-rpc/build/tendermint37";

export const messageId = (msg: CosmosMessage | CosmosEvent): string =>
    `${msg.tx.hash}-${msg.idx}`;

export const objectariumObjectPinId = (
    objectId: string,
    sender: string,
): string => `${objectId}-${sender}`;

export const contractPermissionAccountId = (
    contractId: string,
    account: string,
): string => `${contractId}-${account}`;

export const findEvent = (
    events: Readonly<Event[]>,
    event: string,
): Event | undefined => events.find(({ type }) => type === event);

export const findEventAttribute = (
    events: Readonly<Event[]>,
    event: string,
    attribute: string,
): Attribute | undefined =>
    findEvent(events, event)?.attributes.find(({ key }) => key === attribute);

export const referenceEntityInMessage = async (
    msg: CosmosMessage,
    entity: {
        id: string;
        messageField: keyof Pick<
            Message,
            | "objectariumObjectId"
            | "objectariumId"
            | "blockId"
            | "transactionId"
        >;
    },
): Promise<void> => {
    const message = await Message.get(messageId(msg));
    if (!message) {
        return;
    }

    switch (entity.messageField) {
        case "objectariumObjectId":
            message.objectariumObjectId = entity.id;
            break;
        case "objectariumId":
            message.objectariumId = entity.id;
            break;
        case "blockId":
            message.blockId = entity.id;
            break;
        case "transactionId":
            message.transactionId = entity.id;
            break;
    }

    await message.save();
};
