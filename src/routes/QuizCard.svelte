<script lang="ts">
	let { isHeld } = $state({ isHeld: false });
	import { Star, ArrowUp, ArrowDown } from '@lucide/svelte';
	interface Answer {
		answer_text?: string;
		[key: string]: unknown;
	}

	interface Props {
		currentQuestion: any;
		current: number;
		quizData: any[];
		selectedAnswers: number[];
		questionLocked: boolean;
		checkAnswers: () => void;
		handleAnswerClick: (idx: number, questionType: string) => void;
		favorites: Set<string>;
		toggleFavorite: (idx: number) => void;
		answers: Answer[];
		originalIndices?: number[];
		goToPreviousCard: () => void;
		goToNextCard: () => void;
	}

	let {
		currentQuestion,
		current,
		quizData,
		selectedAnswers,
		questionLocked,
		checkAnswers,
		handleAnswerClick,
		answers,
		originalIndices,
		toggleFavorite,
		favorites,
		goToPreviousCard,
		goToNextCard
	}: Props = $props();

	// Use reactive favorite state from props, not store
	function isFavorited(id: string) {
		return favorites.has(id);
	}

	// Track scroll position and log when reaching edges only once per edge per scroll session
	let scrollContainer: HTMLDivElement | null = null;
	const edgeState = $state({
		topLogged: false,
		bottomLogged: false
	});
	const scrollState = $state<{ value: 'top' | 'middle' | 'bottom' }>({ value: 'top' });
	const isScrollable = $state({ value: false });

	function checkScrollable() {
		if (!scrollContainer) {
			isScrollable.value = false;
			return;
		}
		const { scrollHeight, clientHeight } = scrollContainer;
		isScrollable.value = scrollHeight > clientHeight + 1;
	}

	$effect(() => {
		if (!scrollContainer) return;

		const handleScroll = () => {
			const { scrollTop, scrollHeight, clientHeight } = scrollContainer as HTMLDivElement;
			const isAtTop = scrollTop === 0;
			const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

			if (isAtTop) {
				scrollState.value = 'top';
				if (!edgeState.topLogged) {
					console.log('Scrolled to top of QuizCard');
					edgeState.topLogged = true;
				}
			} else if (isAtBottom) {
				scrollState.value = 'bottom';
				if (!edgeState.bottomLogged) {
					console.log('Scrolled to bottom of QuizCard');
					edgeState.bottomLogged = true;
				}
			} else {
				scrollState.value = 'middle';
				edgeState.topLogged = false;
				edgeState.bottomLogged = false;
			}
		};

		const handleResize = () => {
			checkScrollable();
		};

		(scrollContainer as HTMLDivElement).addEventListener('scroll', handleScroll);
		window.addEventListener('resize', handleResize);

		$effect(() => {
			checkScrollable();
		});

		return () => {
			const container = scrollContainer as HTMLDivElement;
			container.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleResize);
		};
	});
	let touchStartY = 0;
	let touchEndY = 0;

	function handleTouchStart(e: TouchEvent) {
		touchStartY = e.touches[0].clientY;
	}

	function handleTouchEnd(e: TouchEvent) {
		touchEndY = e.changedTouches[0].clientY;
		const deltaY = touchEndY - touchStartY;
		if (Math.abs(deltaY) > 40) {
			if (deltaY < 0) {
				goToNextCard();
			} else {
				goToPreviousCard();
			}
		}
	}
</script>

<!-- Quiz Card -->
<div
	bind:this={scrollContainer}
	class="quiz-card main-scrollbar bg-[#29273F] text-[#CECDE0] rounded-2xl shadow-lg w-[95vw] h-[95%] md:w-[90%] md:h-[500px] px-4 pt-6 relative flex flex-col gap-2 touch-pan-y overflow-y-auto scrollbar-thin scrollbar-thumb-[#8582B0] scrollbar-track-[#29273F]"
	style="transform: translateY(0px); transition: none;"
	onmousedown={() => (isHeld = true)}
	onmouseup={() => (isHeld = false)}
	onmouseleave={() => (isHeld = false)}
	ontouchstart={() => (isHeld = true)}
	ontouchend={() => (isHeld = false)}
	role="button"
	tabindex="0"
>
	<!-- Question number and Favorite Button row -->
	<div class="flex items-center justify-between mb-2">
		<span class="text-[#8582B0] text-base flex items-center gap-3">
			{#if quizData.length}
				Question {current + 1} / {quizData.length}
				{#if currentQuestion?.module}
					<span
						class="inline-block px-2 py-0.5 rounded bg-[#35325A] text-[#C294FF] text-xs font-medium border border-[#C294FF] ml-2"
					>
						Module: {currentQuestion.module}
					</span>
				{/if}
				{#if currentQuestion?.question_id}
					<span
						class="inline-block px-2 py-0.5 rounded bg-[#35325A] text-[#FFD700] text-xs font-medium border border-[#FFD700] ml-2"
					>
						ID: {currentQuestion.question_id}
					</span>
				{/if}
			{/if}
		</span>
		<!-- This is the favorite button -->
		<button
			aria-label="Toggle favorite"
			class="cursor-pointer w-10 h-10 bg-transparent border-none p-0 flex items-center justify-center"
			onclick={() => toggleFavorite(current)}
		>
			{#if isFavorited(currentQuestion?.question_id)}
				<Star fill="#FFD700" color="#FFD700" size={32} />
			{:else}
				<Star color="#CECDE0" size={32} />
			{/if}
		</button>
	</div>
	<!-- Question Text -->
	<div class="question-row font-semibold text-lg mb-4">
		{#if currentQuestion}
			{currentQuestion.question_text || currentQuestion.question || ''}
		{:else}
			{quizData.length === 0 ? 'Please select a module to begin.' : ''}
		{/if}
	</div>
	<!-- Answers List -->
	<div class="answers-row flex flex-col gap-4 mb-4">
		{#if currentQuestion}
			{#each answers as ans, idx}
				<button
					type="button"
					class="answer px-5 py-3 rounded-lg border-2 border-[#33314E] bg-[#302E4A] text-lg text-[#CECDE0] cursor-pointer transition-colors text-left
					       {selectedAnswers.includes(idx) ? 'border-[#C294FF]' : ''}
					       {questionLocked && currentQuestion.answers[originalIndices?.[idx] ?? idx]?.is_correct
						? 'border-green-400 text-green-300'
						: ''}
					       {questionLocked &&
					selectedAnswers.includes(idx) &&
					!currentQuestion.answers[originalIndices?.[idx] ?? idx]?.is_correct
						? 'border-[#FF4747] text-[#FF4747]'
						: ''}"
					onclick={() => handleAnswerClick(idx, currentQuestion.question_type)}
					aria-pressed={selectedAnswers.includes(idx)}
					aria-label={'Answer ' + (idx + 1)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ')
							handleAnswerClick(idx, currentQuestion.question_type);
					}}
				>
					{ans.answer_text || ans}
				</button>
			{/each}
		{/if}
	</div>
	<!-- Check Button -->
	<div class="flex justify-center w-full">
		<button
			id="check-btn"
			class="mt-2 mb-6 px-6 py-3 rounded-lg bg-[#C294FF] text-[#1D1B2C] font-semibold text-lg"
			onclick={checkAnswers}
			style="display: {selectedAnswers.length > 0 && !questionLocked ? 'block' : 'none'}"
		>
			Check
		</button>
	</div>
	<!-- Upward Arrow Icon (absolute, sibling to card content) -->
</div>
{#if isScrollable.value}
	<button
		type="button"
		class="fixed bottom-28 left-1/2 -translate-x-1/2 z-10 w-16 h-16 flex items-center justify-center rounded-full bg-[#29273F] border-2 border-[#C294FF] shadow-lg transition-opacity duration-200"
		aria-label="Go to previous card"
		class:opacity-0={scrollState.value !== 'top' || isHeld}
		class:pointer-events-none={scrollState.value !== 'top'}
		onclick={goToPreviousCard}
	>
		<ArrowUp class="w-8 h-8 text-[#C294FF]" />
	</button>
	<button
		type="button"
		class="fixed bottom-28 left-1/2 -translate-x-1/2 z-10 w-16 h-16 flex items-center justify-center rounded-full bg-[#29273F] border-2 border-[#C294FF] shadow-lg transition-opacity duration-200"
		aria-label="Go to next card"
		class:opacity-0={scrollState.value !== 'bottom' || isHeld}
		class:pointer-events-none={scrollState.value !== 'bottom'}
		onclick={goToNextCard}
	>
		<ArrowDown class="w-8 h-8 text-[#C294FF]" />
	</button>
{:else}
	<!-- Swipe gesture logic for card change when not scrollable -->
	<div
		class="absolute inset-0 z-10"
		ontouchstart={handleTouchStart}
		ontouchend={handleTouchEnd}
		style="background: transparent;"
	></div>
{/if}
