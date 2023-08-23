import { CosmosEvent, CosmosMessage } from "@subql/types-cosmos";

export const messageId = (msg: CosmosMessage | CosmosEvent): string => {
    return `${msg.tx.hash}-${msg.idx}`;
};
