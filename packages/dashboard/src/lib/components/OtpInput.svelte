<script lang="ts">
	interface Props {
		length?: number;
		value?: string;
		disabled?: boolean;
		onComplete?: (code: string) => void;
		onChange?: (code: string) => void;
	}

	let {
		length = 6,
		value = $bindable(''),
		disabled = false,
		onComplete,
		onChange
	}: Props = $props();

	let inputs: HTMLInputElement[] = $state([]);
	let digits: string[] = $state(Array(length).fill(''));

	// Sync external value with internal digits
	$effect(() => {
		if (value) {
			const chars = value.split('').slice(0, length);
			digits = [...chars, ...Array(length - chars.length).fill('')];
		}
	});

	// Update value when digits change
	$effect(() => {
		const newValue = digits.join('');
		if (newValue !== value) {
			value = newValue;
			onChange?.(newValue);

			if (newValue.length === length && !newValue.includes('')) {
				onComplete?.(newValue);
			}
		}
	});

	function handleInput(index: number, event: Event) {
		const input = event.target as HTMLInputElement;
		const inputValue = input.value;

		// Only allow digits
		const digit = inputValue.replace(/\D/g, '').slice(-1);
		digits[index] = digit;
		digits = [...digits]; // Trigger reactivity

		// Auto-focus next input
		if (digit && index < length - 1) {
			inputs[index + 1]?.focus();
		}
	}

	function handleKeydown(index: number, event: KeyboardEvent) {
		const key = event.key;

		if (key === 'Backspace') {
			event.preventDefault();
			if (digits[index]) {
				digits[index] = '';
				digits = [...digits];
			} else if (index > 0) {
				inputs[index - 1]?.focus();
				digits[index - 1] = '';
				digits = [...digits];
			}
		} else if (key === 'ArrowLeft' && index > 0) {
			event.preventDefault();
			inputs[index - 1]?.focus();
		} else if (key === 'ArrowRight' && index < length - 1) {
			event.preventDefault();
			inputs[index + 1]?.focus();
		} else if (key === 'Delete') {
			event.preventDefault();
			digits[index] = '';
			digits = [...digits];
		}
	}

	function handlePaste(event: ClipboardEvent) {
		event.preventDefault();
		const pastedData = event.clipboardData?.getData('text') || '';
		const pastedDigits = pastedData.replace(/\D/g, '').slice(0, length).split('');

		digits = [...pastedDigits, ...Array(length - pastedDigits.length).fill('')];

		// Focus the next empty input or the last one
		const nextEmptyIndex = digits.findIndex((d) => !d);
		const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
		inputs[focusIndex]?.focus();
	}

	function handleFocus(event: FocusEvent) {
		(event.target as HTMLInputElement).select();
	}

	export function focus() {
		inputs[0]?.focus();
	}

	export function clear() {
		digits = Array(length).fill('');
		value = '';
		inputs[0]?.focus();
	}
</script>

<div class="otp-container" role="group" aria-label="One-time password input">
	{#each Array.from({ length }, (_, i) => i) as index (index)}
		<input
			bind:this={inputs[index]}
			type="text"
			inputmode="numeric"
			autocomplete="one-time-code"
			maxlength="1"
			class="otp-input"
			class:filled={digits[index]}
			class:disabled
			value={digits[index]}
			oninput={(e) => handleInput(index, e)}
			onkeydown={(e) => handleKeydown(index, e)}
			onpaste={handlePaste}
			onfocus={handleFocus}
			{disabled}
			aria-label={`Digit ${index + 1} of ${length}`}
		/>
	{/each}
</div>

<style>
	.otp-container {
		display: flex;
		gap: 8px;
		justify-content: center;
	}

	.otp-input {
		width: 48px;
		height: 56px;
		text-align: center;
		font-size: 24px;
		font-weight: 600;
		border: 2px solid #e5e7eb;
		border-radius: 12px;
		background: #f9fafb;
		color: #1a1a1a;
		transition: all 0.15s ease;
		caret-color: var(--color-primary);
	}

	.otp-input:focus {
		outline: none;
		border-color: var(--color-primary);
		background: #fff;
		box-shadow: 0 0 0 3px rgba(223, 110, 29, 0.1);
	}

	.otp-input.filled {
		border-color: var(--color-primary);
		background: #fff;
	}

	.otp-input.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.otp-input::placeholder {
		color: #d1d5db;
	}

	/* Hide spin buttons for number input */
	.otp-input::-webkit-outer-spin-button,
	.otp-input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	@media (max-width: 400px) {
		.otp-container {
			gap: 6px;
		}

		.otp-input {
			width: 42px;
			height: 50px;
			font-size: 20px;
		}
	}
</style>
