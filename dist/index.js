import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkHtml from "remark-html";
/**
 * Remark plugin that finds MkDocs-style admonitions starting with
 *
 * !!! <type> "Title"
 *     Content...
 *
 * where <type> is one of:
 * note, info, tip, success, question, failure, danger, bug, example, quote, warning
 *
 * and replaces them in the original markdown source with HTML:
 *
 * <div class="admonition admonition-<type>">…rendered HTML…</div>
 *
 * Then it reparses the modified markdown back into an mdast tree.
 */
export const remarkMkDocsAdmonitions = () => {
    return (tree, file) => {
        if (typeof file.value !== "string")
            return;
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
            "abstract"
        ];
        const typePattern = types.join("|");
        // const pattern = new RegExp(
        //   String.raw`!!![ \t]+(${typePattern})[^\n]*\n((?:[ \t]{4}.*\n*\t?)*)`,
        //   "i",
        // );
        const pattern = new RegExp(String.raw `^!!! (?<type>${typePattern}+) "(?<title>[^"]*)"(?:\r?\n(?<body>(?:(?:(?: {4,}|\t).*|[ \t]*)\r?\n)+))?`, "igm");
        const match = pattern.exec(source);
        if (!match?.groups)
            return;
        if (!match || match.index === undefined)
            return;
        const titleMatch = match.groups.title || "";
        const bodyMatch = match.groups.body || "";
        const typeMatch = match.groups.type;
        const before = source.slice(0, match.index);
        const after = source.slice(match.index + match[0].length);
        const bodyMarkdown = bodyMatch
            .split("\n")
            .map((line) => line.replace(/^[ \t]{4}/, ""))
            .join("\n")
            .trimEnd();
        const bodyHtml = unified()
            .use(remarkParse)
            .use(remarkHtml)
            .processSync(bodyMarkdown)
            .toString()
            .trim();
        const titleMarkDown = titleMatch.split("\n")
            .map((line) => line.replace(/^[ \t]{4}/, ""))
            .join("\n")
            .trim();
        const titleHtml = unified().use(remarkParse)
            .use(remarkHtml)
            .processSync(titleMarkDown)
            .toString()
            .trim();
        const replacement = `<div class="admonition admonition-${typeMatch.toLocaleLowerCase()}">
        ${titleMatch.length && `<div class="admonition-title">${titleHtml}</div>`}
        ${bodyHtml}
      </div>`;
        source = `${before}${replacement}${after}`;
        const nextTree = unified().use(remarkParse).parse(source);
        for (const key of Object.keys(tree)) {
            delete tree[key];
        }
        Object.assign(tree, nextTree);
        file.value = source;
    };
};
export default remarkMkDocsAdmonitions;
