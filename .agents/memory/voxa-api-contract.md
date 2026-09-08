---
name: VOXA API contract
description: Compatibility guidance for the generated CMS API client and mock backend.
---

The workspace's generated Zod output is consumed with Zod 3, while some OpenAPI formats can make Orval emit Zod 4-only helpers. Keep request and response schemas on the shared runtime's supported primitives unless the workspace Zod catalog is upgraded deliberately.

**Why:** Code generation can succeed while the chained workspace typecheck fails on generated helpers that are not present in the installed Zod version.

**How to apply:** After changing `lib/api-spec/openapi.yaml`, run codegen and the library typecheck before wiring new routes or frontend hooks.