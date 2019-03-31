"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Rx = __importStar(require("rxjs"));
const verror_1 = require("verror");
exports.wrapError = (message) => (e) => Rx.throwError(new verror_1.VError({ name: e.name, cause: e }, message));
class ResponseError extends Error {
    constructor(response, url) {
        super(`Request "${url}" failed. Received status ${response.status}`);
        this.name = 'ResponseError';
    }
}
exports.ResponseError = ResponseError;
class RuntimeTypeError extends TypeError {
    constructor(typescriptIsMsg) {
        super(typescriptIsMsg);
        this.name = 'RuntimeTypeError';
    }
}
exports.RuntimeTypeError = RuntimeTypeError;
//# sourceMappingURL=error.js.map