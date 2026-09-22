---
name: Next.js compiler choice
description: Drive Flex's Next.js compiler compatibility with its existing Tailwind CSS imports
---

Drive Flex uses Next.js with the webpack compiler for development and production builds.

**Why:** The existing `tw-animate-css` style export compiled successfully with webpack but failed to resolve under Next Turbopack, which would block the preserved visual system.

**How to apply:** Keep `--webpack` in the Drive Flex `dev` and `build` scripts unless the stylesheet imports are deliberately migrated and verified under Turbopack.