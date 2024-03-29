import {dirname, join} from "path";
import config from "./config.js";
import type {Request as ExpressRequest, Response, Router} from "express";
import type {ParsedFile, Options, Route, Endpoint_Response} from "./global";
import {Readable} from 'node:stream';
import type {ReadableStream} from 'node:stream/web';

import { generateRoutes, walkTree } from "./lib.js";
import { getMethodKey } from "./utils.js";

const REQUIRE_MAIN_FILE: string = dirname(process.cwd());

const createRouter = async (app: Router, {afterware = [], ...options}: Options = {afterware: []}): Promise<Router>=>{
    const files: ParsedFile[] = walkTree(options.directory || join(REQUIRE_MAIN_FILE, "routes"));
    const routes: Route[] = await generateRoutes(files);

    for (const {url, exports} of routes) {
        const exportedMethods = Object.entries(exports);

        for (const [method, handler] of exportedMethods) {
            const methodKey = getMethodKey(method);
            if (!options.additionalMethods?.includes(methodKey) && !config.DEFAULT_METHOD_EXPORTS.includes(methodKey))
                continue;

            const wrapper_handler = async (req: ExpressRequest & {body: ReadableStream}, res: Response): Promise<void>=>{
                const url: URL = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
                const method: string = req.method;
                const has_body: boolean = method !== "GET" && method !== "HEAD";
                const native_request: Request = new Request(url, {body: has_body ? Readable.toWeb(req) : undefined, method: req.method, headers: <Record<string, string>>req.headers});
                const {body = '', headers = {}, status = 500}: Endpoint_Response = await afterware.reduce(async (acc, cur)=>{
                    if ((<Promise<Endpoint_Response>>acc)?.then)
                        return (<Promise<Endpoint_Response>>acc).then((response: Endpoint_Response)=>{
                            const {body = '', headers = {}, status = 500}: Endpoint_Response = cur(response);
                            return {body: (<Endpoint_Response>acc).body || body, headers: {...(<Endpoint_Response>acc).headers, ...headers}, status: status || (<Endpoint_Response>acc).status};
                        });
                    const {body = '', headers = {}, status = 500}: Endpoint_Response = cur(<Endpoint_Response>acc);
                    return {body: (<Endpoint_Response>acc).body || body, headers: {...((<Endpoint_Response>acc).headers || {}), ...headers}, status: status || (<Endpoint_Response>acc).status};
                }, handler({request: native_request, params: req.params, middleware: {}, url}));
                res.status(status || 500);
                Object.entries(headers).forEach(([key, value])=>res.setHeader(key, value));
                res.send(body);
            }
            app[methodKey](url, wrapper_handler);
        }
    }

    return app;
}

export default createRouter;