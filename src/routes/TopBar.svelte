<script lang="ts">
	import { uiState, appState, pageState } from './global.svelte';
	import { modules } from '../lib/modules';

	interface Props {
		// TopBar component for module selection and favorites
		setModuleId: (id: string) => void;
		showFavorites: () => void;
		onBackToAll: () => void;
		onClearFavorites: () => void;
	}

	let { setModuleId, showFavorites, onBackToAll, onClearFavorites }: Props = $props();

	let selectEl = $state<HTMLSelectElement | null>(null);

	function handleSelectMousedown(e: MouseEvent) {
		if (document.activeElement === selectEl) {
			e.preventDefault();
			selectEl?.blur();
		}
	}

	function handleFavoritesClick() {
		showFavorites();
	}
	function handleBackClick() {
		onBackToAll && onBackToAll();
	}
	function handleClearFavorites() {
		onClearFavorites && onClearFavorites();
	}

	// Override a/d keys on select to always trigger navigation
	function handleSelectKeydown(e: KeyboardEvent) {
		if (e.key === 'a' || e.key === 'A') {
			e.preventDefault();
			const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
			document.activeElement && (document.activeElement as HTMLElement).blur();
			window.dispatchEvent(event);
		}
		if (e.key === 'd' || e.key === 'D') {
			e.preventDefault();
			const event = new KeyboardEvent('keydown', { key: 'd', bubbles: true });
			document.activeElement && (document.activeElement as HTMLElement).blur();
			window.dispatchEvent(event);
		}
	}
</script>

<!-- Top Bar -->
<div
	class="top-bar flex flex-row items-center justify-center py-4 flex-shrink-0 flex-wrap bg-[#29273F]"
>
	<!-- Hamburger button for mobile sidebar toggle -->
	{#if typeof window !== 'undefined' && window.innerWidth < 768 && !uiState.sidebarOpen}
		<button
			class="hamburger-btn mr-4 bg-[#C294FF] rounded-lg p-2"
			aria-label="Open sidebar"
			onclick={() => (uiState.sidebarOpen = true)}
		>
			<span class="block w-6 h-[3px] bg-[#222] my-1"></span>
			<span class="block w-6 h-[3px] bg-[#222] my-1"></span>
			<span class="block w-6 h-[3px] bg-[#222] my-1"></span>
		</button>
	{/if}
	<!-- Module Selector always visible -->
	<select
		bind:value={pageState.moduleId}
		bind:this={selectEl}
		onmousedown={handleSelectMousedown}
		oninput={(e) => {
			setModuleId((e.target as HTMLSelectElement).value);
			setTimeout(() => selectEl?.blur(), 0);
		}}
		class="cursor-pointer rounded-md px-3 py-2 bg-[#29273F] text-[#CECDE0] border border-[#33314E] mr-2 ml-0 md:ml-0 focus:outline-none focus:ring-0"
		onkeydown={handleSelectKeydown}
	>
		{#each modules as mod}
			<option value={mod.value}>{mod.label}</option>
		{/each}
	</select>
	{#if appState.currentView === 'all'}
		<!-- Favorites Button -->
		<button
			id="favorites-btn"
			class="cursor-pointer ml-3 rounded-md px-3 py-2 bg-[#C294FF] text-[#1D1B2C] font-semibold"
			onclick={handleFavoritesClick}
		>
			Favorites
		</button>
	{/if}
	{#if appState.currentView === 'favorites'}
		<!-- Back to All Button -->
		<button
			id="back-to-all-btn"
			class="cursor-pointer ml-3 rounded-md px-3 py-2 bg-[#C294FF] text-[#1D1B2C] font-semibold"
			onclick={handleBackClick}
		>
			Back to All
		</button>
		<!-- Clear Favorites Button -->
		<button
			id="clear-favorites-btn"
			class="cursor-pointer ml-3 rounded-md px-3 py-2 bg-[#C294FF] text-[#1D1B2C] font-semibold mt-2 md:mt-0"
			onclick={handleClearFavorites}
		>
			Clear Favorites
		</button>
	{/if}
</div>
