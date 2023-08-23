import { CosmosEvent, CosmosMessage } from "@subql/types-cosmos";
import type { Event } from "@cosmjs/tendermint-rpc/build/tendermint37";

export const messageId = (msg: CosmosMessage | CosmosEvent): string => {
    return `${msg.tx.hash}-${msg.idx}`;
};

export const getObjectariumObjectId = (
    events: Readonly<Event[]>
): string | undefined =>
    events
        .find((event) => event.type === "wasm")
        ?.attributes.find((attribute) => attribute.key === "id")?.value;
