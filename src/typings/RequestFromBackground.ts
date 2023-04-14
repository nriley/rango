import { ToastOptions } from "react-toastify";
import { RangoAction } from "./RangoAction";
import { MarkHintsAsKeyboardReachable } from "./RequestFromContent";

interface UpdateHintsInTab {
	type: "updateHintsInTab";
	hints: string[];
}

interface ReclaimHints {
	type: "reclaimHints";
	amount: number;
}

interface DisplayToastNotification {
	type: "displayToastNotification";
	text: string;
	options?: ToastOptions;
}

interface UpdateNavigationToggle {
	type: "updateNavigationToggle";
	enable: boolean | undefined;
}

interface SimpleContentRequest {
	type:
		| "restoreKeyboardReachableHints"
		| "checkIfDocumentHasFocus"
		| "getHintStringsInUse";
}

export type RequestFromBackground =
	| RangoAction
	| SimpleContentRequest
	| UpdateHintsInTab
	| MarkHintsAsKeyboardReachable
	| ReclaimHints
	| DisplayToastNotification
	| UpdateNavigationToggle;