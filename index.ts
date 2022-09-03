import {Router} from "express";
import create_router from "./router.js";
import type {Options, Endpoint, Endpoint_Response} from "./global";

export default create_router;

export { create_router };
export type {Options, Endpoint, Endpoint_Response};
export const router: (options?: Options) => Promise<Router> = (options: Options = {}) => create_router(Router(), options);

function is_response(a: any): a is Endpoint_Response {
    return a.status !== undefined;
}

export type Merge<T, U> = T & U;


export type Beforewarify<New extends {} = {}, Old extends {} = {}> = <New extends {}, Old extends {} = {}>
(mw: (params: Parameters<Endpoint<Old>>["0"])=>
    Promise<Parameters<Endpoint<Merge<Old, New>>>["0"] | Endpoint_Response>
    | Promise<Parameters<Endpoint<Merge<Old, New>>>["0"]>
    | Promise<Endpoint_Response>
    | Parameters<Endpoint<Merge<Old, New>>>["0"]
    | Endpoint_Response )
    =>(route: Endpoint<Merge<Old, New>>)
    =>(params: Parameters<Endpoint<Old>>["0"])
    =>Promise<Endpoint_Response>
export type Beforeware<New extends {} = {}, Old extends {} = {}> = ReturnType<Beforewarify<New, Old>>;
export const beforeware: Beforewarify = (mw)=>(route)=>async(params)=>{
    const overriden_params = await mw(params);
    if (is_response(overriden_params))
        return overriden_params;
    return route(overriden_params);
}

export const afterware: <T extends Record<string, Record<string, any>>>(mw: (a: Endpoint_Response)=> Endpoint_Response)=>(route: Endpoint<T>)=>(a: Parameters<Endpoint<T>>["0"])=>Endpoint_Response | Promise<Endpoint_Response> = (mw) => {
    return (route)=>{
        return async (params) => {
            const original_response: Endpoint_Response = await route(params);
            return mw(original_response);
        }
    }
}