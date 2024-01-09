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
      (node as HTMLElement).innerHTML.trim().length === 0)
  );
}

export abstract class HTMLTemplate {
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
  abstract parse(node: Node, metadata?: object): void;

  /**
   * Check if node is valid.
   * Does not exit program on failure
   * @param node Node to check
   * @returns Whether the node is valid
   */
  abstract see(node: Node): boolean;
}

export class HTMLTemplateGraphNode {
  readonly template: HTMLTemplate;
  readonly parseFn: (node: Node, metadata: object) => object;
  readonly nextNodes: HTMLTemplateGraphNode[];

  constructor(
    template: HTMLTemplate,
    parseFn?: (node: Node, stack: object) => object,
    nextNodes: HTMLTemplateGraphNode[] = []
  ) {
    this.template = template;
    this.nextNodes = nextNodes;
    this.parseFn = parseFn
      ? parseFn
      : (_: Node, metadata: object) => {
          // Leave metadata untouched by default
          return metadata;
        };
  }

  addNextNode(nextNode: HTMLTemplateGraphNode) {
    this.nextNodes.push(nextNode);
  }
}

export type HTMLTemplateGraphState = {
  isRoot?: boolean;
  stateId: string;
  template: HTMLTemplate;
  nextStates: string[];
  parseFn?: (node: Node, metadata: object) => object;
};
/**
 * Template that checks children of a specific HTMLElement
 * using a finite state machine (FSM). Each child will be checked
 * sequentially and the first child is expected to be any of the root nodes.
 * Next nodes can be what nodes can follow the initial node.
 */
export class HTMLTemplateFSM extends HTMLTemplate {
  readonly rootNodes: HTMLTemplateGraphNode[];
  readonly metadata: object;

  constructor(ruleId: string, states: HTMLTemplateGraphState[]) {
    super(ruleId);
    this.metadata = {};

    const rootStates = states.filter((state) => state.isRoot);

    const mappedStates = Object.fromEntries(
      states.map<[string, HTMLTemplateGraphState]>((state) => [
        state.stateId,
        state,
      ])
    );

    let mappedNodes = Object.fromEntries(
      states.map<[string, HTMLTemplateGraphNode]>((state) => [
        state.stateId,
        new HTMLTemplateGraphNode(state.template, state.parseFn),
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

  parse(node: Node, metadata: object = {}): void {
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
        throw `${
          this.ruleId
        }: Missing template for element:\n${child.toString()}\n\n${node
          .toString()
          .substring(0, 500)}`;
      }
    }
  }
  see(_: Node): boolean {
    // Graph doesn't need to be seen unless we start nesting graphs which doesn't
    // make sense. A single graph should cover all possibilities.
    return true;
  }
}

export class HTMLTagTemplate extends HTMLTemplate {
  readonly tagName: string;
  readonly attributes: { [key: string]: string };
  readonly childrenValidator: HTMLTemplate;
  readonly defaultAttributeValidator:
    | ((key: string, value: string) => void)
    | undefined;
  readonly keyAttributes: string[];

  constructor(
    ruleId: string,
    tagName: string,
    attributes: { [key: string]: string },
    childrenValidator: HTMLTemplate = new SkipTemplate(),
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

export class SkipTemplate extends HTMLTemplate {
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
