import {dirname, join} from "path";
import config from "./config.js";
import type {Request, Response, Router} from "express";
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

            const wrapper_handler = async (req: Request & {body: ReadableStream}, res: Response): Promise<void>=>{
                req.body = Readable.toWeb(req);
                const {body = '', headers = {}, status = 500}: Endpoint_Response = await afterware.reduce(async (acc, cur)=>{
                    if ((<Promise<Endpoint_Response>>acc)?.then)
                        return (<Promise<Endpoint_Response>>acc).then((response: Endpoint_Response)=>{
                            const {body = '', headers = {}, status = 500}: Endpoint_Response = cur(response);
                            return {body: (<Endpoint_Response>acc).body || body, headers: {...(<Endpoint_Response>acc).headers, ...headers}, status: status || (<Endpoint_Response>acc).status};
                        });
                    const {body = '', headers = {}, status = 500}: Endpoint_Response = cur(<Endpoint_Response>acc);
                    return {body: (<Endpoint_Response>acc).body || body, headers: {...((<Endpoint_Response>acc).headers || {}), ...headers}, status: status || (<Endpoint_Response>acc).status};
                }, handler({request: req, params: req.params, middleware: {}, url: new URL('http://localhost'+req.originalUrl)}));
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