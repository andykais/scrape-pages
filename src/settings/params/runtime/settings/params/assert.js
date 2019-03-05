"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_is_1 = require("typescript-is");
const error_1 = require("../../util/error");
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
exports.assertParamsType = (paramsInit) => {
    try {
        (object => { var path = ["$"]; function _string(object) { if (typeof object !== "string")
            return "validation failed at " + path.join(".") + ": expected a string";
        else
            return null; } function _299(object) { if (typeof object !== "object" || object === null || Array.isArray(object))
            return "validation failed at " + path.join(".") + ": expected an object"; for (const key of Object.keys(object)) {
            path.push(key);
            var error = _string(object[key]);
            path.pop();
            if (error)
                return error;
        } return null; } function _boolean(object) { if (typeof object !== "boolean")
            return "validation failed at " + path.join(".") + ": expected a boolean";
        else
            return null; } function _298(object) { if (typeof object !== "object" || object === null || Array.isArray(object))
            return "validation failed at " + path.join(".") + ": expected an object"; {
            if ("input" in object) {
                path.push("input");
                var error = _299(object["input"]);
                path.pop();
                if (error)
                    return error;
            }
        } {
            if ("folder" in object) {
                path.push("folder");
                var error = _string(object["folder"]);
                path.pop();
                if (error)
                    return error;
            }
            else
                return "validation failed at " + path.join(".") + ": expected 'folder' in object";
        } {
            if ("cleanFolder" in object) {
                path.push("cleanFolder");
                var error = _boolean(object["cleanFolder"]);
                path.pop();
                if (error)
                    return error;
            }
        } return null; } var error = _298(object); if (error)
            throw new Error(error);
        else
            return object; })(paramsInit);
    }
    catch (e) {
        throw new error_1.RuntimeTypeError(e.message);
    }
};
//# sourceMappingURL=assert.js.map