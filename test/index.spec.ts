import { describe, it, expect } from "vitest";
import { parseDocument } from "htmlparser2";
import { remark } from "remark";
import remarkParse from "remark-parse";
import plugin from "../src/main";
import { selectOne } from "css-select";

function defineCase(
  name: string,
  options: {
    input: string;
    assertions: (html: string) => Promise<void> | void;
  },
) {
  it(name, async () => {
    const processor = remark().use(remarkParse).use(plugin);
    const html = String(await processor.process(options.input));
    await options.assertions(html);
  });
}

describe("MkDocs-style !!! admonitions - concrete example", () => {
  defineCase("wraps warning block in div.admonition.admonition-warning", {
    input: `* Responses from a host with IP \`23.215.0.136\` (all services): 
  \`\`\`
  host:23.215.0.136
  \`\`\`
* The same host, requested by domain name (HTTP services only): 
  \`\`\`
  host:example.com
  \`\`\`
* The same domain and its subdomains (HTTP services only):
  \`\`\`
  host:(example.com OR *.example.com)
  \`\`\`
* Previous example as a regular expression:
  \`\`\`
  host:/(.*\\.)?example\\.com/
  \`\`\`  

!!! warning "Difference between IP and domain-based searches in the \`host\` field"
    When scanning by IP address, Netlas scans [all available services](/knowledge-base/scanning-technology.md) on the target machine.
    In contrast, when scanning by domain name, only HTTP/HTTPS services on ports \`80\` and \`443\` are scanned.

    So if you query \`host:example.com\`, you will only get HTTP(S) responses.
    To retrieve all services hosted on the machine behind \`example.com\`, use its IP address instead.
`,
    assertions(html) {
      const doc = parseDocument(html);
      const div = selectOne("div.admonition.admonition-warning", doc);

      expect(div, "div.admonition.admonition-warning should be present").not.toBeNull();
      expect(html).not.toContain("!!! warning");
      expect(html).toContain("When scanning by IP address");
      expect(html).toContain("So if you query `host:example.com`");
    },
  });

  defineCase("does nothing when there is no !!! block", {
    input: `Regular text

No admonitions here.`,
    assertions(html) {
      expect(html).toContain("Regular text");
      expect(html).toContain("No admonitions here.");
    },
  });
});

describe("MkDocs-style !!! admonitions - per type", () => {
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
  ] as const;

  for (const type of types) {
    defineCase(`transforms !!! ${type} into div.admonition.admonition-${type}`, {
      input: `!!! ${type} "Title"
    Content for ${type}.
`,
      assertions(html) {
        const doc = parseDocument(html);
        const selector = `div.admonition.admonition-${type}`;
        const div = selectOne(selector, doc);

        expect(div, `${selector} should be present`).not.toBeNull();
        expect(html).not.toContain(`!!! ${type}`);
        expect(html).toContain(`Content for ${type}.`);
      },
    });
  }
}
);


