import * as fs from "fs";
import * as path from "path";
import { DirUtils } from "./DirUtils";
import { v4 as uuidv4 } from "uuid";
import { WordHTMLDefinition } from "./model";

const SCRAP_DIR = "./scrap/html-definitions";
const BUCKET_PREFIX = "bucket-";
const BUCKET_SIZE = 1024 * 1024; // in bytes

export class HTMLDefinitionsFileUtils {
  static createBucket(): string {
    const bucketPath = (bucketUUID: string) =>
      path.join(SCRAP_DIR, `${BUCKET_PREFIX}${bucketUUID}.json`);
    let newBucketUUID: string;
    do {
      newBucketUUID = uuidv4();
    } while (fs.existsSync(bucketPath(newBucketUUID)));
    fs.writeFileSync(bucketPath(newBucketUUID), JSON.stringify([]));
    return newBucketUUID;
  }

  static freeBucket(): string {
    DirUtils.createDirIfNeeded(SCRAP_DIR);
    const freeBucketsFiles = fs
      .readdirSync(SCRAP_DIR)
      .filter((fileName) => fileName.startsWith(BUCKET_PREFIX))
      .map((fileName) => path.join(SCRAP_DIR, fileName))
      .filter((bucketPath) => {
        return fs.statSync(bucketPath).size < BUCKET_SIZE;
      });

    if (freeBucketsFiles.length === 0) {
      // Create bucket and return empty bucket
      return this.createBucket();
    } else return freeBucketsFiles[0];
  }

  static cacheHTMLData(word: string, htmlData: string) {
    const bucketPath = this.freeBucket();
    const bucketData: WordHTMLDefinition[] = JSON.parse(
      fs.readFileSync(bucketPath).toString()
    );
    bucketData.push({ word, htmlData });
    fs.writeFileSync(bucketPath, JSON.stringify(bucketData));
  }

  static listWordsWithHTMLCache(): Set<string> {
    const visitedWords = new Set<string>();
    if (!fs.existsSync(SCRAP_DIR)) return visitedWords;
    fs.readdirSync(SCRAP_DIR)
      .filter((fileName) => fileName.startsWith(BUCKET_PREFIX))
      .map((fileName) => path.join(SCRAP_DIR, fileName))
      .forEach((filePath) => {
        const bucketData: WordHTMLDefinition[] = JSON.parse(
          fs.readFileSync(filePath).toString()
        );
        bucketData.forEach((wordCache) => visitedWords.add(wordCache.word));
      });
    return visitedWords;
  }
}
