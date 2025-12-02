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
        const pattern = new RegExp(String.raw `!!![ \t]+(${typePattern})(.+?)\n([^\n]*[\s\S]*?(?=\n(?!\s)|$))`, "i");
        let changed = false;
        // Support multiple admonitions per file by looping until no more matches.
        while (true) {
            const match = pattern.exec(source);
            if (!match || match.index === undefined)
                break;
            const before = source.slice(0, match.index);
            const fullMatch = match[0];
            const after = source.slice(match.index + fullMatch.length);
            const matchedType = match[1] ?? "";
            const typeLower = matchedType.toLowerCase();
            const innerTitle = match[2] ?? "";
            const innerIndented = match[3] ?? "";
            const innerMarkdown = innerIndented
                .split("\n")
                .map((line) => line.replace(/^[ \t]{4}/, ""))
                .join("\n")
                .trimEnd();
            const title = innerTitle.split("\n")
                .map((line) => line.replace(/^[ \t]{4}/, ""))
                .join("\n")
                .trim();
            const renderTitle = unified().use(remarkParse)
                .use(remarkHtml)
                .processSync(title)
                .toString()
                .trim();
            // Render inner markdown to HTML so that code, links, etc. are preserved.
            const innerHtml = unified()
                .use(remarkParse)
                .use(remarkHtml)
                .processSync(innerMarkdown || "")
                .toString()
                .trim();
            const replacement = `<div class="admonition admonition-${typeLower}">
        ${renderTitle.length && `<div class="admonition-title">${renderTitle}</div>`}
        ${innerHtml}
      </div>`;
            source = `${before}${replacement}${after}`;
            changed = true;
        }
        if (!changed)
            return;
        const nextTree = unified().use(remarkParse).parse(source);
        // Mutate the existing tree in-place so downstream plugins see the updated AST.
        for (const key of Object.keys(tree)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete tree[key];
        }
        Object.assign(tree, nextTree);
        file.value = source;
    };
};
export default remarkMkDocsAdmonitions;
