<script lang="ts">
	import { DEBUG } from '$lib/config';
	let { isHeld } = $state({ isHeld: false });
	import { Star, ArrowUp, ArrowDown } from '@lucide/svelte';

	interface Answer {
		answer_text?: string;
		[key: string]: unknown;
	}

	interface CurrentQuestion {
		question_id?: string;
		module?: string;
		question_text?: string;
		question?: string;
		answers?: Array<{ is_correct: boolean }>;
		question_type: string;
	}

	interface Props {
		currentQuestion: CurrentQuestion;
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

	// Improved scroll detection function
	function checkScrollable() {
		if (!scrollContainer) {
			isScrollable.value = false;
			return;
		}
		const { scrollHeight, clientHeight } = scrollContainer;
		// Add small tolerance to account for subpixel rounding
		isScrollable.value = scrollHeight > clientHeight + 1;
	}

	// More reliable scroll detection using ResizeObserver
	let resizeObserver: ResizeObserver | null = null;

	$effect(() => {
		if (!scrollContainer) return;

		// Initial check after component mounts
		checkScrollable();

		// Set up ResizeObserver to detect content changes
		resizeObserver = new ResizeObserver(() => {
			checkScrollable();
		});

		resizeObserver.observe(scrollContainer);

		// Also check after a small delay to catch any late-rendering content
		const timer = setTimeout(() => {
			checkScrollable();
		}, 100);

		return () => {
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
			clearTimeout(timer);
		};
	});

	$effect(() => {
		if (!scrollContainer) return;

		const logCardLoad = () => {
			if (DEBUG) {
				console.log('QuizCard loaded', {
					questionId: currentQuestion?.question_id,
					isScrollable: isScrollable.value
				});
			}
		};

		const handleScroll = () => {
			const { scrollTop, scrollHeight, clientHeight } = scrollContainer as HTMLDivElement;
			const isAtTop = scrollTop === 0;
			const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

			if (isAtTop) {
				scrollState.value = 'top';
				edgeState.topLogged = true;
			} else if (isAtBottom) {
				scrollState.value = 'bottom';
				edgeState.bottomLogged = true;
			} else {
				scrollState.value = 'middle';
				edgeState.topLogged = false;
				edgeState.bottomLogged = false;
			}
		};

		// Only set up scroll listener if container is scrollable
		if (isScrollable.value) {
			(scrollContainer as HTMLDivElement).addEventListener('scroll', handleScroll);
		}

		// Log for all cards
		setTimeout(logCardLoad, 100);

		return () => {
			const container = scrollContainer as HTMLDivElement;
			container.removeEventListener('scroll', handleScroll);
		};
	});

	let touchStartY = 0;
	let touchEndY = 0;
	let touchStartTime = 0;

	function handleTouchStart(e: TouchEvent) {
		touchStartY = e.touches[0].clientY;
		touchStartTime = Date.now();
	}

	function handleTouchEnd(e: TouchEvent) {
		touchEndY = e.changedTouches[0].clientY;
		const deltaY = touchEndY - touchStartY;
		const deltaTime = Date.now() - touchStartTime;

		// Only trigger swipe if it's a significant vertical swipe (< 300ms and > 40px)
		if (Math.abs(deltaY) > 40 && deltaTime < 300) {
			if (deltaY < 0) {
				goToNextCard();
			} else {
				goToPreviousCard();
			}
		}
	}

	// Helper function for answer styling
	function getAnswerClass(idx: number): string {
		const isSelected = selectedAnswers.includes(idx);
		const originalIdx = originalIndices?.[idx] ?? idx;
		const isCorrect = currentQuestion?.answers?.[originalIdx]?.is_correct;

		let classes = '';
		if (isSelected) {
			classes += ' border-[#C294FF]';
		}

		if (questionLocked) {
			if (isCorrect) {
				classes += ' border-green-400 text-green-300';
			} else if (isSelected) {
				classes += ' border-[#FF4747] text-[#FF4747]';
			}
		}

		return classes;
	}
</script>

<!-- Quiz Card -->
<div
	bind:this={scrollContainer}
	class="quiz-card main-scrollbar bg-[#29273F] text-[#CECDE0] rounded-2xl shadow-lg w-[95vw] h-[95%] md:w-[90%] md:h-[500px] px-4 pt-6 relative flex flex-col gap-2 touch-pan-y overflow-y-auto scrollbar-thin scrollbar-thumb-[#8582B0] scrollbar-track-[#29273F]"
	style="transform: translateY(0px); transition: none;"
	onmousedown={() => {
		isHeld = true;
		if (DEBUG) {
			console.log('isHeld set to true (mousedown)');
		}
	}}
	onmouseup={() => {
		isHeld = false;
		if (DEBUG) {
			console.log('isHeld set to false (mouseup)');
		}
	}}
	onmouseleave={() => {
		isHeld = false;
		if (DEBUG) {
			console.log('isHeld set to false (mouseleave)');
		}
	}}
	ontouchstart={(e) => {
		isHeld = true;
		if (DEBUG) {
			console.log('isHeld set to true (touchstart)');
		}
		if (!isScrollable.value) handleTouchStart(e);
	}}
	ontouchend={(e) => {
		isHeld = false;
		if (DEBUG) {
			console.log('isHeld set to false (touchend)');
		}
		if (!isScrollable.value) handleTouchEnd(e);
	}}
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
			{#if isFavorited(currentQuestion?.question_id ?? '')}
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
					class="answer px-5 py-3 rounded-lg border-2 border-[#33314E] bg-[#302E4A] text-lg text-[#CECDE0] cursor-pointer transition-colors text-left {getAnswerClass(
						idx
					)}"
					disabled={questionLocked}
					onclick={() => {
						if (DEBUG) {
							console.log('[QuizCard] Answer button clicked', {
								idx,
								questionLocked,
								selectedAnswers,
								questionType: currentQuestion.question_type
							});
						}
						handleAnswerClick(idx, currentQuestion.question_type ?? 'single');
					}}
					aria-pressed={selectedAnswers.includes(idx)}
					aria-label={'Answer ' + (idx + 1)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							if (DEBUG) {
								console.log('[QuizCard] Answer button keydown', {
									idx,
									questionLocked,
									selectedAnswers,
									questionType: currentQuestion.question_type
								});
							}
							handleAnswerClick(idx, currentQuestion.question_type ?? 'single');
						}
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
			class="mt-2 mb-6 px-6 py-3 rounded-lg bg-[#C294FF] text-[#1D1B2C] font-semibold text-lg
                   {selectedAnswers.length > 0 && !questionLocked ? 'block' : 'hidden'}"
			onclick={checkAnswers}
		>
			Check
		</button>
	</div>
</div>

{#if isScrollable.value}
	<button
		type="button"
		class="fixed bottom-28 left-1/2 -translate-x-1/2 z-10 w-16 h-16 flex items-center justify-center rounded-full bg-[#29273F] border-2 border-[#C294FF] shadow-lg transition-opacity duration-200
              {scrollState.value === 'top' && !isHeld
			? 'opacity-100'
			: 'opacity-0 pointer-events-none'}"
		aria-label="Go to previous card"
		onclick={goToPreviousCard}
	>
		<ArrowUp class="w-8 h-8 text-[#C294FF]" />
	</button>
	<button
		type="button"
		class="fixed bottom-28 left-1/2 -translate-x-1/2 z-10 w-16 h-16 flex items-center justify-center rounded-full bg-[#29273F] border-2 border-[#C294FF] shadow-lg transition-opacity duration-200
							{scrollState.value === 'bottom' && isScrollable.value && current < quizData.length - 1 && !isHeld
			? 'opacity-100'
			: 'opacity-0 pointer-events-none'}"
		aria-label="Go to next card"
		onclick={goToNextCard}
	>
		<ArrowDown class="w-8 h-8 text-[#C294FF]" />
	</button>
{/if}
