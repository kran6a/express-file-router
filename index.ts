import {Router} from "express";
import create_router from "./router.js";
import type {Options, Endpoint, Endpoint_Response} from "./global";

export default create_router;

export { create_router };
export type {Options, Endpoint, Endpoint_Response};
export const router: (options?: Options) => Promise<Router> = (options: Options = {}) => create_router(Router(), options);

type Middleware<Original extends Record<string, Record<string, any>> = Record<string, undefined>, New extends Record<string, Record<string, any>> = Record<string, undefined>> = (a: Parameters<Endpoint<Original>>["0"])=>Parameters<Endpoint<New>>["0"] | Promise<Parameters<Endpoint<New>>["0"]>;

export const beforeware: <Original extends Record<string, Record<string, any>> = Record<string, {}>, New extends Record<string, Record<string, any>> = Record<string, undefined>>(mw: Middleware<Original, New>) => (route: Endpoint<New>) => Endpoint<New> = <Original extends Record<string, Record<string, any>> = Record<string, undefined>, New extends Record<string, Record<string, any>> = Record<string, undefined>>(mw)=>{
    return (route: Endpoint<New>)=>{
        return async (params: Parameters<Endpoint<Original>>["0"]) => {
            const overriden_params: Parameters<Endpoint<New>>["0"] | Endpoint_Response = await mw(params);
            if (typeof overriden_params["status"] === "number" || overriden_params["body"] !== undefined)
                return <Endpoint_Response>overriden_params;
            return route(<Parameters<Endpoint<New>>["0"]>overriden_params);
        }
    }
}

export const afterware: <T extends Record<string, Record<string, any>>>(mw: (a: Endpoint_Response)=> Endpoint_Response)=>(route: Endpoint<T>)=>(a: Parameters<Endpoint<T>>["0"])=>Endpoint_Response | Promise<Endpoint_Response> = (mw) => {
    return (route)=>{
        return async (params) => {
            const original_response: Endpoint_Response = await route(params);
            return mw(original_response);
        }
    }
}