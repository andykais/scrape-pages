"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./tsr-declarations");
var lib_1 = require("ts-runtime/lib");
exports.assertConfigType = lib_1.default.annotate(function (config) { var _configType = lib_1.default.nullable(lib_1.default.ref("\"/home/andrew/Build/dev/scrape-pages/src/configuration/config\".Config.803044320")); lib_1.default.param("config", _configType).assert(config); }, lib_1.default.function(lib_1.default.param("config", lib_1.default.nullable(lib_1.default.ref("\"/home/andrew/Build/dev/scrape-pages/src/configuration/config\".Config.803044320"))), lib_1.default.return(lib_1.default.any())));
