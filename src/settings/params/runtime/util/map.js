"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FMap extends Map {
    constructor() {
        super(...arguments);
        this.getOrElse = (key, fn) => {
            if (this.has(key)) {
                return this.get(key);
            }
            else {
                return fn();
            }
        };
        this.getOrThrow = (key) => this.getOrElse(key, () => {
            throw new RangeError(`key ${key} does not exist`);
        });
        this.map = (fn) => {
            const mapped = new FMap();
            for (const [key, val] of this) {
                mapped.set(key, fn(val, key));
            }
            return mapped;
        };
        this.reduce = (fn, initializer) => {
            let acc = initializer;
            for (const [key, val] of this) {
                acc = fn(acc, val, key, this);
            }
            return acc;
        };
        this.merge = (fmap) => {
            const merged = new FMap([...this]);
            for (const [key, val] of fmap) {
                merged.set(key, val);
            }
            return merged;
        };
    }
    toObject(fn = (v) => v) {
        const object = {};
        for (const [key, val] of this) {
            object[key.toString()] = fn(val, key);
        }
        return object;
    }
}
FMap.fromObject = (object) => {
    const fmap = new FMap();
    for (const [key, val] of Object.entries(object)) {
        fmap.set(key, val);
    }
    return fmap;
};
exports.FMap = FMap;
//# sourceMappingURL=map.js.map