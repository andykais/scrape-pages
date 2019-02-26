"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../../tsr-declarations");
const lib_1 = __importDefault(require("ts-runtime/lib"));
const types_1 = require("./types");
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
exports.assertConfigType = lib_1.default.annotate((config) => { let _configType = lib_1.default.ref(types_1.ConfigInit); lib_1.default.param("config", _configType).assert(config); }, lib_1.default.function(lib_1.default.param("config", lib_1.default.ref(types_1.ConfigInit)), lib_1.default.return(lib_1.default.any())));
//# sourceMappingURL=assert.js.map