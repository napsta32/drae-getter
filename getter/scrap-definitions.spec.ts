import { expect, test } from "@playwright/test";
import { HTMLDefinitionsFileUtils } from "./HTMLDefintionsFileUtils";
import { WordsFileUtils } from "./WordsFileUtils";

const allWords = WordsFileUtils.getWordsLabels();
const visitedWords = HTMLDefinitionsFileUtils.listWordsWithHTMLCache();

function getURL(wordLabel: string) {
  return `https://dle.rae.es/${wordLabel}`;
}

function scrapWordLabel(wordLabel: string) {
  test(`Scrap HTML definition of "${wordLabel}"`, async ({ page }) => {
    await page.goto(getURL(wordLabel));
    const resultsLocator = page.locator('[id="resultados"]');
    expect(resultsLocator).toBeVisible();

    // Clean logos
    const shareDiv = page.locator("div.compartir");
    await shareDiv.evaluate((node) => (node.innerHTML = ""));

    const resultsHTMLData = await resultsLocator.innerHTML({
      timeout: 30 * 1000,
    });
    HTMLDefinitionsFileUtils.cacheHTMLData(wordLabel, resultsHTMLData);
  });
}

for (const word of allWords) {
  if (visitedWords.has(word)) continue;
  scrapWordLabel(word);
}
