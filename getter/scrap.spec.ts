import { test, expect } from "@playwright/test";
import { WordsFileUtils } from "../utils/WordsFileUtils";
import { Word } from "../utils/model";

const letters = "aábcdeéfghiíjklmnñoópqrstuúüvwxyz".split("");
const letterVariations = {
  a: "á",
  e: "é",
  i: "í",
  o: "ó",
  u: "úü",
  n: "ñ",
};

let maxResults = 0;

function wordToString(word: Word) {
  let strWord = "";
  for (const c of word.eti) {
    if (letters.includes(c)) {
      strWord += c;
    }
  }
  return strWord.toLowerCase();
}

function cleanVowels(str: string): string {
  let cleanStr = "";
  for (const c of str) {
    let found = false;
    for (const [cleanLetter, variations] of Object.entries(letterVariations)) {
      if (variations.includes(c)) {
        found = true;
        cleanStr += cleanLetter;
        break;
      }
    }
    if (!found) cleanStr += c; // If it is not a varation, just include it
  }
  return cleanStr;
}

function nextPermutation(searchTerm: string): string | undefined {
  if (searchTerm.length === 1) return undefined;
  // Next iteration
  const last = searchTerm[searchTerm.length - 1];
  let seq = 0;
  while (letters[seq] !== last) seq++;
  if (letters[seq] === last) seq++;
  if (seq < letters.length) {
    return searchTerm.substring(0, searchTerm.length - 1) + letters[seq];
  } else {
    return nextPermutation(searchTerm.substring(0, searchTerm.length - 1));
  }
  return undefined;
}

function expandSearch(searchTerm: string, lastWord: Word): string | undefined {
  const lastWordStr = wordToString(lastWord);
  if (searchTerm.length < lastWordStr.length) {
    return searchTerm + cleanVowels(lastWordStr[searchTerm.length]);
  }
  return searchTerm + letters[0];
}

function nextSearch(
  letter: string,
  words: Word[],
  prevSearch: string,
  prevNumResults: number
): string | undefined {
  // First just search the letter
  if (prevSearch === "") return letter;
  else if (words.length === 0) return undefined; // No results
  // Initialize max results with the first successful search results
  if (maxResults === 0) maxResults = prevNumResults;

  const lastWord = words[words.length - 1];
  const lastWordStr = wordToString(lastWord);
  // Assume the first search will return at least 2 different words
  let prevLastWord = words[words.length - 1];
  for (let i = words.length - 2; i >= 0; i--) {
    // Get first word that is not the same
    if (wordToString(prevLastWord) !== wordToString(words[i])) {
      prevLastWord = words[i];
      break;
    }
  }
  const prevLastWordStr = wordToString(prevLastWord);

  // Look if prevSearch < Last[words]
  if (prevSearch < lastWordStr && maxResults / 2 < prevNumResults) {
    // We have new results. Build new search term from scratch
    let commonSubstr = "";
    let i = 0;
    const minWordLength = Math.min(lastWordStr.length, prevLastWordStr.length);
    while (i < minWordLength && lastWordStr[i] === prevLastWordStr[i]) {
      commonSubstr += lastWordStr[i];
      i++;
    }
    if (prevSearch === commonSubstr) {
      return expandSearch(commonSubstr, lastWord);
    } else if (commonSubstr.length < prevSearch.length) {
      return nextPermutation(prevSearch);
    } else {
      return commonSubstr;
    }
  } else {
    // At least one result was returned
    if (prevNumResults < maxResults / 2) {
      // Few results returned
      // All combinations were fulfilled
      return nextPermutation(prevSearch);
    } else {
      // Too many results, need to check one by one
      return expandSearch(prevSearch, words[words.length - prevNumResults]);
    }
  }
  return undefined;
}

function isValidWord(word: string, searchTerm: string) {
  return word.startsWith(searchTerm);
}

test("next to vowel", async () => {
  expect(nextPermutation("aba")).toBe("abá");
  expect(nextPermutation("abz")).toBe("ac");
  expect(nextPermutation("ab")).toBe("ac");
  expect(nextPermutation("az")).toBeUndefined();
  expect(nextPermutation("abalaa")).toBe("abalaá");
  expect(nextPermutation("abalaz")).toBe("abalá");
});

for (const letter of letters) {
  test(`scrap ${letter.toUpperCase()}`, async ({ page }, testInfo) => {
    const prevSearches: string[] = [];
    const words: Word[] = [];
    let prevSearch: string = "";
    let prevNumResults: number = 0;
    let searchTerm: string | undefined;

    while (true) {
      searchTerm = nextSearch(letter, words, prevSearch, prevNumResults);
      if (searchTerm === undefined) break;
      const searchTermValue: string = searchTerm;

      if (prevSearches.includes(searchTermValue)) {
        expect(prevSearches).not.toContain(searchTerm);
      }
      const cache = WordsFileUtils.readCache(letter, searchTermValue);
      if (cache !== undefined) {
        const numResults = cache.length;
        cache
          .filter((cachedWord) => isValidWord(cachedWord.eti, searchTermValue))
          .forEach((cachedWord) => words.push(cachedWord));
        prevNumResults = numResults;
      } else {
        await test.step(`Search ${searchTerm}`, async () => {
          console.log(searchTermValue);
          const wordsCache: Word[] = [];

          await page.goto(`/${searchTermValue}?m=31`);
          expect(
            page.getByText("Listado de lemas que empiezan por"),
            `Label for search term "${searchTermValue}"`
          ).toBeVisible();
          expect(page.getByText(searchTermValue).nth(0)).toBeVisible();
          const resultLocator = page.locator('[data-acc="LISTA EMPIEZA POR"]');
          const numResults = await resultLocator.count();
          for (let i = 0; i < numResults; i++) {
            const nthResult = await resultLocator
              .nth(i)
              .getAttribute("data-eti");
            const resultText = await resultLocator.nth(i).textContent();
            if (
              nthResult !== null &&
              resultText !== null &&
              isValidWord(nthResult, searchTermValue)
            ) {
              words.push({ eti: nthResult, text: resultText });
              wordsCache.push({ eti: nthResult, text: resultText });
            }
          }

          if (wordsCache.length === 0) {
            expect(
              page.getByText(
                "No se ha encontrado ningún lema con los criterios de búsqueda especificados."
              ),
              `No results error message for term "${searchTermValue}"`
            ).toBeVisible();
          }

          prevNumResults = wordsCache.length;

          WordsFileUtils.saveCache(letter, searchTermValue, wordsCache);
        });
      }

      prevSearch = searchTerm;
      prevSearches.push(searchTerm);
    }
    WordsFileUtils.exportWords(letter, words);
  });
}
