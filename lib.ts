import {readdirSync, statSync} from "fs";
import {join, normalize, parse, resolve} from "path";
import {convertParamSyntax, isFileIgnored, mergePaths} from "./utils.js";

const is_windows: boolean = process.platform === 'win32';
/**
 * @param directory The directory path to walk recursively
 * @param tree
 *
 * @returns An array of all nested files in the specified directory
 */
export const walkTree = (directory: string, tree: string[] = []) => {
    return readdirSync(directory).reduce((acc, fileName: string)=>{
        const filePath: string = join(directory, fileName);
        const fileStats = statSync(filePath);
        return acc.concat(fileStats.isDirectory() ? walkTree(filePath, [...tree, fileName]) : {name: fileName, path: directory, rel: mergePaths(...tree, fileName)});
    }, <Route[]>[]);
}

export const generateRoutes = async (files: ParsedFile[]): Promise<Route[]>=>{
    return Promise.all(files.map(async (file): Promise<Route> => {
        const parsedFile = parse(file.rel)

        if (isFileIgnored(parsedFile))
            return undefined;

        const directory: string = parsedFile.dir === parsedFile.root ? "" : parsedFile.dir;
        const name: string = parsedFile.name.startsWith("index") ? parsedFile.name.replace("index", "") : `/${parsedFile.name}`;

        const url: string = convertParamSyntax(directory + name);
        const exports: Route["exports"] = await import((is_windows ? 'file://' : '') + normalize(resolve(join(file.path, file.name))));
        return {url, exports};
    }));
}