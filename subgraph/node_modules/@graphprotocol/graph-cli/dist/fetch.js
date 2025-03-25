"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line no-restricted-imports
const fetch_1 = require("@whatwg-node/fetch");
const constants_1 = require("./constants");
function fetchWrapper(input, init) {
    return (0, fetch_1.fetch)(input, {
        ...init,
        headers: {
            ...init?.headers,
            ...constants_1.GRAPH_CLI_SHARED_HEADERS,
        },
    });
}
exports.default = fetchWrapper;
