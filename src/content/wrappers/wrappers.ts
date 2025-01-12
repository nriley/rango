import { ElementWrapper } from "../../typings/ElementWrapper";
import { deepGetElements } from "../utils/deepGetElements";

const wrappersAll: Map<Element, ElementWrapper> = new Map();
const wrappersHinted: Map<string, ElementWrapper> = new Map();

export function getAllWrappers() {
	return [...wrappersAll.values()];
}

export function getHintedWrappers() {
	return [...wrappersHinted.values()];
}

// These methods adds the target and all of its descendants if they were
// already created
export function addWrapper(wrapper: ElementWrapper) {
	wrappersAll.set(wrapper.element, wrapper);
}

export function getWrapper(key: Element | string): ElementWrapper | undefined;
export function getWrapper(key: string[]): ElementWrapper[];
export function getWrapper(
	key: Element | string | string[]
): ElementWrapper | ElementWrapper[] | undefined {
	let result: ElementWrapper | ElementWrapper[] | undefined;

	if (key instanceof Element) {
		result = wrappersAll.get(key);
	}

	if (typeof key === "string") {
		result = wrappersHinted.get(key);
	}

	if (Array.isArray(key)) {
		result = [];
		for (const string of key) {
			if (wrappersHinted.has(string)) {
				result.push(wrappersHinted.get(string)!);
			}
		}
	}

	return result;
}

// This is more performant than getWrapper
export function getWrapperForElement(element: Element) {
	return wrappersAll.get(element);
}

export function getWrappersBySelector(selector: string) {
	const elements = deepGetElements(document.body, false, selector);

	return elements.map((element) => getWrapper(element));
}

export function getWrappersWithin(element: Element): ElementWrapper[] {
	const result: ElementWrapper[] = [];

	for (const wrapper of wrappersAll.values()) {
		if (element.contains(wrapper.element)) {
			result.push(wrapper);
		}
	}

	return result;
}

export function setHintedWrapper(hint: string, element: Element) {
	const wrapper = getWrapper(element);
	if (wrapper) wrappersHinted.set(hint, wrapper);
}

export function clearHintedWrapper(hint: string) {
	wrappersHinted.delete(hint);
}

export function reclaimHints(amount?: number) {
	const reclaimed = [];

	for (const [hintString, wrapper] of wrappersHinted.entries()) {
		if (!wrapper.isIntersectingViewport) {
			wrapper.unobserveIntersection();
			wrapper.hint?.release(false);
			reclaimed.push(hintString);
			if (amount && reclaimed.length >= amount) return reclaimed;
		}
	}

	return reclaimed;
}

export function deleteWrapper(target: Element) {
	const elements = deepGetElements(target);
	for (const element of elements) {
		const wrapper = wrappersAll.get(element);

		if (wrapper?.hint?.string) wrappersHinted.delete(wrapper.hint.string);

		wrapper?.remove();

		wrappersAll.delete(element);
	}
}

export function clearWrappersAll() {
	for (const wrapper of wrappersAll.values()) {
		wrapper?.remove();
	}

	wrappersAll.clear();
	wrappersHinted.clear();
}
