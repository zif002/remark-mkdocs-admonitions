import { describe, it, expect } from "vitest";
import { parseDocument } from "htmlparser2";
import { remark } from "remark";
import remarkParse from "remark-parse";
import plugin from "../src/index";
import { selectOne } from "css-select";
import * as cheerio from "cheerio";
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
    When scanning by IP address scans [all available services](/knowledge-base/scanning-technology.md) on the target machine.
    In contrast, when scanning by domain name, only HTTP/HTTPS services on ports \`80\` and \`443\` are scanned.

    So if you query \`host:example.com\`, you will only get HTTP(S) responses.
    To retrieve all services hosted on the machine behind \`example.com\`, use its IP address instead.

* fdssffdsfdsfsdfsd
`,
    assertions(html) {
      const doc = parseDocument(html);
      const div = selectOne("div.admonition.admonition-warning", doc);
      const divDom = cheerio.load(div).html();
      expect(divDom, "div.admonition.admonition-warning should be present").not.toBeNull();
      const title = selectOne("p.admonition-title", div);
      expect(title).not.toBeNull();
      expect(divDom).not.toContain("!!! warning");
      expect(divDom).toContain("When scanning by IP address");
      expect(divDom).toContain("So if you query <code>host:example.com</code>");
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
  // const types = [
  //   "note",
  //   "info",
  //   "tip",
  //   "success",
  //   "question",
  //   "failure",
  //   "danger",
  //   "bug",
  //   "example",
  //   "quote",
  //   "warning",
  // ] as const;

   defineCase(`transforms !!! warning into div.admonition.admonition-warning`, {
      input: `* Previous example as a regular expression:
        \`\`\`
        host:/(.*\\.)?example\\.com/
        \`\`\`  

      !!! Warning "Difference between IP and domain-based searches in the \`host\` field"
          When scanning by IP address scans [all available services](/knowledge-base/scanning-technology.md) on the target machine.
          In contrast, when scanning by domain name, only HTTP/HTTPS services on ports \`80\` and \`443\` are scanned.

          So if you query \`host:example.com\`, you will only get HTTP(S) responses.
          To retrieve all services hosted on the machine behind \`example.com\`, use its IP address instead.
      `,
      assertions(html) {
        const doc = parseDocument(html);
        const selector = `div.admonition.admonition-warning`;
        const div = selectOne(selector, doc);
        const divDom = cheerio.load(div).html();
        const title = selectOne("p.admonition-title", div);
        expect(title).not.toBeNull();
        expect(divDom, `${selector} should be present`).not.toBeNull();
        expect(divDom).not.toContain(`!!! warning`);
        expect(divDom).toContain(`So if you query`);
      },
    });
});

describe("MkDocs-style !!! admonitions - check other example", () => {
  // const types = [
  //   "note",
  //   "info",
  //   "tip",
  //   "success",
  //   "question",
  //   "failure",
  //   "danger",
  //   "bug",
  //   "example",
  //   "quote",
  //   "warning",
  // ] as const;

   defineCase(`transforms !!! warning into div.admonition.admonition-warning`, {
      input: `[Modbus](https://en.wikipedia.org/wiki/Modbus) industrial protocol widely used in SCADA and automation systems.

This group of fields includes metadata extracted from Modbus TCP services.

!!! warning "Modbus Parser Notice"

    Some Modbus fields may be parsed incorrectly due to known issues. 
    We're aware of them and will release fixes in future versions.
    Sorry for the inconvenience.









dsadsadasd
ad
asd
asd
sad`,
      assertions(html) {
        const doc = parseDocument(html);
        const selector = `div.admonition.admonition-warning`;
        const div = selectOne(selector, doc);
        const divDom = cheerio.load(div).html();
        expect(divDom, `${selector} should be present`).not.toBeNull();
        expect(divDom).not.toContain(`!!! warning`);
        const title = selectOne("p.admonition-title", div);
        expect(title).not.toBeNull();
        expect(divDom).toContain(`Sorry for the inconvenience.`);
        expect(divDom).toContain(`Modbus Parser Notice`);
      },
    });
});



