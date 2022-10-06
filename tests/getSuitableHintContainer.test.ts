import puppeteer from "puppeteer";
import { getFileUrlPath } from "./utils/getFileUrlPath";
import { launchBrowser } from "./utils/launchBrowser";

describe("The hints are placed in the appropriate DOM element", () => {
	let browser: puppeteer.Browser;
	let page: puppeteer.Page;

	beforeAll(async () => {
		({ browser, page } = await launchBrowser());
		await page.goto(getFileUrlPath("./test-pages/basic.html"));
	});

	afterAll(async () => {
		await browser.close();
	});

	test("The hint won't be placed in an element with overflow hidden and insufficient space", async () => {
		await page.evaluate(() => {
			document.body.innerHTML = `
				<div id="target">
					<div id="skip" style="overflow: hidden">
						<a href="#">Link</a>
					</div>
				</div>
			`;
		});

		await page.waitForSelector(".rango-hint");
		const $hint = await page.$("#target > .rango-hint-wrapper");
		const $noHint = await page.$("#skip > .rango-hint-wrapper");

		expect($hint).not.toBeNull();
		expect($noHint).toBeNull();
	});

	test("The hint will be placed in an element with overflow hidden but sufficient space", async () => {
		await page.evaluate(() => {
			document.body.innerHTML = `
					<div style="overflow: hidden; padding: 15px">
						<a href="#">Link</a>
					</div>
			`;
		});

		await page.waitForSelector(".rango-hint");
		const $hint = await page.$("div > .rango-hint-wrapper");

		expect($hint).not.toBeNull();
	});

	test("The hint for the summary element won't be placed inside the details element", async () => {
		await page.evaluate(() => {
			document.body.innerHTML = `
			<details>
				<summary>Details</summary>
				Something small enough to escape casual notice.
			</details>
		`;
		});

		await page.waitForSelector(".rango-hint");
		const $hint = await page.$("body > .rango-hint-wrapper");
		const $noHint = await page.$("details > .rango-hint-wrapper");

		expect($hint).not.toBeNull();
		expect($noHint).toBeNull();
	});

	test("The hint won't be placed beyond its scroll container", async () => {
		await page.evaluate(() => {
			document.body.innerHTML = `
				<ul style="height: 10px; overflow: auto">
					<li style="overflow: hidden; font-size: 20px">
						<a href="#">Link</a>
					</li>
				</ul>
		`;
		});

		await page.waitForSelector(".rango-hint");
		const $hint = await page.$("ul > .rango-hint-wrapper");

		expect($hint).not.toBeNull();
	});

	test("The hint won't be placed beyond a fixed or sticky container", async () => {
		await page.evaluate(() => {
			document.body.innerHTML = `
				<aside style="position: fixed; overflow: hidden">
					<div style="overflow: hidden">
						<a href="#">Link</a>
					</div>
				</aside>
			`;
		});

		await page.waitForSelector(".rango-hint");
		let $hint = await page.$("aside > .rango-hint-wrapper");

		expect($hint).not.toBeNull();

		await page.evaluate(() => {
			document.body.innerHTML = `
				<aside style="position: sticky; overflow: hidden">
					<div style="overflow: hidden">
						<a href="#">Link</a>
					</div>
				</aside>
			`;
		});

		await page.waitForSelector(".rango-hint");
		$hint = await page.$("aside > .rango-hint-wrapper");

		expect($hint).not.toBeNull();
	});
});
