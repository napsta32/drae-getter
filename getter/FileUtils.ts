import * as fs from "fs";
import { DirUtils } from "./DirUtils";
import { Word } from "./model";

let cache: object | undefined = undefined;

export class FileUtils {
  static exportWords(letter: string, words: Word[]) {
    DirUtils.createDirIfNeeded("scrap");
    fs.writeFileSync(
      `./scrap/words-letter-${letter.charCodeAt(0)}.json`,
      JSON.stringify(words)
    );
  }

  static cacheFilePath(letter: string) {
    DirUtils.createDirIfNeeded("cache");
    return `./cache/cache-letter-${letter.charCodeAt(0)}.json`;
  }

  static saveCache(letter: string, searchTerm: string, results: Word[]) {
    let cacheData = {};
    if (fs.existsSync(this.cacheFilePath(letter))) {
      const prevData = fs.readFileSync(this.cacheFilePath(letter));
      cacheData = JSON.parse(prevData.toString());
    }
    cacheData[searchTerm] = results;
    if (cache !== undefined) cache[searchTerm] = results;
    fs.writeFileSync(this.cacheFilePath(letter), JSON.stringify(cacheData));
  }

  static readCache(letter: string, searchTerm: string): Word[] | undefined {
    let cacheData = {};
    if (cache === undefined && fs.existsSync(this.cacheFilePath(letter))) {
      const prevData = fs.readFileSync(this.cacheFilePath(letter));
      cacheData = JSON.parse(prevData.toString());
      cache = cacheData;
    } else if (cache !== undefined) {
      cacheData = cache;
    }
    return cacheData[searchTerm];
  }
}
