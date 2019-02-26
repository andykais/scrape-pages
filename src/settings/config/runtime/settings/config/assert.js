"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../../tsr-declarations");
const lib_1 = __importDefault(require("ts-runtime/lib"));
const types_1 = require("./types");
// TODO convert to `typescript-is` once https://github.com/woutervh-/typescript-is/issues/12 is closed.
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
exports.assertConfigType = lib_1.default.annotate((configInit) => { let _configInitType = lib_1.default.ref(types_1.ConfigInit); lib_1.default.param("configInit", _configInitType).assert(configInit); }, lib_1.default.function(lib_1.default.param("configInit", lib_1.default.ref(types_1.ConfigInit)), lib_1.default.return(lib_1.default.any())));
//# sourceMappingURL=assert.js.map