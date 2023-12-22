import * as fs from "fs";

export class DirUtils {
  static createDirIfNeeded(dirName: string) {
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName);
    }
  }
}
