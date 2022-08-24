import {Router} from "express";
import create_router from "./router.js";

export default create_router;

export { create_router, Endpoint, Endpoint_Response };
export const router: (options?: Options) => Promise<Router> = (options: Options = {}) => create_router(Router(), options);