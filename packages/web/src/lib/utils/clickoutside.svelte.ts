import type { Action } from 'svelte/action';

/** Dispatch event on click outside of node */
export const clickOutside: Action<
	HTMLElement,
	undefined,
	{
		onclickoutside: (event: CustomEvent) => void;
	}
> = (node) => {
	$effect(() => {
		const handleClick = (event: any) => {
			if (node && !node.contains(event.target) && !event.defaultPrevented) {
				node.dispatchEvent(new CustomEvent('clickoutside'));
			}
		};

		document.addEventListener('click', handleClick, true);

		return () => {
			document.removeEventListener('click', handleClick, true);
		};
	});
};
