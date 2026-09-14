import { assertEquals } from "@std/assert";

Deno.test("public api: Tau export contract is intentional", async () => {
  const manifest = JSON.parse(
    await Deno.readTextFile(new URL("../deno.json", import.meta.url)),
  ) as { exports: Record<string, string> };
  const contracts: Record<string, string[]> = {
    ".": [
      "CompiledTemplateFn",
      "FilterFunction",
      "TauCacheStats",
      "TauError",
      "TauErrorCode",
      "TauErrorLocation",
      "TauHelpers",
      "TauLimits",
      "TauOptions",
      "clearTauCache",
      "compileToFunction",
      "escapeHtml",
      "filters",
      "formatTauError",
      "getTauCacheStats",
      "render",
    ],
    "./expression": [
      "BLOCKED_EXPRESSION_NAMES",
      "TauExprNode",
      "compileExpression",
      "parseTauExpression",
    ],
    "./parser": ["Node", "TauParser", "parseProps"],
  };

  assertEquals(Object.keys(manifest.exports).sort(), Object.keys(contracts).sort());

  for (const [entrypoint, expectedSymbols] of Object.entries(contracts)) {
    const modulePath = new URL(`../${manifest.exports[entrypoint].slice(2)}`, import.meta.url);
    const output = await new Deno.Command(Deno.execPath(), {
      args: ["doc", "--json", modulePath.href],
    }).output();

    assertEquals(output.success, true, entrypoint);

    const document = JSON.parse(new TextDecoder().decode(output.stdout)) as {
      nodes: Record<string, { symbols: { name: string }[] }>;
    };
    const module = Object.values(document.nodes)[0];
    assertEquals(module.symbols.map(({ name }) => name).sort(), expectedSymbols.sort(), entrypoint);
  }
});
