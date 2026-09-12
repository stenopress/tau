import { assertEquals, assertRejects } from "@std/assert";
import { filters, render, TauError } from "../mod.ts";

Deno.test("host filter defaults stay isolated and explicit options take precedence", async () => {
  const options = Object.freeze({
    template: "<Card />",
    context: {},
    components: { Card: "{value | label}" },
  });
  assertEquals(
    await Promise.all([
      render(options, { label: () => "first" }),
      render(options, { label: () => "second" }),
    ]),
    ["first", "second"],
  );
  assertEquals(
    await render(
      { ...options, filters: { label: () => "explicit" } },
      {
        label: () => "default",
      },
    ),
    "explicit",
  );
  await assertRejects(() => render(options), TauError, 'Unknown Tau filter "label"');
});

Deno.test("filter registries remain scoped through cached components and includes", async () => {
  const options = {
    template: `<Card />{@include "footer"}`,
    context: {},
    components: { Card: `{value | label}` },
    includeResolver: () => `{value | label}`,
  };
  const results = await Promise.all(
    ["first", "second"].map((label) =>
      render({ ...options, filters: { label: async () => await Promise.resolve(label) } }),
    ),
  );
  assertEquals(results, ["firstfirst", "secondsecond"]);
  await assertRejects(() => render(options), TauError, 'Unknown Tau filter "label"');
  assertEquals(Object.hasOwn(filters, "label"), false);
  assertEquals(Object.hasOwn(filters, "markdown_inline"), false);
});
