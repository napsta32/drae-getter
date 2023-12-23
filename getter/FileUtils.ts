import * as fs from "fs";
import { DirUtils } from "./DirUtils";
import { Word } from "./model";

let cache: { [letterCode: number]: object } = {};

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
    if (cache[letter.charCodeAt[0]] !== undefined)
      cache[letter.charCodeAt[0]][searchTerm] = results;
    fs.writeFileSync(this.cacheFilePath(letter), JSON.stringify(cacheData));
  }

  static readCache(letter: string, searchTerm: string): Word[] | undefined {
    let cacheData = {};
    if (
      cache[letter.charCodeAt[0]] === undefined &&
      fs.existsSync(this.cacheFilePath(letter))
    ) {
      console.log(`loading cache for letter code ${letter.charCodeAt(0)}`);
      const prevData = fs.readFileSync(this.cacheFilePath(letter));
      cacheData = JSON.parse(prevData.toString());
      cache[letter.charCodeAt[0]] = cacheData;
    } else if (cache[letter.charCodeAt[0]] !== undefined) {
      cacheData = cache[letter.charCodeAt[0]];
    }
    return cacheData[searchTerm];
  }
}
