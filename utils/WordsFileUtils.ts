import * as fs from "fs";
import * as path from "path";
import { DirUtils } from "./DirUtils";
import { Word } from "./model";

type LetterCache = { [searchTerm: string]: Word[] };
let cache: { [letterCode: number]: LetterCache } = {};

const LETTER_WORDS_PREFIX = "words-letter-";

export class WordsFileUtils {
  static exportWords(letter: string, words: Word[]) {
    DirUtils.createDirIfNeeded("scrap");
    fs.writeFileSync(
      `./scrap/${LETTER_WORDS_PREFIX}${letter.charCodeAt(0)}.json`,
      JSON.stringify(words)
    );
  }

  static cacheFilePath(letter: string) {
    DirUtils.createDirIfNeeded("cache");
    return `./cache/cache-letter-${letter.charCodeAt(0)}.json`;
  }

  static clearCache() {
    cache = {};
  }

  static saveCache(letter: string, searchTerm: string, results: Word[]) {
    console.log(`Saving cache for "${searchTerm}"`);
    let cacheData: LetterCache = {};
    if (fs.existsSync(this.cacheFilePath(letter))) {
      const prevData = fs.readFileSync(this.cacheFilePath(letter));
      cacheData = JSON.parse(prevData.toString());
    }
    cacheData[searchTerm] = results;
    if (cache[letter.charCodeAt(0)] !== undefined)
      cache[letter.charCodeAt(0)][searchTerm] = results;
    fs.writeFileSync(this.cacheFilePath(letter), JSON.stringify(cacheData));
  }

  static readCache(letter: string, searchTerm: string): Word[] | undefined {
    let cacheData: LetterCache = {};
    if (
      cache[letter.charCodeAt(0)] === undefined &&
      fs.existsSync(this.cacheFilePath(letter))
    ) {
      console.log(`loading cache for letter code ${letter.charCodeAt(0)}`);
      const prevData = fs.readFileSync(this.cacheFilePath(letter));
      cacheData = JSON.parse(prevData.toString());
      cache[letter.charCodeAt(0)] = cacheData;
    } else if (cache[letter.charCodeAt(0)] !== undefined) {
      cacheData = cache[letter.charCodeAt(0)];
    }
    return cacheData[searchTerm];
  }

  static getWordsLabels(): Set<string> {
    const labelSet = new Set<string>();
    fs.readdirSync("./scrap")
      .filter((fileName) => fileName.startsWith(LETTER_WORDS_PREFIX))
      .forEach((fileName) => {
        const wordsPath = path.join("./scrap", fileName);
        const wordsData: Word[] = JSON.parse(
          fs.readFileSync(wordsPath).toString()
        );
        wordsData.forEach((word) => labelSet.add(word.eti));
      });
    return labelSet;
  }
}
