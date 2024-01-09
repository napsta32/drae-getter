import { parse } from "node-html-parser";
import { HTMLDefinitionsFileUtils } from "../utils/HTMLDefintionsFileUtils";
import {
  HTMLTagTemplate,
  HTMLTemplateFSM,
  SkipTemplate,
} from "../utils/HTMLParser";

const template = new HTMLTemplateFSM("root", [
  {
    isRoot: true,
    stateId: "article",
    template: new HTMLTagTemplate(
      "article",
      "article",
      {},
      // TODO: Replace with validate template
      new SkipTemplate(),
      (key, value) => {
        // Do nothing if receiving random id
        if (key !== "id") throw `Unexpected attribute ${key}="${value}"`;
      },
      ["id"]
    ),
    nextStates: ["article", "conjugacion", "sin-ant", "otras", "derechos"],
  },
  {
    stateId: "conjugacion",
    template: new HTMLTagTemplate(
      "div-conjugacion",
      "div",
      { id: "conjugacion" },
      new SkipTemplate()
    ),
    nextStates: ["article", "conjugacion2", "sin-ant", "otras", "derechos"],
  },
  {
    stateId: "conjugacion2",
    template: new HTMLTagTemplate(
      "div-conjugacion2",
      "div",
      { id: "conjugacion2" },
      new SkipTemplate()
    ),
    nextStates: ["article", "sin-ant", "otras", "derechos"],
  },
  {
    stateId: "sin-ant",
    template: new HTMLTagTemplate(
      "div-sin-ant",
      "div",
      { class: "div-sin-ant" },
      new SkipTemplate()
    ),
    nextStates: ["article", "otras", "derechos"],
  },
  {
    stateId: "otras",
    template: new HTMLTagTemplate(
      "div-otras",
      "div",
      { class: "otras" },
      new SkipTemplate()
    ),
    nextStates: ["article", "otras", "derechos"],
  },
  {
    stateId: "derechos",
    template: new HTMLTagTemplate("p-derechos", "p", { class: "o" }),
    nextStates: ["compartir"],
  },
  {
    stateId: "compartir",
    template: new HTMLTagTemplate("skip-compartir", "div", {
      class: "compartir",
    }),
    nextStates: [],
  },
]);

/**
 * Main function
 */
(function () {
  for (const wordCache of HTMLDefinitionsFileUtils.getHTMLDefinitions()) {
    const root = parse(wordCache.htmlData);
    // AssertUtils.equals(root.childNodes.length, 1);
    template.parse(root);
  }
})();
