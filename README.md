# Tau

`@steno/tau` is the standalone Tau template language and renderer extracted from Steno.
It has no external runtime dependencies. Deno's standard assertions are used only in tests.

```ts
import { render } from "jsr:@steno/tau@0.1.0";

const html = await render({
  template: "<h1>{title}</h1>",
  context: { title: "Hello" },
  components: {},
});
```

The package preserves escaping, expressions, components, slots, includes, resource limits,
structured errors, and the bounded compiled-template cache. Custom `functions` and `filters`
can be supplied per render; they propagate into components and includes without being captured
in cached template functions. A supplied `filters` map replaces the default registry. Spread
`filters` from the package first if you want to retain built-ins.

Markdown parsing belongs to `@steno/core`. Steno's existing `markdown_inline` filter remains
available through Core and `@steno/steno`; standalone Tau intentionally does not include it.
The original Steno conformance suite continues to test that compatibility behavior.

## Development

```sh
deno task check
deno publish --dry-run --allow-dirty
```

The tests include the extracted parser, renderer, cache, adversarial, and conformance cases.
Source and error semantics should remain compatible with the Steno suite. Run Steno's tests and
performance budgets when changing the renderer, not just Tau's standalone tests.

Version `0.1.0` is prepared locally. The example import becomes usable after publication.
Publish Tau before Core; publishing this repository is a separate release action.
