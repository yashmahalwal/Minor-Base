export function getRandomElement(collection: Map<string, Record<string, any>>) {
    const keys = Array.from(collection.keys());
    return collection.get(keys[Math.floor(Math.random() * keys.length)]);
}
