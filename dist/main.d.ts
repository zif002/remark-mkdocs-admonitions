import type { Plugin } from "unified";
/**
 * Remark plugin that finds MkDocs-style admonitions starting with
 *
 * !!! <type> "Title"
 *     Content...
 *
 * where <type> is one of:
 * note, info, tip, success, question, failure, danger, bug, example, quote, warning
 *
 * and replaces them in the original markdown source with:
 *
 * <div class="admonition admonition-<type>">{Content}</div>
 *
 * Then it reparses the modified markdown back into an mdast tree.
 */
export declare const remarkMkDocsAdmonitions: Plugin;
export default remarkMkDocsAdmonitions;
//# sourceMappingURL=main.d.ts.map