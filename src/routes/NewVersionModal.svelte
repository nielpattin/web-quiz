<!-- This is the new version notification modal component -->
<script lang="ts">
	import { APP_VERSION } from '../lib/config';
	const show = $state(true);
	const { onReload } = $props<{ onReload: () => void }>();

	let oldVersion = $state<string | null>(null);
	const stage = $state({ value: 'info' as 'info' | 'changelog' });

	import { APP_VERSION_KEY } from '../lib/localKeys';

	$effect(() => {
		oldVersion = localStorage.getItem(APP_VERSION_KEY);
	});

	function handleReload() {
		onReload();
	}

	function handleChangelogs() {
		stage.value = 'changelog';
	}
</script>

{#if show}
	<div
		class="fixed inset-0 z-[900] bg-black/50 backdrop-opacity-60 flex items-center justify-center"
	>
		<div
			class="fav-id-modal bg-white p-6 rounded-xl w-[358px] shadow-xl border border-[#e0e0f0] text-[#23223a] flex flex-col gap-5"
		>
			<div class="text-2xl font-bold text-gray-900 text-center">New Version Available</div>
			<div class="text-center text-base text-gray-800">
				<span class="flex items-center justify-center gap-2">
					<span class="text-red-600">{oldVersion ?? 'Unknown'}</span>
					<span class="text-gray-500 text-lg">→</span>
					<span class="text-green-600">{APP_VERSION}</span>
				</span>
			</div>
			{#if stage.value === 'info'}
				<div class="text-gray-700 text-center">
					The app has been updated. Local data will be cleared after reload.<br />
					To copy your favorite IDs, click the star icon at the bottom right to open the favorites modal.
				</div>
				<div class="flex flex-col gap-3">
					<button
						type="button"
						class="cursor-pointer w-full py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors duration-200"
						onclick={handleChangelogs}
					>
						Changelogs
					</button>
				</div>
			{:else}
				<div class="text-gray-700 text-left bg-gray-50 rounded p-3 border border-gray-200">
					<div class="font-semibold mb-1">Latest Changes</div>
					<ul class="list-disc list-inside space-y-1 text-sm">
						<li>Improved navigation between quiz cards with swipe gestures on mobile</li>
						<li>Enhanced scroll detection for better user experience</li>
						<li>Added visual indicators button for card navigation</li>
					</ul>
				</div>
				<div class="flex flex-col gap-3">
					<button
						type="button"
						class="cursor-pointer w-full py-2 px-4 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200"
						onclick={handleReload}
					>
						Reload
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}
