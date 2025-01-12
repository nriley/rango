import { RangoActionWithTarget } from "../../typings/RangoAction";
import { assertDefined } from "../../typings/TypingUtils";
import { getWrapper } from "../wrappers/wrappers";
import { TalonAction } from "../../typings/RequestFromTalon";
import { clickElement } from "./clickElement";
import {
	copyElementTextContentToClipboard,
	copyLinkToClipboard,
	copyMarkdownLinkToClipboard,
} from "./copy";
import { scroll, snapScroll } from "./scroll";
import { hoverElement } from "./hoverElement";
import { openInBackgroundTab, openInNewTab } from "./openInNewTab";
import { showTitleAndHref } from "./showTitleAndHref";
import { includeOrExcludeExtraSelectors } from "./customHints";
import { insertToField } from "./insertToField";
import { setSelectionAfter, setSelectionBefore } from "./setSelection";
import { focusAndDeleteContents } from "./focusAndDeleteContents";
import { focus } from "./focus";

export async function runRangoActionWithTarget(
	request: RangoActionWithTarget
): Promise<string | TalonAction[] | undefined> {
	const hints =
		typeof request.target === "string" ? [request.target] : request.target;
	const wrappers = getWrapper(hints).filter(
		(wrapper) => wrapper.isIntersectingViewport
	);

	if (wrappers.length === 0) {
		// We don't need to worry about the number of hints said, if it was more
		// than one the action would have changed to "clickElement"
		return request.type === "directClickElement"
			? [{ name: "typeTargetCharacters" }]
			: undefined;
	}

	// Wrapper for scroll, if there's more than one target we take the first and ignore the rest
	const wrapper = wrappers[0];
	assertDefined(wrapper);

	switch (request.type) {
		case "clickElement":
		case "directClickElement":
			return clickElement(wrappers);

		case "focusElement":
			return focus(wrappers);

		case "showLink":
			showTitleAndHref(wrappers);
			break;

		case "openInNewTab":
			await openInNewTab(wrappers);
			break;

		case "openInBackgroundTab":
			await openInBackgroundTab(wrappers);
			break;

		case "hoverElement":
			await hoverElement(wrappers);
			break;

		case "copyLink":
			return copyLinkToClipboard(wrappers);

		case "copyMarkdownLink":
			return copyMarkdownLinkToClipboard(wrappers);

		case "copyElementTextContent":
			return copyElementTextContentToClipboard(wrappers);

		case "insertToField":
			insertToField(wrappers, request.arg);
			break;

		case "setSelectionBefore":
			setSelectionBefore(wrapper);
			break;

		case "setSelectionAfter":
			setSelectionAfter(wrapper);
			break;

		case "focusAndDeleteContents":
			return focusAndDeleteContents(wrapper);

		case "scrollUpAtElement":
			scroll({ dir: "up", target: wrapper, factor: request.arg });
			break;

		case "scrollDownAtElement":
			scroll({ dir: "down", target: wrapper, factor: request.arg });
			break;

		case "scrollLeftAtElement":
			scroll({ dir: "left", target: wrapper, factor: request.arg });
			break;

		case "scrollRightAtElement":
			scroll({ dir: "right", target: wrapper, factor: request.arg });
			break;

		case "scrollElementToTop":
			snapScroll("top", wrapper);
			break;

		case "scrollElementToBottom":
			snapScroll("bottom", wrapper);
			break;

		case "scrollElementToCenter":
			snapScroll("center", wrapper);
			break;

		case "includeExtraSelectors":
			includeOrExcludeExtraSelectors(wrappers, "include");
			break;

		case "excludeExtraSelectors":
			includeOrExcludeExtraSelectors(wrappers, "exclude");
			break;

		default:
			break;
	}

	return undefined;
}
