"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = __importDefault(require("ts-runtime/lib"));
// scraper name
exports.ScraperName = lib_1.default.type("ScraperName", lib_1.default.string());
const ScraperGroup = lib_1.default.type("ScraperGroup", lib_1.default.string());
const InputKey = lib_1.default.type("InputKey", lib_1.default.string());
const Import = lib_1.default.type("Import", lib_1.default.string());
const RegexRemove = lib_1.default.type("RegexRemove", lib_1.default.string());
const RegexReplace = lib_1.default.type("RegexReplace", lib_1.default.object(lib_1.default.property("selector", lib_1.default.string()), lib_1.default.property("replacer", lib_1.default.string())));
const RegexCleanup = lib_1.default.type("RegexCleanup", lib_1.default.union(lib_1.default.ref(RegexRemove), lib_1.default.ref(RegexReplace)));
const InputSimple = lib_1.default.type("InputSimple", lib_1.default.ref(InputKey));
const InputCleaned = lib_1.default.type("InputCleaned", lib_1.default.object(lib_1.default.property("name", lib_1.default.ref(InputKey)), lib_1.default.property("regexCleanup", lib_1.default.ref(RegexCleanup))));
const Input = lib_1.default.type("Input", lib_1.default.union(lib_1.default.ref(InputSimple), lib_1.default.ref(InputCleaned)));
const Template = lib_1.default.type("Template", lib_1.default.string());
const UrlMethods = lib_1.default.type("UrlMethods", lib_1.default.union(lib_1.default.string("GET"), lib_1.default.string("POST"), lib_1.default.string("PUT"), lib_1.default.string("DELETE")));
const DownloadConfigInterface = lib_1.default.type("DownloadConfigInterface", lib_1.default.object(lib_1.default.property("method", lib_1.default.ref(UrlMethods), true), lib_1.default.property("urlTemplate", lib_1.default.ref(Template)), lib_1.default.property("headerTemplates", lib_1.default.object(lib_1.default.indexer("headerName", lib_1.default.string(), lib_1.default.ref(Template))), true), lib_1.default.property("regexCleanup", lib_1.default.ref(RegexCleanup), true)));
exports.DownloadConfigInit = lib_1.default.type("DownloadConfigInit", lib_1.default.union(lib_1.default.ref(Template), lib_1.default.ref(DownloadConfigInterface)));
exports.DownloadConfig = lib_1.default.type("DownloadConfig", lib_1.default.intersect(lib_1.default.ref(DownloadConfigInterface), lib_1.default.object(lib_1.default.property("method", lib_1.default.ref(UrlMethods)), lib_1.default.property("headerTemplates", lib_1.default.object(lib_1.default.indexer("headerName", lib_1.default.string(), lib_1.default.ref(Template)))))));
const ExpectedFormats = lib_1.default.type("ExpectedFormats", lib_1.default.union(lib_1.default.string("html"), lib_1.default.string("json")));
const Selector = lib_1.default.type("Selector", lib_1.default.string());
const ParseConfigInterface = lib_1.default.type("ParseConfigInterface", lib_1.default.object(lib_1.default.property("expect", lib_1.default.ref(ExpectedFormats), true), lib_1.default.property("selector", lib_1.default.ref(Selector)), lib_1.default.property("attribute", lib_1.default.string(), true), lib_1.default.property("regexCleanup", lib_1.default.ref(RegexCleanup), true)));
exports.ParseConfigInit = lib_1.default.type("ParseConfigInit", lib_1.default.union(lib_1.default.ref(Selector), lib_1.default.ref(ParseConfigInterface)));
exports.ParseConfig = lib_1.default.type("ParseConfig", lib_1.default.intersect(lib_1.default.ref(ParseConfigInterface), lib_1.default.object(lib_1.default.property("expect", lib_1.default.ref(ExpectedFormats)))));
const Incrementers = lib_1.default.type("Incrementers", lib_1.default.union(lib_1.default.string("failed-download"), lib_1.default.string("empty-parse"), lib_1.default.number()));
// returned by ./make-flat-config.ts
exports.ConfigPositionInfo = lib_1.default.type("ConfigPositionInfo", lib_1.default.object(lib_1.default.property("depth", lib_1.default.number()), lib_1.default.property("horizontalIndex", lib_1.default.number()), lib_1.default.property("name", lib_1.default.ref(exports.ScraperName)), lib_1.default.property("parentName", lib_1.default.ref(exports.ScraperName), true)));
exports.FlatConfig = lib_1.default.type("FlatConfig", lib_1.default.object(lib_1.default.indexer("scraperName", lib_1.default.string(), lib_1.default.ref(exports.ConfigPositionInfo))));
exports.ScrapeConfigInit = lib_1.default.type("ScrapeConfigInit", lib_1.default.object(lib_1.default.property("download", lib_1.default.ref(exports.DownloadConfigInit), true), lib_1.default.property("parse", lib_1.default.ref(exports.ParseConfigInit), true), lib_1.default.property("incrementUntil", lib_1.default.ref(Incrementers), true)));
exports.ScrapeConfig = lib_1.default.type("ScrapeConfig", lib_1.default.object(lib_1.default.property("download", lib_1.default.ref(exports.DownloadConfig), true), lib_1.default.property("parse", lib_1.default.ref(exports.ParseConfig), true), lib_1.default.property("incrementUntil", lib_1.default.ref(Incrementers))));
const StructureInit = lib_1.default.type("StructureInit", StructureInit => lib_1.default.object(lib_1.default.property("scraper", lib_1.default.ref(exports.ScraperName)), lib_1.default.property("scrapeEach", lib_1.default.union(lib_1.default.ref(StructureInit), lib_1.default.array(lib_1.default.ref(StructureInit))), true), lib_1.default.property("scrapeNext", lib_1.default.union(lib_1.default.ref(StructureInit), lib_1.default.array(lib_1.default.ref(StructureInit))), true)));
const Structure = lib_1.default.type("Structure", Structure => lib_1.default.intersect(lib_1.default.ref(StructureInit), lib_1.default.object(lib_1.default.property("scrapeEach", lib_1.default.array(lib_1.default.ref(Structure))), lib_1.default.property("scrapeNext", lib_1.default.array(lib_1.default.ref(Structure))))));
exports.ConfigInit = lib_1.default.type("ConfigInit", lib_1.default.object(lib_1.default.property("input", lib_1.default.union(lib_1.default.ref(Input), lib_1.default.array(lib_1.default.ref(Input))), true), lib_1.default.property("import", lib_1.default.union(lib_1.default.ref(Import), lib_1.default.array(lib_1.default.ref(Import))), true), lib_1.default.property("defs", lib_1.default.object(lib_1.default.indexer("scraperName", lib_1.default.string(), lib_1.default.ref(exports.ScrapeConfigInit)))), lib_1.default.property("structure", lib_1.default.ref(StructureInit))));
// returned by ./normalize.ts
exports.Config = lib_1.default.type("Config", lib_1.default.intersect(lib_1.default.ref(exports.ConfigInit), lib_1.default.object(lib_1.default.property("input", lib_1.default.array(lib_1.default.ref(Input))), lib_1.default.property("import", lib_1.default.array(lib_1.default.ref(Import))), lib_1.default.property("defs", lib_1.default.object(lib_1.default.indexer("scraperName", lib_1.default.string(), lib_1.default.ref(exports.ScrapeConfig)))), lib_1.default.property("structure", lib_1.default.ref(Structure)))));
//# sourceMappingURL=types.js.map