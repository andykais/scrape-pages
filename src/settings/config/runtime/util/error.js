"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = __importDefault(require("ts-runtime/lib"));
const Rx = __importStar(require("rxjs"));
const verror_1 = __importDefault(require("verror"));
exports.wrapError = lib_1.default.annotate((message) => {
    return lib_1.default.annotate((e) => {
        let _eType = lib_1.default.ref("Error.631742855");
        lib_1.default.param("e", _eType).assert(e);
        return Rx.throwError(new verror_1.default({ name: e.name, cause: e }, message));
    }, lib_1.default.function(lib_1.default.param("e", lib_1.default.ref("Error.631742855")), lib_1.default.return(lib_1.default.any())));
}, lib_1.default.function(lib_1.default.param("message", lib_1.default.any()), lib_1.default.return(lib_1.default.any())));
let ResponseError = class ResponseError extends Error {
    constructor(response, url) {
        this.name = 'ResponseError';
        let _responseType = lib_1.default.ref("\"/Users/andrew/Code/scratchwork/scrape-pages/node_modules/@types/node-fetch/index\".Response.993917657");
        let _urlType = lib_1.default.string();
        lib_1.default.param("response", _responseType).assert(response);
        lib_1.default.param("url", _urlType).assert(url);
        super(`Request "${url}" failed. Received status ${response.status}`);
    }
};
ResponseError = __decorate([
    lib_1.default.annotate(lib_1.default.class("ResponseError", lib_1.default.extends(lib_1.default.ref("Error.631742855")), lib_1.default.property("name", lib_1.default.any()), lib_1.default.property("constructor", lib_1.default.function(lib_1.default.param("response", lib_1.default.ref("\"/Users/andrew/Code/scratchwork/scrape-pages/node_modules/@types/node-fetch/index\".Response.993917657")), lib_1.default.param("url", lib_1.default.string()), lib_1.default.return(lib_1.default.any())))))
], ResponseError);
exports.ResponseError = ResponseError;
let RuntimeTypeError = class RuntimeTypeError extends TypeError {
    constructor(typescriptIsMsg) {
        this.name = 'RuntimeTypeError';
        let _typescriptIsMsgType = lib_1.default.string();
        lib_1.default.param("typescriptIsMsg", _typescriptIsMsgType).assert(typescriptIsMsg);
        super(typescriptIsMsg);
    }
};
RuntimeTypeError = __decorate([
    lib_1.default.annotate(lib_1.default.class("RuntimeTypeError", lib_1.default.extends(lib_1.default.ref("TypeError.631742855")), lib_1.default.property("name", lib_1.default.any()), lib_1.default.property("constructor", lib_1.default.function(lib_1.default.param("typescriptIsMsg", lib_1.default.string()), lib_1.default.return(lib_1.default.any())))))
], RuntimeTypeError);
exports.RuntimeTypeError = RuntimeTypeError;
//# sourceMappingURL=error.js.map