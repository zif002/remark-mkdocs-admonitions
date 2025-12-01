import type { Plugin } from "unified";
import { unified } from "unified";
import remarkParse from "remark-parse";

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
export const remarkMkDocsAdmonitions: Plugin = () => {
  return (tree, file) => {
    if (typeof file.value !== "string") return;

    let source = String(file.value);

    const types = [
      "note",
      "info",
      "tip",
      "success",
      "question",
      "failure",
      "danger",
      "bug",
      "example",
      "quote",
      "warning",
    ];

    const typePattern = types.join("|");
    const pattern = new RegExp(
      String.raw`!!![ \t]+(${typePattern})[^\n]*\n((?:[ \t]{4}.*\n?)*)`,
      "i",
    );

    let changed = false;

    // Support multiple admonitions per file by looping until no more matches.
    while (true) {
      const match = pattern.exec(source);
      if (!match || match.index === undefined) break;

      const before = source.slice(0, match.index);
      const fullMatch = match[0];
      const after = source.slice(match.index + fullMatch.length);

      const matchedType = match[1] ?? "";
      const typeLower = matchedType.toLowerCase();

      const innerIndented = match[2] ?? "";
      const inner = innerIndented
        .split("\n")
        .map((line) => line.replace(/^[ \t]{4}/, ""))
        .join("\n")
        .trimEnd();

      const replacement = `<div class="admonition admonition-${typeLower}">${inner}</div>`;
      source = `${before}${replacement}${after}`;
      changed = true;
    }

    if (!changed) return;

    const nextTree = unified().use(remarkParse).parse(source);

    // Mutate the existing tree in-place so downstream plugins see the updated AST.
    for (const key of Object.keys(tree as any)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (tree as any)[key];
    }
    Object.assign(tree as any, nextTree);

    file.value = source;
  };
};

export default remarkMkDocsAdmonitions;