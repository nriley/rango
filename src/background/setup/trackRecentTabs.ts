// Keep a register of the tabs for each window in order of recency, necessary
// for the command focusPreviousTab. We keep a register of all the tab ids for
// each window in order of recency. This is useful in case one or multiple tabs
// are removed.

import browser from "webextension-polyfill";
import { Mutex } from "async-mutex";
import { retrieve, store } from "../../common/storage";

const mutex = new Mutex();

async function updateRecentTab(
	windowId: number,
	tabId: number,
	remove: boolean
) {
	// It is possible that onActivated and onRemoved execute at the same time when
	// a tab is removed so we need to run a mutex to avoid both modifying
	// tabsByRecency at the same time
	await mutex.runExclusive(async () => {
		const tabsByRecency = await retrieve("tabsByRecency");

		const tabsIds = tabsByRecency[windowId] ?? [];
		const index = tabsIds.indexOf(tabId);

		if (index !== -1) {
			tabsIds.splice(index, 1);
		}

		if (!remove) {
			tabsIds.push(tabId);
		}

		tabsByRecency[windowId] = tabsIds;

		await store("tabsByRecency", tabsByRecency);
	});
}

export async function trackRecentTabs() {
	browser.tabs.onActivated.addListener(async (activeInfo) => {
		await updateRecentTab(activeInfo.windowId, activeInfo.tabId, false);
	});

	browser.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
		await updateRecentTab(removeInfo.windowId, tabId, true);
	});
}
