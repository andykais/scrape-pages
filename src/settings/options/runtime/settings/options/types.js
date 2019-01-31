"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = __importDefault(require("ts-runtime/lib"));
const map_1 = require("../../util/map");
const ScraperName = lib_1.default.type("ScraperName", lib_1.default.string());
const LogLevel = lib_1.default.type("LogLevel", lib_1.default.union(lib_1.default.string("debug"), lib_1.default.string("info"), lib_1.default.string("warn"), lib_1.default.string("error")));
exports.Input = lib_1.default.type("Input", lib_1.default.object(lib_1.default.indexer("inputName", lib_1.default.string(), lib_1.default.any())));
const OptionsAnyInit = lib_1.default.type("OptionsAnyInit", lib_1.default.object(lib_1.default.property("logLevel", lib_1.default.ref(LogLevel), true), lib_1.default.property("cache", lib_1.default.boolean(), true)));
const ScraperOptionsInit = lib_1.default.type("ScraperOptionsInit", lib_1.default.intersect(lib_1.default.ref(OptionsAnyInit), lib_1.default.object(lib_1.default.property("downloadPriority", lib_1.default.number(), true), lib_1.default.property("cache", lib_1.default.boolean(), true), lib_1.default.property("read", lib_1.default.boolean(), true), lib_1.default.property("write", lib_1.default.boolean(), true))));
const ScraperOptions = lib_1.default.type("ScraperOptions", lib_1.default.intersect(lib_1.default.ref("Required.631742855", lib_1.default.ref(ScraperOptionsInit)), lib_1.default.object()));
const Parallelism = lib_1.default.type("Parallelism", lib_1.default.object(lib_1.default.property("maxConcurrent", lib_1.default.number(), true), lib_1.default.property("rateLimit", lib_1.default.object(lib_1.default.property("rate", lib_1.default.number()), lib_1.default.property("limit", lib_1.default.number())), true)));
exports.OptionsInit = lib_1.default.type("OptionsInit", lib_1.default.intersect(lib_1.default.ref(OptionsAnyInit), lib_1.default.ref(Parallelism), lib_1.default.object(lib_1.default.property("input", lib_1.default.ref(exports.Input), true), lib_1.default.property("folder", lib_1.default.string()), lib_1.default.property("cleanFolder", lib_1.default.boolean(), true), lib_1.default.property("logToFile", lib_1.default.string(), true), lib_1.default.property("optionsEach", lib_1.default.object(lib_1.default.indexer("scraperName", lib_1.default.string(), lib_1.default.ref(ScraperOptionsInit))), true))));
exports.Options = lib_1.default.type("Options", lib_1.default.intersect(lib_1.default.ref(ScraperOptions), lib_1.default.object(lib_1.default.property("input", lib_1.default.ref(exports.Input)), lib_1.default.property("folder", lib_1.default.string()))));
exports.FlatOptions = lib_1.default.type("FlatOptions", lib_1.default.ref(map_1.FMap, lib_1.default.ref(ScraperName), lib_1.default.ref(exports.Options)));
//# sourceMappingURL=types.js.map