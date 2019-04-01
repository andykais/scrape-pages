"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_is_1 = require("typescript-is");
const error_1 = require("../../util/error");
exports.assertConfigType = (configInit) => {
    try {
        (object => { var path = ["$"]; function _string(object) { if (typeof object !== "string")
            return "validation failed at " + path.join(".") + ": expected a string";
        else
            return null; } function _51_8(object) { if (!Array.isArray(object))
            return "validation failed at " + path.join(".") + ": expected an array"; for (let i = 0; i < object.length; i++) {
            path.push("[" + i + "]");
            var error = _string(object[i]);
            path.pop();
            if (error)
                return error;
        } return null; } function _301(object) { var conditions = [_string, _51_8]; for (const condition of conditions) {
            var error = condition(object);
            if (!error)
                return null;
        } return "validation failed at " + path.join(".") + ": there are no valid alternatives"; } function _undefined(object) { if (object !== undefined)
            return "validation failed at " + path.join(".") + ": expected undefined";
        else
            return null; } function _306(object) { if (object !== "http")
            return "validation failed at " + path.join(".") + ": expected string 'http'";
        else
            return null; } function _308(object) { if (object !== "GET")
            return "validation failed at " + path.join(".") + ": expected string 'GET'";
        else
            return null; } function _310(object) { if (object !== "POST")
            return "validation failed at " + path.join(".") + ": expected string 'POST'";
        else
            return null; } function _312(object) { if (object !== "PUT")
            return "validation failed at " + path.join(".") + ": expected string 'PUT'";
        else
            return null; } function _314(object) { if (object !== "DELETE")
            return "validation failed at " + path.join(".") + ": expected string 'DELETE'";
        else
            return null; } function _316(object) { var conditions = [_308, _310, _312, _314]; for (const condition of conditions) {
            var error = condition(object);
            if (!error)
                return null;
        } return "validation failed at " + path.join(".") + ": there are no valid alternatives"; } function _317(object) { if (typeof object !== "object" || object === null || Array.isArray(object))
            return "validation failed at " + path.join(".") + ": expected an object"; for (const key of Object.keys(object)) {
            path.push(key);
            var error = _string(object[key]);
            path.pop();
            if (error)
                return error;
        } return null; } function _318(object) { if (typeof object !== "object" || object === null || Array.isArray(object))
            return "validation failed at " + path.join(".") + ": expected an object"; {
            if ("selector" in object) {
                path.push("selector");
                var error = _string(object["selector"]);
                path.pop();
                if (error)
                    return error;
            }
            else
                return "validation failed at " + path.join(".") + ": expected 'selector' in object";
        } {
            if ("replacer" in object) {
                path.push("replacer");
                var error = _string(object["replacer"]);
                path.pop();
                if (error)
                    return error;
            }
            else
                return "validation failed at " + path.join(".") + ": expected 'replacer' in object";
        } return null; } function _319(object) { var conditions = [_string, _318]; for (const condition of conditions) {
            var error = condition(object);
            if (!error)
                return null;
        } return "validation failed at " + path.join(".") + ": there are no valid alternatives"; } function _boolean(object) { if (typeof object !== "boolean")
            return "validation failed at " + path.join(".") + ": expected a boolean";
        else
            return null; } function _304(object) { if (typeof object !== "object" || object === null || Array.isArray(object))
            return "validation failed at " + path.join(".") + ": expected an object"; {
            if ("protocol" in object) {
                path.push("protocol");
                var error = _306(object["protocol"]);
                path.pop();
                if (error)
                    return error;
            }
        } {
            if ("method" in object) {
                path.push("method");
                var error = _316(object["method"]);
                path.pop();
                if (error)
                    return error;
            }
        } {
            if ("urlTemplate" in object) {
                path.push("urlTemplate");
                var error = _string(object["urlTemplate"]);
                path.pop();
                if (error)
                    return error;
            }
            else
                return "validation failed at " + path.join(".") + ": expected 'urlTemplate' in object";
        } {
            if ("headerTemplates" in object) {
                path.push("headerTemplates");
                var error = _317(object["headerTemplates"]);
                path.pop();
                if (error)
                    return error;
            }
        } {
            if ("regexCleanup" in object) {
                path.push("regexCleanup");
                var error = _319(object["regexCleanup"]);
                path.pop();
                if (error)
                    return error;
            }
        } {
            if ("read" in object) {
                path.push("read");
                var error = _boolean(object["read"]);
                path.pop();
                if (error)
                    return error;
            }
        } {
            if ("write" in object) {
                path.push("write");
                var error = _boolean(object["write"]);
                path.pop();
                if (error)
                    return error;
            }
        } return null; } function _305(object) { var conditions = [_undefined, _string, _304]; for (const condition of conditions) {
            var error = condition(object);
            if (!error)
                return null;
        } return "validation failed at " + path.join(".") + ": there are no valid alternatives"; } function _322(object) { if (object !== "html")
            return "validation failed at " + path.join(".") + ": expected string 'html'";
        else
            return null; } function _324(object) { if (object !== "xml")
            return "validation failed at " + path.join(".") + ": expected string 'xml'";
        else
            return null; } function _326(object) { if (object !== "json")
            return "validation failed at " + path.join(".") + ": expected string 'json'";
        else
            return null; } function _328(object) { var conditions = [_322, _324, _326]; for (const condition of conditions) {
            var error = condition(object);
            if (!error)
                return null;
        } return "validation failed at " + path.join(".") + ": there are no valid alternatives"; } function _number(object) { if (typeof object !== "number")
            return "validation failed at " + path.join(".") + ": expected a number";
        else
            return null; } function _320(object) { if (typeof object !== "object" || object === null || Array.isArray(object))
            return "validation failed at " + path.join(".") + ": expected an object"; {
            if ("format" in object) {
                path.push("format");
                var error = _328(object["format"]);
                path.pop();
                if (error)
                    return error;
            }
        } {
            if ("selector" in object) {
                path.push("selector");
                var error = _string(object["selector"]);
                path.pop();
                if (error)
                    return error;
            }
            else
                return "validation failed at " + path.join(".") + ": expected 'selector' in object";
        } {
            if ("attribute" in object) {
                path.push("attribute");
                var error = _string(object["attribute"]);
                path.pop();
                if (error)
                    return error;
            }
        } {
            if ("limit" in object) {
                path.push("limit");
                var error = _number(object["limit"]);
                path.pop();
                if (error)
                    return error;
            }
        } {
            if ("regexCleanup" in object) {
                path.push("regexCleanup");
                var error = _319(object["regexCleanup"]);
                path.pop();
                if (error)
                    return error;
            }
        } return null; } function _321(object) { var conditions = [_undefined, _string, _320]; for (const condition of conditions) {
            var error = condition(object);
            if (!error)
                return null;
        } return "validation failed at " + path.join(".") + ": there are no valid alternatives"; } function _329(object) { if (object !== "failed-download")
            return "validation failed at " + path.join(".") + ": expected string 'failed-download'";
        else
            return null; } function _331(object) { if (object !== "empty-parse")
            return "validation failed at " + path.join(".") + ": expected string 'empty-parse'";
        else
            return null; } function _333(object) { var conditions = [_number, _329, _331]; for (const condition of conditions) {
            var error = condition(object);
            if (!error)
                return null;
        } return "validation failed at " + path.join(".") + ": there are no valid alternatives"; } function _303(object) { if (typeof object !== "object" || object === null || Array.isArray(object))
            return "validation failed at " + path.join(".") + ": expected an object"; {
            if ("download" in object) {
                path.push("download");
                var error = _305(object["download"]);
                path.pop();
                if (error)
                    return error;
            }
        } {
            if ("parse" in object) {
                path.push("parse");
                var error = _321(object["parse"]);
                path.pop();
                if (error)
                    return error;
            }
        } {
            if ("incrementUntil" in object) {
                path.push("incrementUntil");
                var error = _333(object["incrementUntil"]);
                path.pop();
                if (error)
                    return error;
            }
        } return null; } function _302(object) { if (typeof object !== "object" || object === null || Array.isArray(object))
            return "validation failed at " + path.join(".") + ": expected an object"; for (const key of Object.keys(object)) {
            path.push(key);
            var error = _303(object[key]);
            path.pop();
            if (error)
                return error;
        } return null; } function _51_334(object) { if (!Array.isArray(object))
            return "validation failed at " + path.join(".") + ": expected an array"; for (let i = 0; i < object.length; i++) {
            path.push("[" + i + "]");
            var error = _334(object[i]);
            path.pop();
            if (error)
                return error;
        } return null; } function _336(object) { var conditions = [_334, _51_334]; for (const condition of conditions) {
            var error = condition(object);
            if (!error)
                return null;
        } return "validation failed at " + path.join(".") + ": there are no valid alternatives"; } function _334(object) { if (typeof object !== "object" || object === null || Array.isArray(object))
            return "validation failed at " + path.join(".") + ": expected an object"; {
            if ("scraper" in object) {
                path.push("scraper");
                var error = _string(object["scraper"]);
                path.pop();
                if (error)
                    return error;
            }
            else
                return "validation failed at " + path.join(".") + ": expected 'scraper' in object";
        } {
            if ("forEach" in object) {
                path.push("forEach");
                var error = _336(object["forEach"]);
                path.pop();
                if (error)
                    return error;
            }
        } {
            if ("forNext" in object) {
                path.push("forNext");
                var error = _336(object["forNext"]);
                path.pop();
                if (error)
                    return error;
            }
        } return null; } function _299(object) { if (typeof object !== "object" || object === null || Array.isArray(object))
            return "validation failed at " + path.join(".") + ": expected an object"; {
            if ("input" in object) {
                path.push("input");
                var error = _301(object["input"]);
                path.pop();
                if (error)
                    return error;
            }
        } {
            if ("scrapers" in object) {
                path.push("scrapers");
                var error = _302(object["scrapers"]);
                path.pop();
                if (error)
                    return error;
            }
            else
                return "validation failed at " + path.join(".") + ": expected 'scrapers' in object";
        } {
            if ("run" in object) {
                path.push("run");
                var error = _334(object["run"]);
                path.pop();
                if (error)
                    return error;
            }
            else
                return "validation failed at " + path.join(".") + ": expected 'run' in object";
        } return null; } var error = _299(object); if (error)
            throw new Error(error);
        else
            return object; })(configInit);
    }
    catch (e) {
        throw new error_1.RuntimeTypeError(e.message);
    }
};
//# sourceMappingURL=assert.js.map