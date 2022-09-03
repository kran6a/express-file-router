import type { ParsedPath } from "path";
import config from "./config.js";

/**
 * @param parsedFile
 *
 * @returns Boolean Whether or not the file has to be excluded from route generation
 */
export const isFileIgnored = (parsedFile: ParsedPath) =>config.IGNORED_FILE_EXTENSIONS.some(x=>parsedFile.base.endsWith(x)) || !config.VALID_FILE_EXTENSIONS.includes(parsedFile.ext.toLowerCase()) || parsedFile.name.startsWith(config.IGNORE_PREFIX_CHAR) || parsedFile.dir.startsWith(`/${config.IGNORE_PREFIX_CHAR}`);
/**
 * ```ts
 * mergePaths("/posts/[id]", "index.ts") -> "/posts/[id]/index.ts"
 * ```
 *
 * @param paths An array of mergeable paths
 *
 * @returns A unification of all paths provided
 */
export const mergePaths = (...paths: string[]) =>`/${paths.filter(path => path !== "").join("/")}`;

const regBackets: RegExp = /\[([^}]*)]/g;

const transformBrackets = (value: string) =>regBackets.test(value) ? value.replace(regBackets, (_, s) => `:${s}`) : value;

/**
 * @param path
 *
 * @returns A new path with all wrapping `[]` replaced by prefixed `:`
 */
export const convertParamSyntax = (path: string) => {
    const subpaths: string[] = path.split('/').map(x=>transformBrackets(x));
    return mergePaths(...subpaths);
}

export const getMethodKey = (method: string): string =>method.toLowerCase() === 'del' ? 'delete' : method;