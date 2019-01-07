"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("ts-runtime/lib");
var types_1 = require("./types");
/* eslint-disable-next-line typescript/no-unused-vars */
exports.assertOptionsType = lib_1.default.annotate(function (options) { var _optionsType = lib_1.default.nullable(lib_1.default.ref(types_1.RunOptionsInit)); lib_1.default.param("options", _optionsType).assert(options); }, lib_1.default.function(lib_1.default.param("options", lib_1.default.nullable(lib_1.default.ref(types_1.RunOptionsInit))), lib_1.default.return(lib_1.default.any())));
