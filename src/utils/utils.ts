import type { Event } from "@cosmjs/tendermint-rpc/build/tendermint37";

export const getObjectariumObjectId = (
    events: Readonly<Event[]>
): string | undefined =>
    events
        .find((event) => event.type === "wasm")
        ?.attributes.find((attribute) => attribute.key === "id")?.value;

type Saveable = {
    save: () => Promise<void>;
};

export const save = async (saveable: Saveable): Promise<void> => {
    await saveable.save();
};

export const saveAll = async (saveables: Saveable[]): Promise<void> => {
    await Promise.all(saveables.map((it) => save(it)));
};
