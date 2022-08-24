import {Router} from "express";
import create_router from "./router.js";
import type {Options} from "./global";

export default create_router;

export { create_router };
export const router: (options?: Options) => Promise<Router> = (options: Options = {}) => create_router(Router(), options);