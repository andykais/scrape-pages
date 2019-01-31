"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../../tsr-declarations");
const lib_1 = __importDefault(require("ts-runtime/lib"));
const types_1 = require("./types");
/* eslint-disable-next-line typescript/no-unused-vars */
exports.assertOptionsType = lib_1.default.annotate((options) => { let _optionsType = lib_1.default.ref(types_1.OptionsInit); lib_1.default.param("options", _optionsType).assert(options); }, lib_1.default.function(lib_1.default.param("options", lib_1.default.ref(types_1.OptionsInit)), lib_1.default.return(lib_1.default.any())));
//# sourceMappingURL=assert.js.map