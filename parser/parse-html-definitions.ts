import { HTMLElement, parse, Node } from "node-html-parser";
import { HTMLDefinitionsFileUtils } from "../utils/HTMLDefintionsFileUtils";
import {
  AnyHTMLTemplate,
  HTMLSingleChildTemplate as HTMLSingleChildTemplate,
  HTMLTableTemplate,
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
        "article-content-l2",
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
        "article-content-k5", // Se usa en frase...
        "article-content-k6", // Se usa en frase...
        "article-content-n2",
        "article-content-n3",
        "article-content-n5", // Escrito con...
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
        "article-content-l2", // Vease
        "article-content-l3", // Otra frase
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
      stateId: "article-content-l2",
      template: new HTMLTagTemplate(
        "article-content-l2",
        "p",
        // Vease otra palabra
        { class: "l2" },
        new SkipTemplate()
      ),
      nextStates: [],
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
      nextStates: [
        "article-content-k-n1",
        "article-content-k-n2",
        "article-content-k-n4",
        "article-content-k-l2",
        "article-content-k-m",
        "article-content-k5", // Bug? Missing definition, skip and go to the next phrase
      ],
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
        "article-content-k-n4",
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
      nextStates: [
        "article-content-k-n3",
        "article-content-k-n5",
        "article-content-k-m",
      ],
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
      stateId: "article-content-k-n3",
      template: new HTMLTagTemplate(
        "article-content-k-n3",
        "p",
        // De origen expresivo
        { class: "n3" },
        new SkipTemplate()
      ),
      nextStates: ["article-content-k-m"],
    },
    {
      stateId: "article-content-k-n4",
      template: new HTMLTagTemplate(
        "article-content-k-n4",
        "p",
        // Otra forma de escribir la frase (ver k6 por ejemplo)
        { class: "n4" },
        new SkipTemplate()
      ),
      nextStates: ["article-content-k-m"],
    },
    {
      stateId: "article-content-k-n5",
      template: new HTMLTagTemplate(
        "article-content-k-n5",
        "p",
        // Como se escribe dicha frase (ver k6 por ejemplo)
        { class: "n5" },
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

function gestionarFormasNoPersonales(
  rowNode: HTMLElement,
  rowValues: { [key: string]: Node },
  metadata: { word: string }
) {
  const formasValidas = [
    "infinitivo",
    "gerundio",
    "infinitivoCompuesto",
    "gerundioCompuesto",
    "participio",
  ];
  Object.keys(rowValues).forEach((formaVerbal) => {
    if (!formasValidas.includes(formaVerbal)) {
      throw `${metadata.word}: Forma no personal invalida: ${formaVerbal}`;
    }
  });
  Object.entries(rowValues).forEach(([formaVerbal, verboConjugado]) => {
    if (
      !verboConjugado ||
      !verboConjugado.innerText ||
      verboConjugado.innerText.trim().length === 0
    ) {
      throw `${
        metadata.word
      }: No hay verbo conjugado para ${formaVerbal}\n${verboConjugado.toString()}`;
    }
  });
}

function validarFormaPersonal(
  formasValidas: string[],
  rowValues: { [key: string]: Node },
  metadata: { word: string }
) {
  const propiedadesPersona = ["numero", "persona", "pronombre"];
  const pronombresValidos = [
    "yo",
    "tú / vos",
    "usted",
    "él, ella",
    "nosotros, nosotras",
    "vosotros, vosotras",
    "ustedes",
    "ellos, ellas",
  ];

  const propiedadesValidas = [...formasValidas, ...propiedadesPersona];
  Object.keys(rowValues).forEach((prop) => {
    if (!propiedadesValidas.includes(prop)) {
      throw `${metadata.word}: Propiedad invalida ${prop} para conjugacion personal`;
    }
  });
  if (rowValues.numero.innerText.trim().length !== 0) {
    throw `${
      metadata.word
    }: Valor inesperado para numero "${rowValues.number.innerText.trim()}"`;
  }

  if (rowValues.persona.innerText.trim().length !== 0) {
    throw `${
      metadata.word
    }: Valor inesperado para persona "${rowValues.persona.innerText.trim()}"`;
  }
  if (!pronombresValidos.includes(rowValues.pronombre.innerText.trim())) {
    if (rowValues.pronombre.innerText.trim().length === 0) {
      // We expect to see at least numero and persona
      if (
        !["Singular", "Plural"].includes(
          (rowValues.numero as HTMLElement).attributes["data-g"]
        )
      ) {
        throw `${metadata.word}: Numero inesperado ${
          (rowValues.numero as HTMLElement).attributes["data-g"]
        }`;
      }
      if (
        !["Tercera"].includes(
          (rowValues.persona as HTMLElement).attributes["data-g"]
        )
      ) {
        throw `${metadata.word}: Persona inesperada ${
          (rowValues.persona as HTMLElement).attributes["data-g"]
        }`;
      }
    } else {
      throw `${
        metadata.word
      }: Pronombre invalido '${rowValues.pronombre.innerText.trim()}'`;
    }
  }
}

function gestionarIndicativo(
  rowNode: HTMLElement,
  rowValues: { [key: string]: Node },
  metadata: { word: string }
) {
  const formasValidas = [
    "presente",
    "preteritoPerfectoCompuesto",
    "preteritoImperfecto",
    "preteritoPluscuamperfecto",
    "preteritoPerfectoSimple",
    "preteritoAnterior",
    "futuroSimple",
    "futuroCompuesto",
    "condicionalSimple",
    "condicionalCompuesto",
  ];
  validarFormaPersonal(formasValidas, rowValues, metadata);
}

function gestionarSubjuntivo(
  rowNode: HTMLElement,
  rowValues: { [key: string]: Node },
  metadata: { word: string }
) {
  const formasValidas = [
    "presente",
    "preteritoPerfectoCompuesto",
    "preteritoImperfecto",
    "preteritoPluscuamperfecto",
    "futuroSimple",
    "futuroCompuesto",
  ];
  validarFormaPersonal(formasValidas, rowValues, metadata);
}

function gestionarImperativo(
  rowNode: HTMLElement,
  rowValues: { [key: string]: Node },
  metadata: { word: string }
) {
  const formasValidas = ["imperativo"];
  validarFormaPersonal(formasValidas, rowValues, metadata);
}

const conjugacionTableTemplate1 = new HTMLTableTemplate("conjugacion-table1", [
  {
    separator: ["", "", "", "Formas no personales"],
  },
  {
    header: ["", "", "", "Infinitivo", "Gerundio"],
    mappedHeaders: [undefined, undefined, undefined, "infinitivo", "gerundio"],
    parseRowValues: gestionarFormasNoPersonales,
    maxRows: 1,
  },
  {
    header: ["", "", "", "Infinitivo compuesto", "Gerundio compuesto"],
    mappedHeaders: [
      undefined,
      undefined,
      undefined,
      "infinitivoCompuesto",
      "gerundioCompuesto",
    ],
    parseRowValues: gestionarFormasNoPersonales,
    maxRows: 1,
  },
  {
    header: ["", "", "", "Participio"],
    mappedHeaders: [undefined, undefined, undefined, "participio"],
    parseRowValues: gestionarFormasNoPersonales,
    maxRows: 1,
  },
  {
    separator: ["", "", "", "Indicativo"],
  },
  {
    header: [
      "Número",
      "Personas del discurso",
      "Pronombres personales",
      "Presente",
      "Pretérito perfecto compuesto / Antepresente",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "presente",
      "preteritoPerfectoCompuesto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Pretérito imperfecto / Copretérito",
      "Pretérito pluscuamperfecto / Antecopretérito",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "preteritoImperfecto",
      "preteritoPluscuamperfecto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Pretérito perfecto simple / Pretérito",
      "Pretérito anterior / Antepretérito",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "preteritoPerfectoSimple",
      "preteritoAnterior",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Futuro simple / Futuro",
      "Futuro compuesto / Antefuturo",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "futuroSimple",
      "futuroCompuesto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Condicional simple / Pospretérito",
      "Condicional compuesto / Antepospretérito",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "condicionalSimple",
      "condicionalCompuesto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    separator: ["", "", "", "Subjuntivo"],
  },
  {
    header: [
      "Número",
      "Personas del discurso",
      "Pronombres personales",
      "Presente",
      "Pretérito perfecto compuesto / Antepresente",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "presente",
      "preteritoPerfectoCompuesto",
    ],
    parseRowValues: gestionarSubjuntivo,
    maxRows: 8,
  },
  {
    header: ["", "", "", "Pretérito imperfecto / Pretérito"],
    mappedHeaders: ["numero", "persona", "pronombre", "preteritoImperfecto"],
    parseRowValues: gestionarSubjuntivo,
    maxRows: 8,
  },
  {
    header: ["", "", "", "Pretérito pluscuamperfecto / Antepretérito"],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "preteritoPluscuamperfecto",
    ],
    parseRowValues: gestionarSubjuntivo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Futuro simple / Futuro",
      "Futuro compuesto / Antefuturo",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "futuroSimple",
      "futuroCompuesto",
    ],
    parseRowValues: gestionarSubjuntivo,
    maxRows: 8,
  },
  {
    separator: ["", "", "", "Imperativo"],
  },
  {
    header: [
      "Número",
      "Personas del discurso",
      "Pronombres personales",
      "",
      "",
    ],
    mappedHeaders: ["numero", "persona", "pronombre", "imperativo"],
    parseRowValues: gestionarImperativo,
    maxRows: 8,
  },
]);

// Sin imperativo
const conjugacionTableTemplate2 = new HTMLTableTemplate("conjugacion-table2", [
  {
    separator: ["", "", "", "Formas no personales"],
  },
  {
    header: ["", "", "", "Infinitivo", "Gerundio"],
    mappedHeaders: [undefined, undefined, undefined, "infinitivo", "gerundio"],
    parseRowValues: gestionarFormasNoPersonales,
    maxRows: 8,
  },
  {
    header: ["", "", "", "Infinitivo compuesto", "Gerundio compuesto"],
    mappedHeaders: [
      undefined,
      undefined,
      undefined,
      "infinitivoCompuesto",
      "gerundioCompuesto",
    ],
    parseRowValues: gestionarFormasNoPersonales,
    maxRows: 8,
  },
  {
    header: ["", "", "", "Participio"],
    mappedHeaders: [undefined, undefined, undefined, "participio"],
    parseRowValues: gestionarFormasNoPersonales,
    maxRows: 8,
  },
  {
    separator: ["", "", "", "Indicativo"],
  },
  {
    header: [
      "Número",
      "Personas del discurso",
      "Pronombres personales",
      "Presente",
      "Pretérito perfecto compuesto / Antepresente",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "presente",
      "preteritoPerfectoCompuesto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Pretérito imperfecto / Copretérito",
      "Pretérito pluscuamperfecto / Antecopretérito",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "preteritoImperfecto",
      "preteritoPluscuamperfecto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Pretérito perfecto simple / Pretérito",
      "Pretérito anterior / Antepretérito",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "preteritoPerfectoSimple",
      "preteritoAnterior",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Futuro simple / Futuro",
      "Futuro compuesto / Antefuturo",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "futuroSimple",
      "futuroCompuesto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Condicional simple / Pospretérito",
      "Condicional compuesto / Antepospretérito",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "condicionalSimple",
      "condicionalCompuesto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    separator: ["", "", "", "Subjuntivo"],
  },
  {
    header: [
      "Número",
      "Personas del discurso",
      "Pronombres personales",
      "Presente",
      "Pretérito perfecto compuesto / Antepresente",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "presente",
      "preteritoPerfectoCompuesto",
    ],
    parseRowValues: gestionarSubjuntivo,
    maxRows: 8,
  },
  {
    header: ["", "", "", "Pretérito imperfecto / Pretérito"],
    mappedHeaders: ["numero", "persona", "pronombre", "preteritoImperfecto"],
    parseRowValues: gestionarSubjuntivo,
    maxRows: 8,
  },
  {
    header: ["", "", "", "Pretérito pluscuamperfecto / Antepretérito"],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "preteritoPluscuamperfecto",
    ],
    parseRowValues: gestionarSubjuntivo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Futuro simple / Futuro",
      "Futuro compuesto / Antefuturo",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "futuroSimple",
      "futuroCompuesto",
    ],
    parseRowValues: gestionarSubjuntivo,
    maxRows: 8,
  },
  // No tiene imperativo
]);

// Sin gerundio ni imperativo
const conjugacionTableTemplate3 = new HTMLTableTemplate("conjugacion-table3", [
  {
    separator: ["", "", "", "Formas no personales"],
  },
  {
    header: ["", "", "", "Infinitivo", ""],
    mappedHeaders: [undefined, undefined, undefined, "infinitivo"],
    parseRowValues: gestionarFormasNoPersonales,
    maxRows: 1,
  },
  {
    header: ["", "", "", "Infinitivo compuesto", "Gerundio compuesto"],
    mappedHeaders: [
      undefined,
      undefined,
      undefined,
      "infinitivoCompuesto",
      "gerundioCompuesto",
    ],
    parseRowValues: gestionarFormasNoPersonales,
    maxRows: 1,
  },
  {
    header: ["", "", "", "Participio"],
    mappedHeaders: [undefined, undefined, undefined, "participio"],
    parseRowValues: gestionarFormasNoPersonales,
    maxRows: 1,
  },
  {
    separator: ["", "", "", "Indicativo"],
  },
  {
    header: [
      "Número",
      "Personas del discurso",
      "Pronombres personales",
      "Presente",
      "Pretérito perfecto compuesto / Antepresente",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "presente",
      "preteritoPerfectoCompuesto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Pretérito imperfecto / Copretérito",
      "Pretérito pluscuamperfecto / Antecopretérito",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "preteritoImperfecto",
      "preteritoPluscuamperfecto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Pretérito perfecto simple / Pretérito",
      "Pretérito anterior / Antepretérito",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "preteritoPerfectoSimple",
      "preteritoAnterior",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Futuro simple / Futuro",
      "Futuro compuesto / Antefuturo",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "futuroSimple",
      "futuroCompuesto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Condicional simple / Pospretérito",
      "Condicional compuesto / Antepospretérito",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "condicionalSimple",
      "condicionalCompuesto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    separator: ["", "", "", "Subjuntivo"],
  },
  {
    header: [
      "Número",
      "Personas del discurso",
      "Pronombres personales",
      "Presente",
      "Pretérito perfecto compuesto / Antepresente",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "presente",
      "preteritoPerfectoCompuesto",
    ],
    parseRowValues: gestionarSubjuntivo,
    maxRows: 8,
  },
  {
    header: ["", "", "", "Pretérito imperfecto / Pretérito"],
    mappedHeaders: ["numero", "persona", "pronombre", "preteritoImperfecto"],
    parseRowValues: gestionarSubjuntivo,
    maxRows: 8,
  },
  {
    header: ["", "", "", "Pretérito pluscuamperfecto / Antepretérito"],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "preteritoPluscuamperfecto",
    ],
    parseRowValues: gestionarSubjuntivo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Futuro simple / Futuro",
      "Futuro compuesto / Antefuturo",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "futuroSimple",
      "futuroCompuesto",
    ],
    parseRowValues: gestionarSubjuntivo,
    maxRows: 8,
  },
  // No tiene imperativo
]);

// Sin gerundio ni imperativo ni participio
const conjugacionTableTemplate4 = new HTMLTableTemplate("conjugacion-table4", [
  {
    separator: ["", "", "", "Formas no personales"],
  },
  {
    header: ["", "", "", "Infinitivo", ""],
    mappedHeaders: [undefined, undefined, undefined, "infinitivo"],
    parseRowValues: gestionarFormasNoPersonales,
    maxRows: 1,
  },
  {
    header: ["", "", "", "Infinitivo compuesto", "Gerundio compuesto"],
    mappedHeaders: [
      undefined,
      undefined,
      undefined,
      "infinitivoCompuesto",
      "gerundioCompuesto",
    ],
    parseRowValues: gestionarFormasNoPersonales,
    maxRows: 1,
  },
  {
    separator: ["", "", "", "Indicativo"],
  },
  {
    header: [
      "Número",
      "Personas del discurso",
      "Pronombres personales",
      "Presente",
      "Pretérito perfecto compuesto / Antepresente",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "presente",
      "preteritoPerfectoCompuesto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Pretérito imperfecto / Copretérito",
      "Pretérito pluscuamperfecto / Antecopretérito",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "preteritoImperfecto",
      "preteritoPluscuamperfecto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Pretérito perfecto simple / Pretérito",
      "Pretérito anterior / Antepretérito",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "preteritoPerfectoSimple",
      "preteritoAnterior",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Futuro simple / Futuro",
      "Futuro compuesto / Antefuturo",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "futuroSimple",
      "futuroCompuesto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Condicional simple / Pospretérito",
      "Condicional compuesto / Antepospretérito",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "condicionalSimple",
      "condicionalCompuesto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    separator: ["", "", "", "Subjuntivo"],
  },
  {
    header: [
      "Número",
      "Personas del discurso",
      "Pronombres personales",
      "Presente",
      "Pretérito perfecto compuesto / Antepresente",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "presente",
      "preteritoPerfectoCompuesto",
    ],
    parseRowValues: gestionarSubjuntivo,
    maxRows: 8,
  },
  {
    header: ["", "", "", "Pretérito imperfecto / Pretérito"],
    mappedHeaders: ["numero", "persona", "pronombre", "preteritoImperfecto"],
    parseRowValues: gestionarSubjuntivo,
    maxRows: 8,
  },
  {
    header: ["", "", "", "Pretérito pluscuamperfecto / Antepretérito"],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "preteritoPluscuamperfecto",
    ],
    parseRowValues: gestionarSubjuntivo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Futuro simple / Futuro",
      "Futuro compuesto / Antefuturo",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "futuroSimple",
      "futuroCompuesto",
    ],
    parseRowValues: gestionarSubjuntivo,
    maxRows: 8,
  },
]);

// Sin gerundio ni preterito imperfecto
const conjugacionTableTemplate5 = new HTMLTableTemplate("conjugacion-table5", [
  {
    separator: ["", "", "", "Formas no personales"],
  },
  {
    header: ["", "", "", "Infinitivo", ""],
    mappedHeaders: [undefined, undefined, undefined, "infinitivo"],
    parseRowValues: gestionarFormasNoPersonales,
    maxRows: 1,
  },
  {
    header: ["", "", "", "Infinitivo compuesto", "Gerundio compuesto"],
    mappedHeaders: [
      undefined,
      undefined,
      undefined,
      "infinitivoCompuesto",
      "gerundioCompuesto",
    ],
    parseRowValues: gestionarFormasNoPersonales,
    maxRows: 1,
  },
  {
    header: ["", "", "", "Participio"],
    mappedHeaders: [undefined, undefined, undefined, "participio"],
    parseRowValues: gestionarFormasNoPersonales,
    maxRows: 1,
  },
  {
    separator: ["", "", "", "Indicativo"],
  },
  {
    header: [
      "Número",
      "Personas del discurso",
      "Pronombres personales",
      "Presente",
      "Pretérito perfecto compuesto / Antepresente",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "presente",
      "preteritoPerfectoCompuesto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Pretérito imperfecto / Copretérito",
      "Pretérito pluscuamperfecto / Antecopretérito",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "preteritoImperfecto",
      "preteritoPluscuamperfecto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Pretérito perfecto simple / Pretérito",
      "Pretérito anterior / Antepretérito",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "preteritoPerfectoSimple",
      "preteritoAnterior",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Futuro simple / Futuro",
      "Futuro compuesto / Antefuturo",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "futuroSimple",
      "futuroCompuesto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Condicional simple / Pospretérito",
      "Condicional compuesto / Antepospretérito",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "condicionalSimple",
      "condicionalCompuesto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    separator: ["", "", "", "Subjuntivo"],
  },
  {
    header: [
      "Número",
      "Personas del discurso",
      "Pronombres personales",
      "Presente",
      "Pretérito perfecto compuesto / Antepresente",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "presente",
      "preteritoPerfectoCompuesto",
    ],
    parseRowValues: gestionarSubjuntivo,
    maxRows: 8,
  },
  {
    header: ["", "", "", "Pretérito pluscuamperfecto / Antepretérito"],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "preteritoPluscuamperfecto",
    ],
    parseRowValues: gestionarSubjuntivo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Futuro simple / Futuro",
      "Futuro compuesto / Antefuturo",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "futuroSimple",
      "futuroCompuesto",
    ],
    parseRowValues: gestionarSubjuntivo,
    maxRows: 8,
  },
  {
    separator: ["", "", "", "Imperativo"],
  },
  {
    header: [
      "Número",
      "Personas del discurso",
      "Pronombres personales",
      "",
      "",
    ],
    mappedHeaders: ["numero", "persona", "pronombre", "imperativo"],
    parseRowValues: gestionarImperativo,
    maxRows: 8,
  },
]);

// Sin gerundio ni imperativo ni preterito imperfecto
const conjugacionTableTemplate6 = new HTMLTableTemplate("conjugacion-table6", [
  {
    separator: ["", "", "", "Formas no personales"],
  },
  {
    header: ["", "", "", "Infinitivo", ""],
    mappedHeaders: [undefined, undefined, undefined, "infinitivo"],
    parseRowValues: gestionarFormasNoPersonales,
    maxRows: 1,
  },
  {
    header: ["", "", "", "Infinitivo compuesto", "Gerundio compuesto"],
    mappedHeaders: [
      undefined,
      undefined,
      undefined,
      "infinitivoCompuesto",
      "gerundioCompuesto",
    ],
    parseRowValues: gestionarFormasNoPersonales,
    maxRows: 1,
  },
  {
    header: ["", "", "", "Participio"],
    mappedHeaders: [undefined, undefined, undefined, "participio"],
    parseRowValues: gestionarFormasNoPersonales,
    maxRows: 1,
  },
  {
    separator: ["", "", "", "Indicativo"],
  },
  {
    header: [
      "Número",
      "Personas del discurso",
      "Pronombres personales",
      "Presente",
      "Pretérito perfecto compuesto / Antepresente",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "presente",
      "preteritoPerfectoCompuesto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Pretérito imperfecto / Copretérito",
      "Pretérito pluscuamperfecto / Antecopretérito",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "preteritoImperfecto",
      "preteritoPluscuamperfecto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Pretérito perfecto simple / Pretérito",
      "Pretérito anterior / Antepretérito",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "preteritoPerfectoSimple",
      "preteritoAnterior",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Futuro simple / Futuro",
      "Futuro compuesto / Antefuturo",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "futuroSimple",
      "futuroCompuesto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Condicional simple / Pospretérito",
      "Condicional compuesto / Antepospretérito",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "condicionalSimple",
      "condicionalCompuesto",
    ],
    parseRowValues: gestionarIndicativo,
    maxRows: 8,
  },
  {
    separator: ["", "", "", "Subjuntivo"],
  },
  {
    header: [
      "Número",
      "Personas del discurso",
      "Pronombres personales",
      "Presente",
      "Pretérito perfecto compuesto / Antepresente",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "presente",
      "preteritoPerfectoCompuesto",
    ],
    parseRowValues: gestionarSubjuntivo,
    maxRows: 8,
  },
  {
    header: ["", "", "", "Pretérito pluscuamperfecto / Antepretérito"],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "preteritoPluscuamperfecto",
    ],
    parseRowValues: gestionarSubjuntivo,
    maxRows: 8,
  },
  {
    header: [
      "",
      "",
      "",
      "Futuro simple / Futuro",
      "Futuro compuesto / Antefuturo",
    ],
    mappedHeaders: [
      "numero",
      "persona",
      "pronombre",
      "futuroSimple",
      "futuroCompuesto",
    ],
    parseRowValues: gestionarSubjuntivo,
    maxRows: 8,
  },
]);

// Solo infinitivo e imperativo
const conjugacionTableTemplate7 = new HTMLTableTemplate("conjugacion-table7", [
  {
    separator: ["", "", "", "Formas no personales"],
  },
  {
    header: ["", "", "", "Infinitivo", ""], // Gerundio space is present, this is a bug
    mappedHeaders: [undefined, undefined, undefined, "infinitivo"],
    parseRowValues: gestionarFormasNoPersonales,
    maxRows: 1,
  },
  {
    separator: ["", "", "", "Imperativo"],
  },
  {
    header: [
      "Número",
      "Personas del discurso",
      "Pronombres personales",
      "",
      "",
    ],
    mappedHeaders: ["numero", "persona", "pronombre", "imperativo"],
    parseRowValues: gestionarImperativo,
    maxRows: 8,
  },
]);

// Solo tiene infinitivo y gerundio
const conjugacionTableTemplate8 = new HTMLTableTemplate("conjugacion-table8", [
  {
    separator: ["", "", "", "Formas no personales"],
  },
  {
    header: ["", "", "", "Infinitivo", "Gerundio"],
    mappedHeaders: [undefined, undefined, undefined, "infinitivo", "gerundio"],
    parseRowValues: gestionarFormasNoPersonales,
    maxRows: 1,
  },
]);

const conjugacionContentTemplate = new HTMLSingleChildTemplate(
  new HTMLTagTemplate(
    "conjugacion-article",
    "article",
    {},
    new HTMLTemplateFSM("conjugacion-article-content", [
      {
        isRoot: true,
        stateId: "conjugacion-header",
        template: new HTMLTagTemplate("conjugacion-header", "header", {}),
        nextStates: ["conjugacion-table"],
      },
      {
        stateId: "conjugacion-table",
        template: new AnyHTMLTemplate("conjugacion-tables", [
          conjugacionTableTemplate1,
          conjugacionTableTemplate2,
          conjugacionTableTemplate3,
          conjugacionTableTemplate4,
          conjugacionTableTemplate5,
          conjugacionTableTemplate6,
          conjugacionTableTemplate7,
          conjugacionTableTemplate8,
        ]),
        nextStates: [],
      },
    ]),
    (key, value) => key === "id",
    ["id"]
  )
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
      conjugacionContentTemplate
    ),
    nextStates: ["article", "conjugacion2", "sin-ant", "otras", "derechos"],
  },
  {
    stateId: "conjugacion2",
    template: new HTMLTagTemplate(
      "div-conjugacion2",
      "div",
      { id: "conjugacion2" },
      conjugacionContentTemplate
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
