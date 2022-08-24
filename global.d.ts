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

declare global {
    type Endpoint = ({params, request, url}: { params: Partial<{ [x: string]: string }>, request: Request, url: URL }) => Endpoint_Response | Promise<Endpoint_Response>
    type Endpoint_Response = {
        status: number,
        headers?: Record<string, string | number>,
        body?: string | Uint8Array
    }
}