"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("ts-runtime/lib");
// scraper name
exports.ScraperName = lib_1.default.type("ScraperName", lib_1.default.nullable(lib_1.default.string()));
var ScraperGroup = lib_1.default.type("ScraperGroup", lib_1.default.nullable(lib_1.default.string()));
var InputKey = lib_1.default.type("InputKey", lib_1.default.nullable(lib_1.default.string()));
var RegexRemove = lib_1.default.type("RegexRemove", lib_1.default.nullable(lib_1.default.string()));
var RegexReplace = lib_1.default.type("RegexReplace", lib_1.default.object(lib_1.default.property("selector", lib_1.default.nullable(lib_1.default.string())), lib_1.default.property("replacer", lib_1.default.nullable(lib_1.default.string()))));
var RegexCleanup = lib_1.default.type("RegexCleanup", lib_1.default.nullable(lib_1.default.union(lib_1.default.nullable(lib_1.default.ref(RegexRemove)), lib_1.default.nullable(lib_1.default.ref(RegexReplace)))));
var InputSimple = lib_1.default.type("InputSimple", lib_1.default.nullable(lib_1.default.ref(InputKey)));
var InputCleaned = lib_1.default.type("InputCleaned", lib_1.default.object(lib_1.default.property("name", lib_1.default.nullable(lib_1.default.ref(InputKey))), lib_1.default.property("regexCleanup", lib_1.default.nullable(lib_1.default.ref(RegexCleanup)))));
var Input = lib_1.default.type("Input", lib_1.default.nullable(lib_1.default.union(lib_1.default.nullable(lib_1.default.ref(InputSimple)), lib_1.default.nullable(lib_1.default.ref(InputCleaned)))));
var Template = lib_1.default.type("Template", lib_1.default.nullable(lib_1.default.string()));
var UrlMethods = lib_1.default.type("UrlMethods", lib_1.default.nullable(lib_1.default.union(lib_1.default.nullable(lib_1.default.string("GET")), lib_1.default.nullable(lib_1.default.string("POST")), lib_1.default.nullable(lib_1.default.string("PUT")), lib_1.default.nullable(lib_1.default.string("DELETE")))));
var DownloadConfigInterface = lib_1.default.type("DownloadConfigInterface", lib_1.default.object(lib_1.default.property("method", lib_1.default.nullable(lib_1.default.ref(UrlMethods)), true), lib_1.default.property("urlTemplate", lib_1.default.nullable(lib_1.default.ref(Template))), lib_1.default.property("headerTemplates", lib_1.default.object(lib_1.default.indexer("headerName", lib_1.default.nullable(lib_1.default.string()), lib_1.default.nullable(lib_1.default.ref(Template)))), true), lib_1.default.property("regexCleanup", lib_1.default.nullable(lib_1.default.ref(RegexCleanup)), true)));
exports.DownloadConfigInit = lib_1.default.type("DownloadConfigInit", lib_1.default.nullable(lib_1.default.union(lib_1.default.nullable(lib_1.default.ref(Template)), lib_1.default.nullable(lib_1.default.ref(DownloadConfigInterface)))));
exports.DownloadConfig = lib_1.default.type("DownloadConfig", lib_1.default.intersect(lib_1.default.ref(DownloadConfigInterface), lib_1.default.object(lib_1.default.property("method", lib_1.default.nullable(lib_1.default.ref(UrlMethods))), lib_1.default.property("headerTemplates", lib_1.default.object(lib_1.default.indexer("headerName", lib_1.default.nullable(lib_1.default.string()), lib_1.default.nullable(lib_1.default.ref(Template))))))));
var ExpectedFormats = lib_1.default.type("ExpectedFormats", lib_1.default.nullable(lib_1.default.union(lib_1.default.nullable(lib_1.default.string("html")), lib_1.default.nullable(lib_1.default.string("json")))));
var Selector = lib_1.default.type("Selector", lib_1.default.nullable(lib_1.default.string()));
var ParseConfigInterface = lib_1.default.type("ParseConfigInterface", lib_1.default.object(lib_1.default.property("expect", lib_1.default.nullable(lib_1.default.ref(ExpectedFormats)), true), lib_1.default.property("selector", lib_1.default.nullable(lib_1.default.ref(Selector))), lib_1.default.property("attribute", lib_1.default.nullable(lib_1.default.string()), true), lib_1.default.property("regexCleanup", lib_1.default.nullable(lib_1.default.ref(RegexCleanup)), true)));
exports.ParseConfigInit = lib_1.default.type("ParseConfigInit", lib_1.default.nullable(lib_1.default.union(lib_1.default.nullable(lib_1.default.ref(Selector)), lib_1.default.nullable(lib_1.default.ref(ParseConfigInterface)))));
exports.ParseConfig = lib_1.default.type("ParseConfig", lib_1.default.intersect(lib_1.default.ref(ParseConfigInterface), lib_1.default.object(lib_1.default.property("expect", lib_1.default.nullable(lib_1.default.ref(ExpectedFormats))))));
var Incrementers = lib_1.default.type("Incrementers", lib_1.default.nullable(lib_1.default.union(lib_1.default.nullable(lib_1.default.string("failed-download")), lib_1.default.nullable(lib_1.default.string("empty-parse")), lib_1.default.nullable(lib_1.default.number()))));
exports.ScrapeConfigInit = lib_1.default.type("ScrapeConfigInit", function (ScrapeConfigInit) { return lib_1.default.object(lib_1.default.property("name", lib_1.default.nullable(lib_1.default.ref(exports.ScraperName)), true), lib_1.default.property("download", lib_1.default.nullable(lib_1.default.ref(exports.DownloadConfigInit)), true), lib_1.default.property("parse", lib_1.default.nullable(lib_1.default.ref(exports.ParseConfigInit)), true), lib_1.default.property("incrementUntil", lib_1.default.nullable(lib_1.default.ref(Incrementers)), true), lib_1.default.property("scrapeNext", lib_1.default.nullable(lib_1.default.ref(ScrapeConfigInit)), true), lib_1.default.property("scrapeEach", lib_1.default.nullable(lib_1.default.union(lib_1.default.nullable(lib_1.default.ref(ScrapeConfigInit)), lib_1.default.nullable(lib_1.default.array(lib_1.default.nullable(lib_1.default.ref(ScrapeConfigInit)))))), true)); });
exports.ConfigInit = lib_1.default.type("ConfigInit", lib_1.default.object(lib_1.default.property("input", lib_1.default.nullable(lib_1.default.union(lib_1.default.nullable(lib_1.default.ref(Input)), lib_1.default.nullable(lib_1.default.array(lib_1.default.nullable(lib_1.default.ref(Input)))))), true), lib_1.default.property("scrape", lib_1.default.nullable(lib_1.default.ref(exports.ScrapeConfigInit)))));
// returned by ./normalize.ts
exports.ScrapeConfig = lib_1.default.type("ScrapeConfig", function (ScrapeConfig) { return lib_1.default.object(lib_1.default.property("name", lib_1.default.nullable(lib_1.default.ref(exports.ScraperName))), lib_1.default.property("download", lib_1.default.nullable(lib_1.default.ref(exports.DownloadConfig)), true), lib_1.default.property("parse", lib_1.default.nullable(lib_1.default.ref(exports.ParseConfig)), true), lib_1.default.property("incrementUntil", lib_1.default.nullable(lib_1.default.ref(Incrementers))), lib_1.default.property("scrapeNext", lib_1.default.nullable(lib_1.default.ref(ScrapeConfig)), true), lib_1.default.property("scrapeEach", lib_1.default.nullable(lib_1.default.array(lib_1.default.nullable(lib_1.default.ref(ScrapeConfig)))))); });
exports.Config = lib_1.default.type("Config", lib_1.default.intersect(lib_1.default.ref(exports.ConfigInit), lib_1.default.object(lib_1.default.property("input", lib_1.default.nullable(lib_1.default.array(lib_1.default.nullable(lib_1.default.ref(Input))))), lib_1.default.property("scrape", lib_1.default.nullable(lib_1.default.ref(exports.ScrapeConfig))))));
// returned by ./make-flat-config.ts
exports.ConfigPositionInfo = lib_1.default.type("ConfigPositionInfo", lib_1.default.object(lib_1.default.property("depth", lib_1.default.nullable(lib_1.default.number())), lib_1.default.property("horizontalIndex", lib_1.default.nullable(lib_1.default.number())), lib_1.default.property("name", lib_1.default.nullable(lib_1.default.ref(exports.ScraperName))), lib_1.default.property("parentName", lib_1.default.nullable(lib_1.default.ref(exports.ScraperName)), true)));
exports.FlatConfig = lib_1.default.type("FlatConfig", lib_1.default.object(lib_1.default.indexer("scraperName", lib_1.default.nullable(lib_1.default.string()), lib_1.default.nullable(lib_1.default.ref(exports.ConfigPositionInfo)))));
