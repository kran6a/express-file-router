import {Router} from "express";
import {Application} from "express";
import createRouter from "./router.js";

export default createRouter;

export { createRouter, Options };
export const router: (options?: Options) => Promise<Application> = (options: Options = {}) => createRouter(Router(), options);