import type { Event } from "@cosmjs/tendermint-rpc/build/tendermint37";

export const getObjectariumObjectId = (
    events: Readonly<Event[]>
): string | undefined =>
    events
        .find((event) => event.type === "wasm")
        ?.attributes.find((attribute) => attribute.key === "id")?.value;
