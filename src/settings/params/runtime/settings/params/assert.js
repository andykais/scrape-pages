"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_is_1 = require("typescript-is");
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
exports.assertParamsType = (paramsInit) => {
    (object => { var error = (() => { var error = [() => typeof object === "object" && object !== null && !Array.isArray(object) ? null : "at $: expected object", () => { var errors = [() => !("input" in object) ? null : "at $: found 'input' in object", () => { var error = [() => typeof object["input"] === "object" && object["input"] !== null && !Array.isArray(object["input"]) ? null : "at $.input: expected object", () => Object.keys(object["input"]).reduce((prev, key) => prev || (() => typeof object["input"][key] === "string" ? null : "at $.input.[]: expected string")(), null)].reduce((prev, next) => prev || next(), null); return error && "at $.input; cause: " + error; }].reduce((prev, next) => { var error = next(); return prev && (error && [...prev, error]); }, []); return errors && "at $; all causes: (" + (errors.join("; ") + ")"); }, () => { var error = [() => "folder" in object ? null : "at $: expected 'folder' in object", () => typeof object["folder"] === "string" ? null : "at $.folder: expected string"].reduce((prev, next) => prev || next(), null); return error && "at $; cause: " + error; }, () => { var errors = [() => !("cleanFolder" in object) ? null : "at $: found 'cleanFolder' in object", () => typeof object["cleanFolder"] === "boolean" ? null : "at $.cleanFolder: expected boolean"].reduce((prev, next) => { var error = next(); return prev && (error && [...prev, error]); }, []); return errors && "at $; all causes: (" + (errors.join("; ") + ")"); }].reduce((prev, next) => prev || next(), null); return error && "at $; cause: " + error; })(); if (error === null)
        return object;
    else
        throw new Error(error); })(paramsInit);
};
//# sourceMappingURL=assert.js.map