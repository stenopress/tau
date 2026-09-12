/** Standalone Tau template language and renderer, with no runtime dependencies. @module */
export {
  clearTauCache,
  compileToFunction,
  escapeHtml,
  filters,
  getTauCacheStats,
  render,
} from "./src/tau.ts";
export type {
  CompiledTemplateFn,
  FilterFunction,
  TauCacheStats,
  TauHelpers,
  TauLimits,
  TauOptions,
} from "./src/tau.ts";
export { formatTauError, TauError } from "./src/tau_error.ts";
export type { TauErrorCode, TauErrorLocation } from "./src/tau_error.ts";
