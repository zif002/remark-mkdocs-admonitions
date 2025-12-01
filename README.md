## remark-mkdocs-admonitions

**Remark plugin** that converts MkDocs-style `!!!` blocks into HTML admonitions, styled similarly to [Material for MkDocs admonitions](https://squidfunk.github.io/mkdocs-material/reference/admonitions/?h=admonition).

Supported types:

- `note`
- `info`
- `tip`
- `success`
- `question`
- `failure`
- `danger`
- `bug`
- `example`
- `quote`
- `warning`

Example Markdown:

```markdown
!!! warning "Difference between IP and domain-based searches in the `host` field"
    When scanning by IP address, Netlas scans [all available services](/knowledge-base/scanning-technology.md) on the target machine.
    In contrast, when scanning by domain name, only HTTP/HTTPS services on ports `80` and `443` are scanned.

    So if you query `host:example.com`, you will only get HTTP(S) responses.
    To retrieve all services hosted on the machine behind `example.com`, use its IP address instead.
```

The plugin transforms it into:

```html
<div class="admonition admonition-warning">
  When scanning by IP address, Netlas scans ...
  ...
</div>
```

### Installation

```bash
npm install remark-mkdocs-admonitions
# or
yarn add remark-mkdocs-admonitions
# or
pnpm add remark-mkdocs-admonitions
```

### Usage with `remark`

```ts
import { remark } from "remark";
import remarkParse from "remark-parse";
import remarkMkDocsAdmonitions from "remark-mkdocs-admonitions";

const md = `
!!! warning "Title"
    Content
`;

const file = await remark()
  .use(remarkParse)
  .use(remarkMkDocsAdmonitions)
  .process(md);

console.log(String(file));
```

### Styles

The repository includes `admonition.css` with simple styles inspired by Material for MkDocs:

```css
.admonition-warning {
  border-left-color: #ff9100;
  background-color: rgba(255, 145, 0, 0.1);
}
```

Import it from your bundle, for example:

```ts
import "remark-mkdocs-admonitions/admonition.css";
```

### Usage with `react-markdown`

```tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMkDocsAdmonitions from "remark-mkdocs-admonitions";

export function Markdown({ source }: { source: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMkDocsAdmonitions]}
      // important: allow HTML rendering
      skipHtml={false}
    >
      {source}
    </ReactMarkdown>
  );
}
```

### License

MIT

