import { CosmosEvent, CosmosMessage } from "@subql/types-cosmos";
import { Message } from "../types";

export const messageId = (msg: CosmosMessage | CosmosEvent): string =>
    `${msg.tx.hash}-${msg.idx}`;

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
