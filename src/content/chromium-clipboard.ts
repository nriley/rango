const copyPasteArea = document.createElement("textarea");
copyPasteArea.id = "rango-copy-paste-area";
copyPasteArea.tabIndex = -1;
// We need to disable the textarea to avoid anything we type to go into the textarea,
// which would leak into or copied text and break JSON.parse
copyPasteArea.disabled = true;
copyPasteArea.style.position = "fixed";
copyPasteArea.style.left = "0";
copyPasteArea.style.top = "0";
copyPasteArea.style.opacity = "0";
document.body.append(copyPasteArea);

export function getChromiumClipboard(): string {
	let result = "";
	copyPasteArea.disabled = false;
	copyPasteArea.focus({ preventScroll: true });
	if (document.execCommand("paste")) {
		result = copyPasteArea.value;
	}

	copyPasteArea.value = "";
	copyPasteArea.disabled = true;
	return result;
}

export function copyToChromiumClipboard(text: string) {
	copyPasteArea.disabled = false;
	copyPasteArea.value = text;
	copyPasteArea.select();
	document.execCommand("copy");
	copyPasteArea.value = "";
	copyPasteArea.disabled = true;
}