"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("ts-runtime/lib");
// import { Config } from './config'
exports.default = lib_1.default.annotate(function (options) { var _optionsType = lib_1.default.nullable(lib_1.default.number()); lib_1.default.param("options", _optionsType).assert(options); }, lib_1.default.function(lib_1.default.param("options", lib_1.default.nullable(lib_1.default.number())), lib_1.default.return(lib_1.default.any())));
