/// <reference types="node" />
export declare const PORT = 3001;
export declare const fastifyServer: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
export declare function startServer(): Promise<void>;
