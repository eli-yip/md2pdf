# list recipes
default:
    @just --list

# install deps and link the `md2pdf` command into ~/.bun/bin
install:
    @bun install
    @bun link > /dev/null 2>&1 && echo "✓ 已链接 md2pdf → ~/.bun/bin"

# typecheck + lint + format-check + dead-code (report-only; use fix-lint to apply)
lint:
    bun run biome check .
    bun run tsc --noEmit
    bun run knip

# autofix: format + safe & unsafe fixes
fix-lint:
    bun run biome check --fix --unsafe .
