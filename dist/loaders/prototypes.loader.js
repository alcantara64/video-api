"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function init() {
    //without this, JSON.stringify outputs a Regex as empty object which is annoying in log output for example
    Object.defineProperty(RegExp.prototype, "toJSON", {
        value: RegExp.prototype.toString
    });
}
exports.default = init;
//# sourceMappingURL=prototypes.loader.js.map