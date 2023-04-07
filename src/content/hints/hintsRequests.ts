import browser from "webextension-polyfill";
import { HintsStack } from "../../typings/StorageSchema";

export async function initStack() {
	return browser.runtime.sendMessage({
		type: "initStack",
	});
}

export async function claimHints(amount: number): Promise<string[]> {
	return browser.runtime.sendMessage({
		type: "claimHints",
		amount,
	}) as Promise<string[]>;
}

export async function reclaimHintsFromOtherFrames(amount: number) {
	return browser.runtime.sendMessage({
		type: "reclaimHintsFromOtherFrames",
		amount,
	}) as Promise<string[]>;
}

export async function releaseHints(hints: string[]) {
	return browser.runtime.sendMessage({
		type: "releaseHints",
		hints,
	});
}

export async function getHintsStackForTab() {
	return browser.runtime.sendMessage({
		type: "getHintsStackForTab",
	}) as Promise<HintsStack>;
}
