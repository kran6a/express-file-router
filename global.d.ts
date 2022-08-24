import {Request} from "express";

export type Options = {
    directory?: string
    additionalMethods?: string[],
    afterware?: ((response: Endpoint_Response) => Endpoint_Response)[]
}
export type ParsedFile = {
    name: string
    path: string
    rel: string
}
export type Route = {
    url: string
    exports: {
        all?: Endpoint
        get?: Endpoint
        post?: Endpoint
        put?: Endpoint
        patch?: Endpoint
        delete?: Endpoint
        [x: string]: Endpoint
    }
}
export type Endpoint = <T extends Record<string, any>>({params, request, url, middleware}: { params: Partial<{ [x: string]: string }>, request: Request, url: URL, middleware: Record<string, T> }) => Endpoint_Response | Promise<Endpoint_Response>
export type Endpoint_Response = {
    status: number,
    headers?: Record<string, string | number>,
    body?: string | Uint8Array
}