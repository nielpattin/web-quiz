# MCP Tool Auto-Usage Rules

When the user mentions any of the following technologies or asks questions related to them, automatically use the corresponding MCP tool to fetch relevant documentation BEFORE providing your response:

## Context7 Documentation Access

### Frontend Framework

- **Svelte**: When user mentions "svelte", "components", "reactivity", "runes", "$state", "$derived", "$effect", "$props", or Svelte-specific concepts

  - Auto-use: `context7 /sveltejs/svelte`

- **SvelteKit**: When user mentions "sveltekit", "routing", "load functions", "forms", "pages", "layouts", "+page", "+layout", "hooks", or SvelteKit-specific features
  - Auto-use: `context7 /sveltejs/kit`

### Styling

- **Tailwind CSS**: When user mentions "tailwind", "css", "styling", "classes", "responsive design", or UI styling questions
  - Auto-use: `context7 /tailwindlabs/tailwindcss.com`

### Icons

- **Lucide Icons**: When user mentions "lucide", "lucide-svelte", "@lucide/svelte", "icons", or icon-related questions
  - Auto-use: `context7 /lucide-icons/lucide`

## Web Search

- **Tavily**: When user asks about current events, latest information, web searches, or anything requiring up-to-date information from the internet
  - Auto-use: `tavily-search` tool

## Usage Guidelines

1. **Automatic Triggering**: Use these tools proactively when detecting relevant keywords or context
2. **Multiple Tools**: If a question spans multiple technologies, use multiple relevant tools
3. **Prioritize Documentation**: Always check official docs first before providing generic advice
4. **Context Awareness**: Consider the current project context when determining relevance

## Quick Reference Commands

For manual usage, you can still use these shortcuts:

- `svelte docs` → Context7 Svelte
- `sveltekit docs` → Context7 SvelteKit
- `tailwind docs` → Context7 Tailwind CSS
- `search web [query]` → Tavily search
