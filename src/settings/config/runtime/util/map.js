"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var FMap_1, _a;
const lib_1 = __importDefault(require("ts-runtime/lib"));
const MapLike = lib_1.default.type("MapLike", MapLike => {
    const K = MapLike.typeParameter("K");
    const V = MapLike.typeParameter("V");
    return lib_1.default.union(lib_1.default.ref(lib_1.default.tdz(() => FMap, "FMap"), K, V), lib_1.default.ref("Map.2685527372", K, V));
});
const _FMapTypeParametersSymbol = Symbol("FMapTypeParameters");
let FMap = FMap_1 = class FMap extends Map {
    constructor(...args) {
        super(...args);
        this.getOrElse = lib_1.default.annotate((key, fn) => {
            const T = lib_1.default.typeParameter("T");
            let _keyType = this[_FMapTypeParametersSymbol].K;
            let _fnType = lib_1.default.function(lib_1.default.return(T));
            const _returnType = lib_1.default.return(lib_1.default.union(T, this[_FMapTypeParametersSymbol].V));
            lib_1.default.param("key", _keyType).assert(key);
            lib_1.default.param("fn", _fnType).assert(fn);
            if (this.has(key)) {
                return _returnType.assert((this.get(key)));
            }
            else {
                return _returnType.assert(fn());
            }
        }, lib_1.default.function(fn => {
            const T = fn.typeParameter("T");
            return [lib_1.default.param("key", this[_FMapTypeParametersSymbol].K), lib_1.default.param("fn", lib_1.default.function(lib_1.default.return(T))), lib_1.default.return(lib_1.default.union(T, this[_FMapTypeParametersSymbol].V))];
        }));
        this.getOrThrow = lib_1.default.annotate((key) => {
            let _keyType = this[_FMapTypeParametersSymbol].K;
            lib_1.default.param("key", _keyType).assert(key);
            return this.getOrElse(key, lib_1.default.annotate(() => {
                throw new RangeError(`key ${key} does not exist`);
            }, lib_1.default.function(lib_1.default.return(lib_1.default.any()))));
        }, lib_1.default.function(lib_1.default.param("key", this[_FMapTypeParametersSymbol].K), lib_1.default.return(lib_1.default.any())));
        this.map = lib_1.default.annotate((fn) => {
            const T = lib_1.default.typeParameter("T");
            let _fnType = lib_1.default.function(lib_1.default.param("val", this[_FMapTypeParametersSymbol].V), lib_1.default.param("key", this[_FMapTypeParametersSymbol].K), lib_1.default.return(T));
            const _returnType = lib_1.default.return(lib_1.default.ref(FMap_1, this[_FMapTypeParametersSymbol].K, T));
            lib_1.default.param("fn", _fnType).assert(fn);
            const mapped = new FMap_1();
            for (const [key, val] of this) {
                mapped.set(key, fn(val, key));
            }
            return _returnType.assert(mapped);
        }, lib_1.default.function(fn => {
            const T = fn.typeParameter("T");
            return [lib_1.default.param("fn", lib_1.default.function(lib_1.default.param("val", this[_FMapTypeParametersSymbol].V), lib_1.default.param("key", this[_FMapTypeParametersSymbol].K), lib_1.default.return(T))), lib_1.default.return(lib_1.default.ref(FMap_1, this[_FMapTypeParametersSymbol].K, T))];
        }));
        this.reduce = lib_1.default.annotate((fn, initializer) => {
            const T = lib_1.default.typeParameter("T");
            let _fnType = lib_1.default.function(lib_1.default.param("acc", lib_1.default.flowInto(T)), lib_1.default.param("val", this[_FMapTypeParametersSymbol].V), lib_1.default.param("key", this[_FMapTypeParametersSymbol].K), lib_1.default.param("map", lib_1.default.ref(FMap_1, this[_FMapTypeParametersSymbol].K, this[_FMapTypeParametersSymbol].V)), lib_1.default.return(T));
            let _initializerType = lib_1.default.flowInto(T);
            const _returnType = lib_1.default.return(T);
            lib_1.default.param("fn", _fnType).assert(fn);
            lib_1.default.param("initializer", _initializerType).assert(initializer);
            let acc = initializer;
            for (const [key, val] of this) {
                acc = fn(acc, val, key, this);
            }
            return _returnType.assert(acc);
        }, lib_1.default.function(fn => {
            const T = fn.typeParameter("T");
            return [lib_1.default.param("fn", lib_1.default.function(lib_1.default.param("acc", lib_1.default.flowInto(T)), lib_1.default.param("val", this[_FMapTypeParametersSymbol].V), lib_1.default.param("key", this[_FMapTypeParametersSymbol].K), lib_1.default.param("map", lib_1.default.ref(FMap_1, this[_FMapTypeParametersSymbol].K, this[_FMapTypeParametersSymbol].V)), lib_1.default.return(T))), lib_1.default.param("initializer", lib_1.default.flowInto(T)), lib_1.default.return(T)];
        }));
        this.merge = lib_1.default.annotate((fmap) => {
            let _fmapType = lib_1.default.ref(MapLike, this[_FMapTypeParametersSymbol].K, this[_FMapTypeParametersSymbol].V);
            const _returnType = lib_1.default.return(lib_1.default.ref(FMap_1, this[_FMapTypeParametersSymbol].K, this[_FMapTypeParametersSymbol].V));
            lib_1.default.param("fmap", _fmapType).assert(fmap);
            const merged = new FMap_1([...this]);
            for (const [key, val] of fmap) {
                merged.set(key, val);
            }
            return _returnType.assert(merged);
        }, lib_1.default.function(lib_1.default.param("fmap", lib_1.default.ref(MapLike, this[_FMapTypeParametersSymbol].K, this[_FMapTypeParametersSymbol].V)), lib_1.default.return(lib_1.default.ref(FMap_1, this[_FMapTypeParametersSymbol].K, this[_FMapTypeParametersSymbol].V))));
        const _typeParameters = {
            K: lib_1.default.typeParameter("K", void 0, lib_1.default.any()),
            V: lib_1.default.typeParameter("V", void 0, lib_1.default.any())
        };
        this[_FMapTypeParametersSymbol] = _typeParameters;
        lib_1.default.bindTypeParameters(this, this[_FMapTypeParametersSymbol].K, this[_FMapTypeParametersSymbol].V);
    }
    toObject(fn = lib_1.default.annotate((v) => {
        let _vType = this[_FMapTypeParametersSymbol].V;
        lib_1.default.param("v", _vType).assert(v);
        return v;
    }, lib_1.default.function(lib_1.default.param("v", this[_FMapTypeParametersSymbol].V), lib_1.default.return(lib_1.default.any())))) {
        const T = lib_1.default.typeParameter("T");
        let _fnType = lib_1.default.function(lib_1.default.param("val", this[_FMapTypeParametersSymbol].V), lib_1.default.param("key", this[_FMapTypeParametersSymbol].K), lib_1.default.return(lib_1.default.union(T, this[_FMapTypeParametersSymbol].V)));
        lib_1.default.param("fn", _fnType).assert(fn);
        const object = lib_1.default.object(lib_1.default.indexer("key", lib_1.default.string(), lib_1.default.union(lib_1.default.flowInto(T), this[_FMapTypeParametersSymbol].V))).assert({});
        for (const [key, val] of this) {
            object[key.toString()] = fn(val, key);
        }
        return object;
    }
};
_a = lib_1.default.TypeParametersSymbol;
FMap[_a] = _FMapTypeParametersSymbol;
FMap.fromObject = lib_1.default.annotate((object) => {
    const T = lib_1.default.typeParameter("T");
    let _objectType = lib_1.default.object(lib_1.default.indexer("key", lib_1.default.string(), lib_1.default.flowInto(T)));
    const _returnType = lib_1.default.return(lib_1.default.ref(FMap_1, lib_1.default.string(), T));
    lib_1.default.param("object", _objectType).assert(object);
    const fmap = new FMap_1();
    for (const [key, val] of Object.entries(object)) {
        fmap.set(key, val);
    }
    return _returnType.assert(fmap);
}, lib_1.default.function(fn => {
    const T = fn.typeParameter("T");
    return [lib_1.default.param("object", lib_1.default.object(lib_1.default.indexer("key", lib_1.default.string(), lib_1.default.flowInto(T)))), lib_1.default.return(lib_1.default.ref(FMap_1, lib_1.default.string(), T))];
}));
FMap = FMap_1 = __decorate([
    lib_1.default.annotate(lib_1.default.class("FMap", FMap => {
        const K = FMap.typeParameter("K", void 0, lib_1.default.any());
        const V = FMap.typeParameter("V", void 0, lib_1.default.any());
        return [lib_1.default.extends(lib_1.default.ref("Map.2685527372", K, V)), lib_1.default.property("getOrElse", lib_1.default.any()), lib_1.default.property("getOrThrow", lib_1.default.any()), lib_1.default.property("map", lib_1.default.any()), lib_1.default.property("reduce", lib_1.default.any()), lib_1.default.property("merge", lib_1.default.any()), lib_1.default.staticProperty("fromObject", lib_1.default.any()), lib_1.default.property("toObject", lib_1.default.function(fn => {
                const T = fn.typeParameter("T");
                return [lib_1.default.param("fn", lib_1.default.function(lib_1.default.param("val", V), lib_1.default.param("key", K), lib_1.default.return(T)), true), lib_1.default.return(lib_1.default.union(lib_1.default.object(lib_1.default.indexer("key", lib_1.default.string(), V)), lib_1.default.object(lib_1.default.indexer("key", lib_1.default.string(), T))))];
            }))];
    }))
], FMap);
exports.FMap = FMap;
//# sourceMappingURL=map.js.map