import {Router} from "express";
import create_router from "./router.js";
import type {Options, Endpoint, Endpoint_Response} from "./global";

export default create_router;

export { create_router };
export type {Options, Endpoint, Endpoint_Response};
export const router: (options?: Options) => Promise<Router> = (options: Options = {}) => create_router(Router(), options);