import { Node, NodeType, TextNode, HTMLElement } from "node-html-parser";

function shouldSkip(node: Node) {
  return (
    node.nodeType === NodeType.COMMENT_NODE ||
    (node.nodeType === NodeType.TEXT_NODE &&
      // Some children may be empty strings
      // We will ignore this for now
      (node as TextNode).textContent.trim().length === 0) ||
    (node.nodeType === NodeType.ELEMENT_NODE &&
      // Some divs are empty
      (node as HTMLElement).innerText.trim().length === 0)
  );
}

export abstract class HTMLTemplate<Metadata = object> {
  /**
   * List of all rule ids to check that they are unique
   */
  private static allRuleIds: Set<string> = new Set<string>();

  /**
   * Unique identifier of this rule used for debug purposes
   */
  readonly ruleId: string;

  constructor(ruleId: string) {
    if (HTMLTemplate.allRuleIds.has(ruleId)) {
      throw `Duplicate rule identifier: ${ruleId}`;
    }
    HTMLTemplate.allRuleIds.add(ruleId);
    this.ruleId = ruleId;
  }

  /**
   * Parse node data and exit by throwing a failure if it cannot be parsed.
   * @param node Node to validate
   * @param metadata Metadata that helps the parsing process
   */
  abstract parse(node: Node, metadata: Metadata): void;

  /**
   * Check if node is valid.
   * Does not exit program on failure
   * @param node Node to check
   * @returns Whether the node is valid
   */
  abstract see(node: Node): boolean;
}

export abstract class HTMLChildrenTemplate<
  Metadata = object
> extends HTMLTemplate<Metadata> {
  __type: "HTMLChildrenTemplate" = "HTMLChildrenTemplate";
}
export abstract class HTMLNodeTemplate<
  Metadata = object
> extends HTMLTemplate<Metadata> {
  __type: "HTMLNodeTemplate" = "HTMLNodeTemplate";
}

export class HTMLTemplateGraphNode<Metadata> {
  readonly template: HTMLNodeTemplate;
  readonly parseFn: (node: Node, metadata: Metadata) => object;
  readonly nextNodes: HTMLTemplateGraphNode<Metadata>[];

  constructor(
    template: HTMLNodeTemplate,
    parseFn?: (node: Node, metadata: Metadata) => object,
    nextNodes: HTMLTemplateGraphNode<Metadata>[] = []
  ) {
    this.template = template;
    this.nextNodes = nextNodes;
    this.parseFn = parseFn
      ? parseFn
      : (node: Node, metadata: Metadata) => {
          // Leave metadata untouched by default
          return metadata as object;
        };
  }

  addNextNode(nextNode: HTMLTemplateGraphNode<Metadata>) {
    this.nextNodes.push(nextNode);
  }
}

export type HTMLTemplateGraphState<Metadata> = {
  isRoot?: boolean;
  stateId: string;
  template: HTMLNodeTemplate;
  nextStates: string[];
  parseFn?: (node: Node, metadata: Metadata) => object;
};
/**
 * Template that checks children of a specific HTMLElement
 * using a finite state machine (FSM). Each child will be checked
 * sequentially and the first child is expected to be any of the root nodes.
 * Next nodes can be what nodes can follow the initial node.
 */
export class HTMLTemplateFSM<Metadata> extends HTMLChildrenTemplate<Metadata> {
  readonly rootNodes: HTMLTemplateGraphNode<Metadata>[];
  readonly metadata: object;

  constructor(ruleId: string, states: HTMLTemplateGraphState<Metadata>[]) {
    super(ruleId);
    this.metadata = {};

    const rootStates = states.filter((state) => state.isRoot);

    const mappedStates = Object.fromEntries(
      states.map<[string, HTMLTemplateGraphState<Metadata>]>((state) => [
        state.stateId,
        state,
      ])
    );

    let mappedNodes = Object.fromEntries(
      states.map<[string, HTMLTemplateGraphNode<Metadata>]>((state) => [
        state.stateId,
        new HTMLTemplateGraphNode<Metadata>(state.template, state.parseFn),
      ])
    );
    // traverse Graph tree to link nodes
    let stack = [...rootStates];
    const visited = new Set<string>();
    while (true) {
      const state = stack.pop();
      if (!state) break;

      visited.add(state.stateId);
      const node = mappedNodes[state.stateId];
      for (const nextState of state.nextStates) {
        // Add state if we need to visit it
        if (!visited.has(nextState)) stack.push(mappedStates[nextState]);

        node.addNextNode(mappedNodes[nextState]);
      }
    }
    this.rootNodes = rootStates.map((root) => mappedNodes[root.stateId]);
  }

  parse(node: Node, metadata: Metadata): void {
    let validNodes = [...this.rootNodes];
    for (const child of node.childNodes) {
      if (shouldSkip(child)) {
        continue;
      }

      let foundNode = false;
      for (const node of validNodes) {
        if (node.template.see(child)) {
          foundNode = true;
          const updatedMetadata = node.parseFn(child, metadata);
          node.template.parse(child, updatedMetadata);
          validNodes = node.nextNodes;
          break;
        }
      }
      if (!foundNode) {
        throw `${this.ruleId}: Missing template for element:\n${child
          .toString()
          .substring(0, 500)}\n\n${node.toString().substring(0, 500)}`;
      }
    }
  }
  see(_: Node): boolean {
    // Graph doesn't need to be seen unless we start nesting graphs which doesn't
    // make sense. A single graph should cover all possibilities.
    return true;
  }
}

export class AnyHTMLTemplate extends HTMLNodeTemplate {
  readonly templates: HTMLNodeTemplate[];

  constructor(ruleId: string, templates: HTMLNodeTemplate[]) {
    super(ruleId);
    this.templates = templates;
  }

  parse(node: Node, metadata: object): void {
    for (const template of this.templates) {
      if (template.see(node)) return template.parse(node, metadata);
    }
    throw `${this.ruleId}: Missing template for:\n${node.toString()}`;
  }

  see(node: Node): boolean {
    for (const template of this.templates) {
      if (template.see(node)) return true;
    }
    return false;
  }
}

export class HTMLTableSeparator<Metadata = object> {
  readonly tableRuleId: string;
  readonly columnContents: (HTMLChildrenTemplate<Metadata> | string)[];
  readonly __type: "HTMLTableSeparator" = "HTMLTableSeparator";

  constructor(
    tableRuleId: string,
    columnContents: (HTMLChildrenTemplate<Metadata> | string)[]
  ) {
    this.tableRuleId = tableRuleId;
    this.columnContents = columnContents;
  }

  see(row: HTMLElement): boolean {
    if (row.childNodes.length !== this.columnContents.length) {
      return false;
    }
    for (let i = 0; i < this.columnContents.length; i++) {
      const template = this.columnContents[i];
      const child = row.childNodes[i];

      if (typeof template === "string") {
        if (child.innerText !== template) {
          return false;
        }
      } else {
        if (!template.see(child)) return false;
      }
    }
    return true;
  }

  parseHeaderContents(rowId: number, row: HTMLElement, metadata: Metadata) {
    if (row.childNodes.length !== this.columnContents.length) {
      throw `${this.tableRuleId}-${rowId}: Expected ${
        this.columnContents.length
      } columns but received ${row.childNodes.length}\n${row
        .toString()
        .substring(0, 500)}`;
    }

    for (let i = 0; i < this.columnContents.length; i++) {
      const template = this.columnContents[i];
      const child = row.childNodes[i];

      if (typeof template === "string") {
        if (child.innerText !== template) {
          throw `${
            this.tableRuleId
          }-${rowId}: Expected header with value '${template}' but found '${
            child.innerText
          }' instead\n${row.toString().substring(0, 500)}`;
        }
      } else {
        template.parse(child, metadata);
      }
    }
  }
}

export class HTMLHeadedTable<HeaderKey extends string, Metadata = object> {
  readonly mappedHeaders: (HeaderKey | undefined)[];
  readonly header: HTMLTableSeparator<Metadata>;
  readonly parseRowValues: (
    rowNode: HTMLElement,
    rowValues: { [key in HeaderKey]: Node },
    metadata: Metadata
  ) => void;
  readonly maxRows: number;
  readonly __type: "HTMLHeadedTable" = "HTMLHeadedTable";

  constructor(
    tableRuleId: string,
    mappedHeaders: (HeaderKey | undefined)[],
    headerContents: (HTMLChildrenTemplate<Metadata> | string)[],
    parseRowValues: (
      rowNode: HTMLElement,
      rowValues: { [key in HeaderKey]: Node },
      metadata: Metadata
    ) => void,
    maxRows: number = 100000000 // Assume this is infinity
  ) {
    this.mappedHeaders = mappedHeaders;
    this.header = new HTMLTableSeparator<Metadata>(tableRuleId, headerContents);
    this.parseRowValues = parseRowValues;
    this.maxRows = maxRows;
  }

  see(row: HTMLElement): boolean {
    return this.header.see(row);
  }

  parseHeaderContents(rowId: number, row: HTMLElement, metadata: Metadata) {
    return this.header.parseHeaderContents(rowId, row, metadata);
  }
}

export type TableComponent<Metadata> =
  | {
      separator: (HTMLChildrenTemplate<Metadata> | string)[];
    }
  | {
      header: (HTMLChildrenTemplate<Metadata> | string)[];
      mappedHeaders: (string | undefined)[];
      parseRowValues: (
        rowNode: HTMLElement,
        rowValues: { [key in string]: Node },
        metadata: Metadata
      ) => void;
      maxRows?: number;
    };

export class HTMLTableTemplate<
  Metadata = object
> extends HTMLNodeTemplate<Metadata> {
  readonly content: (
    | HTMLTableSeparator<Metadata>
    | HTMLHeadedTable<any, Metadata>
  )[];

  constructor(ruleId: string, components: TableComponent<Metadata>[]) {
    super(ruleId);
    this.content = components.map((comp) => {
      if ("separator" in comp) {
        return new HTMLTableSeparator(ruleId, comp.separator);
      } else {
        return new HTMLHeadedTable(
          ruleId,
          comp.mappedHeaders,
          comp.header,
          comp.parseRowValues,
          comp.maxRows
        );
      }
    });
  }

  see(node: Node): boolean {
    if (node.nodeType !== NodeType.ELEMENT_NODE) return false;
    const elem = node as HTMLElement;

    if (elem.tagName.toUpperCase() !== "TABLE") return false;
    if (elem.childNodes.length !== 1) return false;
    if (elem.childNodes[0].nodeType !== NodeType.ELEMENT_NODE) return false;
    const body = elem.childNodes[0] as HTMLElement;
    if (body.tagName.toUpperCase() !== "TBODY") return false;

    let i = 0,
      j = 0;
    while (i < this.content.length && j < body.childNodes.length) {
      let child = body.childNodes[j];
      if (child.nodeType !== NodeType.ELEMENT_NODE) return false;
      const childElem = child as HTMLElement;
      if (!this.content[i].see(childElem)) return false;
      const component = this.content[i];
      i++;
      j++;
      if (
        component.__type === "HTMLHeadedTable" &&
        i < this.content.length &&
        j < body.childNodes.length
      ) {
        while (j < body.childNodes.length) {
          child = body.childNodes[j];
          if (child.nodeType !== NodeType.ELEMENT_NODE) return false; // This should be an error
          const childElem = child as HTMLElement;
          if (this.content[i].see(childElem)) break;
          j++;
        }
      }
    }

    // Ignore what happens if j < body.childNodes.length
    // Expect the parser to solve this
    return i === this.content.length;
  }

  private extractRowContents(elem: HTMLElement): Node[] {
    return elem.childNodes;
  }

  parse(node: Node, metadata: Metadata): void {
    const body = (node as HTMLElement).childNodes[0] as HTMLElement;

    let i = 0,
      j = 0;
    while (i < this.content.length && j < body.childNodes.length) {
      let child = body.childNodes[j];
      const childElem = child as HTMLElement;
      this.content[i].parseHeaderContents(j, childElem, metadata);
      const component = this.content[i];
      i++;
      j++;
      if (
        component.__type === "HTMLHeadedTable" &&
        j < body.childNodes.length
      ) {
        let rowsLeft = component.maxRows;
        while (j < body.childNodes.length) {
          child = body.childNodes[j];
          const childElem = child as HTMLElement;
          if (i < this.content.length && this.content[i].see(childElem)) break;
          else {
            const rowContents = this.extractRowContents(childElem);
            if (rowsLeft <= 0) {
              throw `${
                this.ruleId
              }-${j}: Missing table components to parse:\n${body.childNodes[j]
                .toString()
                .substring(0, 500)}`;
            }
            if (rowContents.length !== component.mappedHeaders.length) {
              throw `${this.ruleId}-${j}: Expected ${
                component.mappedHeaders.length
              } columns but found ${rowContents.length} instead\n${childElem
                .toString()
                .substring(0, 500)}`;
            }
            component.parseRowValues(
              childElem,
              Object.fromEntries(
                rowContents
                  .map((cellData, colId) => {
                    return [component.mappedHeaders[colId], cellData];
                  })
                  .filter((entry) => entry[0] !== undefined)
              ),
              metadata
            );
            rowsLeft--;
          }
          j++;
        }
      }
    }

    // Ignore what happens if j < body.childNodes.length
    // Expect the parser to solve this
    if (j < body.childNodes.length) {
      throw `${
        this.ruleId
      }: Missing table components to parse:\n${body.childNodes[j]
        .toString()
        .substring(0, 500)}`;
    }
  }
}

export class HTMLTagTemplate extends HTMLNodeTemplate {
  readonly tagName: string;
  readonly attributes: { [key: string]: string };
  readonly childrenValidator: HTMLChildrenTemplate;
  readonly defaultAttributeValidator:
    | ((key: string, value: string) => void)
    | undefined;
  readonly keyAttributes: string[];

  constructor(
    ruleId: string,
    tagName: string,
    attributes: { [key: string]: string },
    childrenValidator: HTMLChildrenTemplate = new SkipTemplate(),
    defaultAttributeValidator?: (key: string, value: string) => void,
    keyAttributes?: string[]
  ) {
    super(ruleId);

    this.tagName = tagName;
    this.attributes = attributes;
    this.childrenValidator = childrenValidator;
    this.defaultAttributeValidator = defaultAttributeValidator;

    if (keyAttributes === undefined) {
      let defaultKeyAttributes: string[] = [];
      // Check if id or data-acc attributes are expected
      if ("id" in this.attributes) defaultKeyAttributes.push("id");
      if ("data-acc" in this.attributes) defaultKeyAttributes.push("data-acc");
      if ("class" in this.attributes) defaultKeyAttributes.push("class");

      if (defaultKeyAttributes.length > 0)
        this.keyAttributes = defaultKeyAttributes;
      // If there are not known key attributes, assume all are key attributes
      else this.keyAttributes = Object.keys(this.attributes);
    } else {
      this.keyAttributes = keyAttributes;
    }
  }

  parse(node: Node, metadata: object = {}): void {
    const element = node as HTMLElement;

    const visitedAttributes: string[] = [];
    for (const key in element.attributes) {
      if (key in this.attributes) {
        visitedAttributes.push(key);
        if (element.attributes[key] !== this.attributes[key]) {
          throw `${this.ruleId}: Expected attribute '${key}' value to be '${this.attributes[key]}' but received '${element.attributes[key]}'`;
        }
      } else if (this.defaultAttributeValidator !== undefined) {
        this.defaultAttributeValidator(key, element.attributes[key]);
      } else {
        throw `${this.ruleId}: Unexpected attribute '${key}=${
          element.attributes[key]
        }'\n${node.toString()}`;
      }
    }

    if (visitedAttributes.length !== Object.keys(this.attributes).length) {
      // There are missing attributes
      const missingAttributes = Object.keys(this.attributes).filter(
        (key) => !visitedAttributes.includes(key)
      );
      throw `${this.ruleId}: Missing ${
        missingAttributes.length
      } attributes:\n${missingAttributes.join(", ")}`;
    }

    return this.childrenValidator.parse(node, metadata);
  }
  see(node: Node): boolean {
    if (node.nodeType !== NodeType.ELEMENT_NODE) return false;
    const element = node as HTMLElement;

    if (element.tagName.toUpperCase() !== this.tagName.toUpperCase()) {
      //   console.log(element.tagName.toUpperCase());
      //   console.log(this.tagName.toUpperCase());
      return false;
    }
    const visitedKeyAttributes: string[] = [];
    for (const key in element.attributes) {
      if (!this.keyAttributes.includes(key)) continue;
      visitedKeyAttributes.push(key);

      if (key in this.attributes) {
        if (element.attributes[key] !== this.attributes[key]) {
          // Expected value does not match
          //   console.log("Expected value does not match");
          return false;
        }
      } else if (this.defaultAttributeValidator !== undefined) {
        // This is undesired behavior but it may be useful
        try {
          this.defaultAttributeValidator(key, element.attributes[key]);
        } catch (_) {
          // Failed to validate attribute
          //   console.log("Failed to validate attribute");
          return false;
        }
      } else {
        // Attribute is not in the expected list of attributes
        console.log("Attribute is not in the expected list of attributes");
        return false;
      }
    }
    if (visitedKeyAttributes.length !== this.keyAttributes.length) {
      // There are missing attributes
      //   console.log("missing attributes");
      return false;
    }

    return this.childrenValidator.see(node);
  }
}

export class HTMLSingleChildTemplate extends HTMLChildrenTemplate {
  childTemplate: HTMLNodeTemplate;

  constructor(childTemplate: HTMLNodeTemplate) {
    super(childTemplate.ruleId + "-sctwrapper");
    this.childTemplate = childTemplate;
  }

  parse(node: Node, metadata: object): void {
    const validChildren = node.childNodes.filter((child) => !shouldSkip(child));
    if (validChildren.length !== 1) {
      throw `${this.ruleId}: Expected 1 child but node contains ${
        validChildren.length
      } children\n${node.toString().substring(0, 500)}`;
    }
    this.childTemplate.parse(validChildren[0], metadata);
  }
  see(node: Node): boolean {
    const validChildren = node.childNodes.filter((child) => !shouldSkip(child));
    if (validChildren.length !== 1) return false;
    return this.childTemplate.see(validChildren[0]);
  }
}

export class SkipTemplate extends HTMLChildrenTemplate {
  private static voidTemplateCount: number = 0;

  constructor() {
    super(`void-template-${SkipTemplate.voidTemplateCount++}`);
  }

  parse(node: Node, metadata: object = {}): void {
    // Void template won't validate anything
  }
  see(node: Node): boolean {
    // Void template won't validate anything
    return true;
  }
}
