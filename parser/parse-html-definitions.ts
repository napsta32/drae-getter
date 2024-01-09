import { HTMLElement, parse } from "node-html-parser";
import { HTMLDefinitionsFileUtils } from "../utils/HTMLDefintionsFileUtils";
import {
  HTMLTagTemplate,
  HTMLTemplateFSM,
  SkipTemplate,
} from "../utils/HTMLParser";

const articleContentTemplate = new HTMLTemplateFSM<{ word: string }>(
  "article-content",
  [
    {
      isRoot: true,
      stateId: "article-content-header",
      template: new HTMLTagTemplate(
        "article-content-header",
        "header",
        { class: "f" },
        new SkipTemplate(),
        (key, value) => key === "title" && value.startsWith("Definición de "),
        ["title", "class"]
      ),
      nextStates: [
        "article-content-n1",
        "article-content-n2",
        "article-content-n4",
        "article-content-j",
        "article-content-k5",
        "article-content-k6",
        "article-content-l", // Otra frase
        "article-content-l3", // Otra frase
        "article-content-b",
      ],
    },
    {
      stateId: "article-content-n1",
      template: new HTMLTagTemplate(
        "article-content-n1",
        "p",
        // Otra forma de decir la palabra
        { class: "n1" },
        new SkipTemplate()
      ),
      nextStates: [
        "article-content-n2",
        "article-content-n3",
        "article-content-j",
      ],
    },
    {
      stateId: "article-content-n2",
      template: new HTMLTagTemplate(
        "article-content-n2",
        "p",
        // Origen de la palabra
        { class: "n2" },
        new SkipTemplate()
      ),
      nextStates: [
        "article-content-n5",
        "article-content-j",
        "article-content-j1",
        "article-content-j2",
        "article-content-k5",
        "article-content-k6",
        "article-content-b",
      ],
    },
    {
      stateId: "article-content-n3",
      template: new HTMLTagTemplate(
        "article-content-n3",
        "p",
        // Origen etimologico de la palabra
        { class: "n3" },
        new SkipTemplate()
      ),
      nextStates: [
        "article-content-n5",
        "article-content-j",
        "article-content-j1",
        "article-content-j2",
        "article-content-k5",
        "article-content-k6",
        "article-content-b",
      ],
    },
    {
      stateId: "article-content-n4",
      template: new HTMLTagTemplate(
        "article-content-n4",
        "p",
        // n4: Esta palabra Se puede conjugar igual que el verbo 'x'
        { class: "n4" },
        new SkipTemplate()
      ),
      nextStates: ["article-content-j"],
    },
    {
      stateId: "article-content-n5",
      template: new HTMLTagTemplate(
        "article-content-n5",
        "p",
        { class: "n5" },
        new SkipTemplate()
      ),
      nextStates: ["article-content-j"],
    },
    {
      stateId: "article-content-j",
      template: new HTMLTagTemplate(
        "article-content-j",
        "p",
        // j: definicion de palabra
        { class: "j" },
        new SkipTemplate(),
        (key, value) => key === "id",
        ["class", "id"]
      ),
      nextStates: [
        "article-content-j-sinonimo", // Sinonimo de esta acepcion
        "article-content-j", // Otra acepcion
        "article-content-j1", // Otra acepcion
        "article-content-j2", // Otra acepcion
        "article-content-l", // Otra frase
        "article-content-l3", // Otra frase
        "article-content-k5", // Otra frase
        "article-content-k6", // Otra frase
      ],
    },
    {
      stateId: "article-content-j1",
      template: new HTMLTagTemplate(
        "article-content-j1",
        "p",
        // j: definicion de palabra
        // j1 puede que sea una version futura
        { class: "j1" },
        new SkipTemplate(),
        (key, value) => key === "id",
        ["class", "id"]
      ),
      nextStates: [
        "article-content-j-sinonimo", // Sinonimo de esta acepcion
        "article-content-j", // Otra acepcion
        "article-content-j1", // Otra acepcion
        "article-content-j2", // Otra acepcion
        "article-content-l", // Otra frase
        "article-content-l3", // Otra frase
        "article-content-k5", // Otra frase
        "article-content-k6", // Otra frase
      ],
    },
    {
      stateId: "article-content-j2",
      template: new HTMLTagTemplate(
        "article-content-j2",
        "p",
        // j: definicion de palabra
        // j2 puede que sea una version futura
        { class: "j2" },
        new SkipTemplate(),
        (key, value) => key === "id",
        ["class", "id"]
      ),
      nextStates: [
        "article-content-j-sinonimo", // Sinonimo de esta acepcion
        "article-content-j", // Otra acepcion
        "article-content-j1", // Otra acepcion
        "article-content-j2", // Otra acepcion
        "article-content-l", // Otra frase
        "article-content-l3", // Otra frase
        "article-content-k5", // Otra frase
        "article-content-k6", // Otra frase
      ],
    },
    {
      stateId: "article-content-j-sinonimo",
      template: new HTMLTagTemplate(
        "article-content-j-sinonimo",
        "div",
        {
          // Sinonimo especifico de una acepcion
          class: "sin-header sin-inline",
        },
        new SkipTemplate()
      ),
      nextStates: [
        "article-content-j",
        "article-content-j1",
        "article-content-j2",
        "article-content-l",
        "article-content-l3",
        "article-content-k5",
        "article-content-k6",
      ],
    },
    {
      stateId: "article-content-b",
      template: new HTMLTagTemplate(
        "article-content-b",
        "p",
        // Esta palabra se usa en una frase referenciada aqui
        { class: "b" },
        new SkipTemplate()
      ),
      nextStates: [],
    },
    {
      stateId: "article-content-l3",
      template: new HTMLTagTemplate(
        "article-content-l3",
        "p",
        // Esta palabra se usa en una frase referenciada aqui
        { class: "l3" },
        new SkipTemplate()
      ),
      nextStates: ["article-content-l"],
    },
    {
      stateId: "article-content-l",
      template: new HTMLTagTemplate(
        "article-content-l",
        "p",
        // Esta palabra se usa en una frase referenciada aqui
        { class: "l" },
        new SkipTemplate()
      ),
      nextStates: ["article-content-l"],
    },
    {
      stateId: "article-content-k5",
      template: new HTMLTagTemplate(
        "article-content-k5",
        "p",
        // Uso particular en una frase
        { class: "k5" },
        new SkipTemplate(),
        (key, value) => key === "id",
        ["class", "id"]
      ),
      nextStates: ["article-content-k-m"],
    },
    {
      stateId: "article-content-k6",
      template: new HTMLTagTemplate(
        "article-content-k6",
        "p",
        // Uso particular en una frase (varias alternativas de decirla)
        // Depender: depende, o eso depende
        { class: "k6" },
        new SkipTemplate(),
        (key, value) => key === "id",
        ["class", "id"]
      ),
      nextStates: [
        "article-content-k-n1",
        "article-content-k-n2",
        "article-content-k-l2",
        "article-content-k-m",
      ],
    },
    {
      stateId: "article-content-k-n1",
      template: new HTMLTagTemplate(
        "article-content-k-n1",
        "p",
        // Otra forma de decir la frase (ver k6 por ejemplo)
        { class: "n1" },
        new SkipTemplate()
      ),
      nextStates: ["article-content-k-m"],
    },
    {
      stateId: "article-content-k-n2",
      template: new HTMLTagTemplate(
        "article-content-k-n2",
        "p",
        // Origen de la frase
        { class: "n2" },
        new SkipTemplate()
      ),
      nextStates: ["article-content-k-m"],
    },
    {
      stateId: "article-content-k-l2",
      template: new HTMLTagTemplate(
        "article-content-k-l2",
        "p",
        // Esta palabra se usa en una frase referenciada aqui
        { class: "l2" },
        new SkipTemplate()
      ),
      nextStates: [
        "article-content-k5", // Otra frase
        "article-content-k6", // Otra frase
        "article-content-l", // Otra frase
        "article-content-l3", // Otra frase
      ],
    },
    {
      stateId: "article-content-k-m",
      template: new HTMLTagTemplate(
        "article-content-k5-m",
        "p",
        // Definicion de un uso particular (ver k5)
        { class: "m" },
        new SkipTemplate(),
        (key, value) => key === "id"
      ),
      nextStates: [
        "article-content-k-m", // Multiples definiciones
        "article-content-k5", // Otra frase
        "article-content-k6", // Otra frase
        "article-content-l", // Otra frase
        "article-content-l3", // Otra frase
      ],
    },
  ]
);

const template = new HTMLTemplateFSM<{ word: string }>("root", [
  {
    isRoot: true,
    stateId: "article",
    template: new HTMLTagTemplate(
      "article",
      "article",
      {},
      articleContentTemplate,
      (key, value) => {
        // Do nothing if receiving random id
        if (key !== "id") throw `Unexpected attribute ${key}="${value}"`;
      },
      ["id"]
    ),
    nextStates: ["article", "conjugacion", "sin-ant", "otras", "derechos"],
    parseFn: (node, metadata) => {
      const elem = node as HTMLElement;
      // console.log(elem.textContent.substring(0, 40));
      return metadata;
    },
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
    template.parse(root, { word: wordCache.word });
  }
})();
