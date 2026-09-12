import { registerTauTests } from "../src/tau_test.ts";
import { registerTauCacheTests } from "../src/tau_cache_test.ts";
import { registerTauConformanceTests } from "../src/tau_conformance_test.ts";
import { registerTauFuzzTests } from "../src/tau_fuzz_test.ts";

registerTauTests();
registerTauCacheTests();
registerTauConformanceTests();
registerTauFuzzTests();
