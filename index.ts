import {Router} from "express";
import create_router from "./router.js";
import type {Options, Endpoint, Endpoint_Response} from "./global";

export default create_router;

export { create_router };
export type {Options, Endpoint, Endpoint_Response};
export const router: (options?: Options) => Promise<Router> = (options: Options = {}) => create_router(Router(), options);

export const beforeware: <Original extends Record<string, Record<string, {}>> = Record<string, {}>, New extends Record<string, Record<string, {}>> = Record<string, {}>>(mw: (params: Parameters<Endpoint<Original>>["0"])=>Parameters<Endpoint<New>>[0] | Endpoint_Response | Promise<Parameters<Endpoint<New>>[0] | Endpoint_Response>)=>(route: Endpoint<New>)=>(params: Parameters<Endpoint<Original>>["0"])=>Promise<Endpoint_Response> = <Original extends Record<string, Record<string, {}>> = Record<string, {}>, New extends Record<string, Record<string, {}>> = Record<string, {}>>(mw: (params: Parameters<Endpoint<Original>>["0"])=>Parameters<Endpoint<New>>[0] | Endpoint_Response | Promise<Parameters<Endpoint<New>>[0] | Endpoint_Response>)=>(route: Endpoint<New>)=>async (params: Parameters<Endpoint<Original>>["0"]): Promise<Endpoint_Response>=>{
    const overriden_params: Parameters<Endpoint<New>>["0"] | Endpoint_Response = await mw(params);
    if (overriden_params["status"] === undefined && overriden_params["body"] === undefined)
        return <Endpoint_Response>overriden_params;
    return route(<Parameters<Endpoint<New>>["0"]>overriden_params);
}

export const afterware: <T extends Record<string, Record<string, any>>>(mw: (a: Endpoint_Response)=> Endpoint_Response)=>(route: Endpoint<T>)=>(a: Parameters<Endpoint<T>>["0"])=>Endpoint_Response | Promise<Endpoint_Response> = (mw) => {
    return (route)=>{
        return async (params) => {
            const original_response: Endpoint_Response = await route(params);
            return mw(original_response);
        }
    }
}