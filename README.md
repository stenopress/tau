# Tau

Tau is a standalone template language and HTML renderer for Deno. It renders
templates against a context object, supports reusable components and includes,
and exposes a small set of built-in filters.

Tau is the template engine extracted from
[Steno](https://github.com/stenopress/steno). It has no runtime dependencies.

## Install

Add Tau to a Deno project with:

```sh
deno add jsr:@steno/tau
```

Then import the public API from JSR:

```ts
import { render } from "jsr:@steno/tau";
```

## Quick start

`render` returns the generated HTML as a string:

```ts
import { render } from "jsr:@steno/tau";

const html = await render({
  template: `
    <article>
      <h1>{title}</h1>
      {#if posts.length}
        <ul>
          {#each posts as post}
            <li><a href="{post.url}">{post.title}</a></li>
          {/each}
        </ul>
      {:else}
        <p>No posts yet.</p>
      {/if}
    </article>
  `,
  context: {
    title: "A Tau page",
    posts: [{ title: "First post", url: "/posts/first" }],
  },
  components: {},
});

console.log(html);
```

Expressions in `{...}` are HTML-escaped. Use `{@html ...}` only when the value
is trusted HTML that should not be escaped.

## Template syntax

### Expressions

Use values from the render context:

```tau
<h1>{title}</h1>
<p>{author.name}</p>
<p>{summary | truncate(160)}</p>
```

Tau expressions support literals, property access, optional property access,
function calls, arithmetic and comparison operators, logical operators, and
conditional expressions. Expressions run in a restricted language subset rather
than as unrestricted template JavaScript.

### Conditions and loops

```tau
{#if user}
  <p>Welcome, {user.name}.</p>
{:else}
  <p>Please sign in.</p>
{/if}

{#each items as item, index}
  <p>{index}: {item}</p>
{:else}
  <p>No items.</p>
{/each}
```

Use `let` for a local value that is reused later in the same block:

```tau
{#let displayName = user.name}
  <span>{displayName}</span>
{/let}
```

### Components and slots

Components are named template strings passed in the `components` map. Component
names start with an uppercase letter:

```ts
const html = await render({
  template: `<Card title={title}>Read the docs.</Card>`,
  context: { title: "Tau" },
  components: {
    Card: `
      <section class="card">
        <h2>{title}</h2>
        <div>{@children}</div>
      </section>
    `,
  },
});
```

Pass named content with slots:

```tau
<Panel>
  {#slot header}<h2>{title}</h2>{/slot}
  <p>Panel content.</p>
</Panel>
```

The component can render the named slot with `{@slot header}`. Component props
are available as context values, and shared `globals`, `site`, and `theme`
values are preserved while rendering nested components.

### Includes

Includes are resolved by a function supplied by the host application:

```ts
const html = await render({
  template: `<main>{@include "partials/footer.tau"}</main>`,
  context: { year: 2026 },
  components: {},
  includeResolver: (path) => {
    if (path === "partials/footer.tau") {
      return `<footer>Copyright {year}</footer>`;
    }
    throw new Error(`Unknown include: ${path}`);
  },
});
```

Include paths must be relative. Tau rejects absolute paths, parent-directory
traversal, control characters, and URL-like paths.

### Built-in filters

Tau includes these filters:

| Filter          | Example                                 |
| --------------- | --------------------------------------- |
| `date`          | `{publishedAt \| date}`                 |
| `truncate`      | `{summary \| truncate(160)}`            |
| `upper`         | `{name \| upper}`                       |
| `lower`         | `{name \| lower}`                       |
| `slugify`       | `{title \| slugify}`                    |
| `pluralize`     | `{count \| pluralize("item", "items")}` |
| `number_format` | `{total \| number_format("en-US", 2)}`  |
| `url`           | `{href \| url}`                         |

The `url` filter permits HTTP, HTTPS, `mailto`, `tel`, relative, and fragment
URLs. It rejects unsafe schemes and control characters.

Register filters for one render with `filters`:

```ts
const html = await render({
  template: `<p>{value | shout}</p>`,
  context: { value: "hello" },
  components: {},
  filters: {
    shout: (value) => `${String(value).toUpperCase()}!`,
  },
});
```

Supplying `filters` replaces the default registry for that render. Spread the
exported `filters` object first when you want to keep the built-ins:

```ts
import { filters, render } from "jsr:@steno/tau";

await render({
  template: `{name | upper} {value | shout}`,
  context: { name: "Tau", value: "hello" },
  components: {},
  filters: {
    ...filters,
    shout: (value) => `${String(value).toUpperCase()}!`,
  },
});
```

Functions can also be supplied through the `functions` option. They are
available as expression calls and take precedence over filters with the same
name.

## Safety and limits

Tau enforces limits for each render:

- component and include depth
- total loop iterations
- rendered output size
- input template size

Override them with the `limits` option:

```ts
await render({
  template,
  context,
  components,
  limits: {
    maxDepth: 32,
    maxIterations: 10_000,
    maxOutputBytes: 4 * 1024 * 1024,
    maxTemplateBytes: 512 * 1024,
  },
});
```

The renderer detects component and include cycles, reports structured
`TauError` values, and includes source locations when `filePath` is provided.
Use `formatTauError` when presenting a Tau error in a CLI:

```ts
import { formatTauError, TauError } from "jsr:@steno/tau";

try {
  // Render a template.
} catch (error) {
  if (error instanceof TauError) {
    console.error(formatTauError(error));
  }
  throw error;
}
```

## API

The root export provides:

- `render(options, defaultFilters?)`
- `compileToFunction(template, filePath?)`
- `escapeHtml(value)`
- `filters`
- `getTauCacheStats()`
- `clearTauCache()`
- `TauError` and `formatTauError`
- the related TypeScript types

The parser and expression modules are also available through the package
subpaths:

```ts
import { TauParser } from "jsr:@steno/tau/parser";
import { compileExpression } from "jsr:@steno/tau/expression";
```

`compileToFunction` is useful when a host needs to compile a template directly.
Use `render` for normal rendering so Tau can create the bounded, per-render
helper state that enforces limits and carries filters through components and
includes.

## Development

This repository uses Deno. Run the complete local check with:

```sh
deno task check
```

The check runs formatting, type checking, documentation linting, linting, and
tests. To run only the tests:

```sh
deno task test
```

To verify the package contents without publishing:

```sh
deno publish --dry-run
```

Markdown parsing is provided by `@steno/core`, not by standalone Tau. The
`markdown_inline` filter is intentionally not part of Tau's default filter
registry.

## License

Tau is available under the [MIT License](./LICENSE.txt).
