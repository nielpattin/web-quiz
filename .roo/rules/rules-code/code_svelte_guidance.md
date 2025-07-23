# Svelte Development Guidance for Code Mode

When operating in `code` mode AND the current task involves writing or modifying `.svelte` files:

1. You MUST actively consult and adhere to the "Svelte 5 Migration Guide".
2. The content of this guide is already available in your pre-loaded custom instructions, sourced from the file [`v5-sveltekit-migration-guide.md`](.roo/rules/v5-sveltekit-migration-guide.md).
3. Prioritize Svelte 5 syntax and practices (e.g., runes like [`$state()`](#let--$state), [`$derived()`](#---derivedeffect), [`$props()`](#export-let--$props), new event handling, and snippets instead of slots) for all new Svelte code or when refactoring existing Svelte code, unless explicitly instructed to maintain Svelte 4 compatibility.
4. When migrating existing Svelte 4 code to Svelte 5, follow the migration patterns outlined in the guide:
   - Replace `let` declarations with `$state()` for reactive variables
   - Replace `$:` reactive statements with `$derived()` for derivations or `$effect()` for side effects
   - Replace `export let` with `$props()` destructuring
   - Update event handlers from `on:event` to `onevent` attributes
   - Convert slots to snippets where appropriate
5. Consider suggesting the use of the automatic migration script (`npx sv migrate svelte-5`) when appropriate for large-scale migrations.

## Code Quality Rules

6. **NEVER ADD USELESS COMMENTS, OR YOUR THINKING, OR YOUR THOUGHTS TO THE CODE.** Keep code clean.
   - Only use comments for .svelte for the UI components that are not self-explanatory so I know which component is which because they are all use tailwind classes.
   - For example, use comments like `<!-- This is a button component -->` to clarify
7. **When in Code mode don't use "any" type** - Always use proper TypeScript types for better type safety and code quality.
8. **Always use `import { page } from "$app/state"` not old `"$app/store"`** - Use the modern SvelteKit imports for page state management.
