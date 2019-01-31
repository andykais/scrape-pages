"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = __importDefault(require("ts-runtime/lib"));
lib_1.default.declare("Map.2685527372", lib_1.default.type("Map", Map => {
    const K = Map.typeParameter("K");
    const V = Map.typeParameter("V");
    return lib_1.default.object(lib_1.default.property("size", lib_1.default.number()), lib_1.default.property(Symbol.toStringTag, lib_1.default.string()), lib_1.default.property("clear", lib_1.default.function(lib_1.default.return(lib_1.default.void()))), lib_1.default.property("delete", lib_1.default.function(lib_1.default.param("key", K), lib_1.default.return(lib_1.default.boolean()))), lib_1.default.property("forEach", lib_1.default.function(lib_1.default.param("callbackfn", lib_1.default.function(lib_1.default.param("value", V), lib_1.default.param("key", K), lib_1.default.param("map", lib_1.default.ref(Map, K, V)), lib_1.default.return(lib_1.default.void()))), lib_1.default.param("thisArg", lib_1.default.any(), true), lib_1.default.return(lib_1.default.void()))), lib_1.default.property("get", lib_1.default.function(lib_1.default.param("key", K), lib_1.default.return(lib_1.default.union(V, lib_1.default.undef())))), lib_1.default.property("has", lib_1.default.function(lib_1.default.param("key", K), lib_1.default.return(lib_1.default.boolean()))), lib_1.default.property("set", lib_1.default.function(lib_1.default.param("key", K), lib_1.default.param("value", V), lib_1.default.return(lib_1.default.this(this)))), lib_1.default.property(Symbol.iterator, lib_1.default.function(lib_1.default.return(lib_1.default.ref(IterableIterator, lib_1.default.tuple(K, V))))), lib_1.default.property("entries", lib_1.default.function(lib_1.default.return(lib_1.default.ref(IterableIterator, lib_1.default.tuple(K, V))))), lib_1.default.property("keys", lib_1.default.function(lib_1.default.return(lib_1.default.ref(IterableIterator, K)))), lib_1.default.property("values", lib_1.default.function(lib_1.default.return(lib_1.default.ref(IterableIterator, V)))));
}));
lib_1.default.declare("MapConstructor.2685527372", lib_1.default.type("MapConstructor", MapConstructor => lib_1.default.object(lib_1.default.property("prototype", lib_1.default.ref("Map.2685527372", lib_1.default.any(), lib_1.default.any())), lib_1.default.property(Symbol.species, lib_1.default.ref(MapConstructor)), lib_1.default.callProperty(lib_1.default.function(fn => {
    const K = fn.typeParameter("K");
    const V = fn.typeParameter("V");
    return [lib_1.default.param("entries", lib_1.default.union(lib_1.default.union(lib_1.default.ref(ReadonlyArray, lib_1.default.tuple(K, V)), lib_1.default.null()), lib_1.default.ref(Iterable, lib_1.default.tuple(K, V))), true), lib_1.default.return(lib_1.default.union(lib_1.default.ref("Map.2685527372", lib_1.default.any(), lib_1.default.any()), lib_1.default.ref("Map.2685527372", K, V)))];
})))));
lib_1.default.declare("RangeErrorConstructor.631742855", lib_1.default.type("RangeErrorConstructor", lib_1.default.object(lib_1.default.property("prototype", lib_1.default.ref(RangeError)), lib_1.default.callProperty(lib_1.default.function(lib_1.default.param("message", lib_1.default.string(), true), lib_1.default.return(lib_1.default.ref(RangeError)))))));
lib_1.default.declare("IterableIterator.2719799386", lib_1.default.type("IterableIterator", IterableIterator => {
    const T = IterableIterator.typeParameter("T");
    return lib_1.default.intersect(lib_1.default.ref(Iterator, T), lib_1.default.object(lib_1.default.property(Symbol.iterator, lib_1.default.function(lib_1.default.return(lib_1.default.ref(IterableIterator, T))))));
}));
lib_1.default.declare("Required.631742855", lib_1.default.type("Required", Required => {
    const T = Required.typeParameter("T");
    return lib_1.default.any();
}));
//# sourceMappingURL=module.jsx.map