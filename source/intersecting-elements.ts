import { IntersectingElement, ClickableType } from "./types";
import { displayHints } from "./hints";

export const intersectingElements: IntersectingElement[] = [];

// *** INTERSECTION OBSERVER ***
const options = {
	root: null,
	rootMargin: "0px",
	threshold: 0,
};

export const intersectionObserver = new IntersectionObserver((entries) => {
	for (const entry of entries) {
		if (entry.isIntersecting) {
			onIntersection(entry.target, true);
		} else {
			onIntersection(entry.target, false);
		}
	}

	displayHints(intersectingElements);
}, options);

// We observe all the initial elements before any mutation
if (document.readyState === "complete") {
	addIntersectingElement(document.body);
	displayHints(intersectingElements);
} else {
	window.addEventListener("load", () => {
		addIntersectingElement(document.body);
		displayHints(intersectingElements);
	});
}

// *** MUTATION OBSERVER ***

const config = { attributes: true, childList: true, subtree: true };
const mutationObserver = new MutationObserver((mutationList) => {
	for (const mutationRecord of mutationList) {
		if (mutationRecord.type === "childList") {
			for (const node of mutationRecord.addedNodes as NodeListOf<Node>) {
				if (
					node.nodeType === 1 &&
					!(node as Element).id.includes("rango-hints-container")
				) {
					addIntersectingElement(node as Element);
					displayHints(intersectingElements);
				}
			}
			// We don't care too much about removed nodes. I think it's going to be more expensive
			// to remove them from our list of our observed elements than to do nothing
		}

		if (mutationRecord.type === "attributes") {
			onAttributeMutation(mutationRecord.target as Element);
		}
	}
});

// We observe document instead of document.body in case the body gets replaced
mutationObserver.observe(document, config);

// This function is here mostly for debugging purposes
function getClickableType(element: Element): ClickableType {
	const clickableTags = ["BUTTON", "A", "INPUT", "SUMMARY"];
	const clickableRoles = ["button", "link", "treeitem", "tab"];
	const elementTag = element.tagName;
	const elementRole = element.getAttribute("role");

	if (clickableTags.includes(elementTag)) {
		return elementTag.toLowerCase() as ClickableType;
	}

	if (elementRole && clickableRoles.includes(elementRole)) {
		return elementRole as ClickableType;
	}

	if ((element as HTMLElement).onclick !== null) {
		return "onclick";
	}

	return undefined;
}

function isVisible(element: Element): boolean {
	const rect = element.getBoundingClientRect();
	return (
		window.getComputedStyle(element).visibility !== "hidden" &&
		window.getComputedStyle(element).display !== "none" &&
		Number.parseFloat(window.getComputedStyle(element).opacity) > 0.1 &&
		rect.width + rect.height > 10
	);
}

function hasTextNodesChildren(element: Element) {
	return [...element.childNodes].some(
		(node) => node.nodeType === 3 && /\S/.test(node.textContent!)
	);
}

function addIntersectingElement(element: Element) {
	const elementAndDescendants = [element, ...element.querySelectorAll("*")];
	for (const elementToAdd of elementAndDescendants) {
		const clickableType = getClickableType(elementToAdd);
		if (clickableType || hasTextNodesChildren(elementToAdd)) {
			intersectionObserver.observe(elementToAdd);
		}
	}
}

function getIntersectingElement(
	element: Element
): IntersectingElement | undefined {
	return intersectingElements.find(
		(IntersectingElement) => IntersectingElement.element === element
	);
}

function removeIntersectingElement(element: Element) {
	const intersectingElementIndex = intersectingElements.findIndex(
		(IntersectingElement) => IntersectingElement.element === element
	);
	if (intersectingElementIndex > -1) {
		intersectingElements.splice(intersectingElementIndex, 1);
	}
}

function onIntersection(element: Element, isIntersecting: boolean): void {
	if (isIntersecting) {
		intersectingElements.push({
			element,
			isVisible: isVisible(element),
			clickableType: getClickableType(element),
		});
	} else {
		removeIntersectingElement(element);
	}
}

function onAttributeMutation(element: Element) {
	const intersectingElement = getIntersectingElement(element);
	if (intersectingElement) {
		intersectingElement.isVisible = isVisible(element);
		intersectingElement.clickableType = getClickableType(element);
	}

	for (const descendant of element.querySelectorAll("*")) {
		const observedDescendantElement = getIntersectingElement(descendant);
		if (observedDescendantElement) {
			observedDescendantElement.isVisible = isVisible(descendant);
		}
	}
}

document.addEventListener("scroll", () => {
	displayHints(intersectingElements);
});

window.addEventListener("resize", () => {
	displayHints(intersectingElements);
});