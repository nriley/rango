import browser from "webextension-polyfill";
import { useEffect, useState } from "react";
import Color from "color";
import { defaultSettingsMutable, isValidSetting } from "../common/settings";
import { retrieveSettings, store } from "../common/storage";
import { StorageSchema } from "../typings/StorageSchema";
import { hasMatchingKeys } from "../lib/utils";
import { SettingsGroup } from "./SettingsGroup";
import { Toggle } from "./Toggle";
import { NumberInput } from "./NumberInput";
import { Radio, RadioGroup } from "./RadioGroup";
import { SettingRow } from "./SettingRow";
import { TextInput } from "./TextInput";
import { Option, Select } from "./Select";

export function SettingsComponent() {
	const [storedSettings, setStoredSettings] = useState(defaultSettingsMutable);
	const [settings, setSettings] = useState(defaultSettingsMutable);
	const [loading, setLoading] = useState(true);

	// Using useEffect so it only runs once
	useEffect(() => {
		void retrieveSettings().then((settings) => {
			setStoredSettings(settings);
			setSettings(settings);
			setLoading(false);
		});

		browser.storage.onChanged.addListener((changes) => {
			if (hasMatchingKeys(defaultSettingsMutable, changes)) {
				void retrieveSettings().then((settings) => {
					setStoredSettings(settings);
					setSettings(settings);
				});
			}
		});
	}, []);

	const handleChange = <T extends keyof StorageSchema>(
		key: T,
		value: StorageSchema[T]
	) => {
		setSettings((previousSettings) => ({ ...previousSettings, [key]: value }));

		if (isValidSetting(key, value)) {
			setStoredSettings((previousSettings) => ({
				...previousSettings,
				[key]: value,
			}));

			void store(key, value);
		}
	};

	const handleBlur = () => {
		setSettings({ ...storedSettings });
	};

	if (loading) return <div />;

	return (
		<div className="Settings">
			<SettingsGroup label="General">
				<SettingRow>
					<Toggle
						label="Include URL in title"
						isPressed={settings.urlInTitle}
						onClick={() => {
							handleChange("urlInTitle", !settings.urlInTitle);
						}}
					/>
				</SettingRow>

				<SettingRow>
					<Toggle
						label="Keyboard clicking"
						isPressed={settings.keyboardClicking}
						onClick={() => {
							handleChange("keyboardClicking", !settings.keyboardClicking);
						}}
					/>
				</SettingRow>
				<SettingRow>
					<Toggle
						label="Show What's New page after updating"
						isPressed={settings.showWhatsNewPageOnUpdate}
						onClick={() => {
							handleChange(
								"showWhatsNewPageOnUpdate",
								!settings.showWhatsNewPageOnUpdate
							);
						}}
					/>
				</SettingRow>
			</SettingsGroup>

			<SettingsGroup label="Hints appearance">
				<SettingRow>
					<Toggle
						label="Include single letter hints"
						isPressed={settings.includeSingleLetterHints}
						onClick={() => {
							handleChange(
								"includeSingleLetterHints",
								!settings.includeSingleLetterHints
							);
						}}
					/>
				</SettingRow>
				<SettingRow>
					<Toggle
						label="Use uppercase letters"
						isPressed={settings.hintUppercaseLetters}
						onClick={() => {
							handleChange(
								"hintUppercaseLetters",
								!settings.hintUppercaseLetters
							);
						}}
					/>
				</SettingRow>
				<SettingRow>
					<TextInput
						label="Font family"
						defaultValue={settings.hintFontFamily}
						onChange={(value) => {
							handleChange("hintFontFamily", value);
						}}
						onBlur={handleBlur}
					/>
				</SettingRow>

				<SettingRow>
					<NumberInput
						label="Font size (px)"
						defaultValue={settings.hintFontSize}
						min={6}
						max={16}
						isValid={isValidSetting("hintFontSize", settings.hintFontSize)}
						onChange={(value) => {
							handleChange("hintFontSize", value);
						}}
						onBlur={handleBlur}
					/>
				</SettingRow>
				<SettingRow>
					<RadioGroup
						label="Font weight"
						name="hintWeight"
						defaultValue={settings.hintWeight}
						onChange={(value) => {
							handleChange("hintWeight", value);
						}}
					>
						<Radio value="auto">
							auto
							<p className="small">
								The font weight is automatically selected for each hint
								depending on contrast and font size
							</p>
						</Radio>
						<Radio value="normal">normal</Radio>
						<Radio value="bold">bold</Radio>
					</RadioGroup>
				</SettingRow>
				<SettingRow>
					<NumberInput
						label="Minimum contrast ratio"
						defaultValue={settings.hintMinimumContrastRatio}
						min={2.5}
						max={21}
						step={0.5}
						isValid={isValidSetting(
							"hintMinimumContrastRatio",
							settings.hintMinimumContrastRatio
						)}
						onChange={(value) => {
							handleChange("hintMinimumContrastRatio", value);
						}}
						onBlur={handleBlur}
					>
						<p className="small show-on-focus">
							Value between 2.5 and 21. Lower values will make hints match the
							style of the page better while higher values provide improved
							legibility.
						</p>
					</NumberInput>
				</SettingRow>
				<SettingRow>
					<TextInput
						label="Background color"
						defaultValue={settings.hintBackgroundColor}
						isValid={isValidSetting(
							"hintBackgroundColor",
							settings.hintBackgroundColor
						)}
						onChange={(value) => {
							handleChange("hintBackgroundColor", value);
						}}
						onBlur={handleBlur}
					>
						<p className="small show-on-focus">
							Use a{" "}
							<a
								href="https://developer.mozilla.org/en-US/docs/Web/CSS/color_value"
								target="_blank"
								rel="noreferrer"
							>
								CSS color string
							</a>
							. Newer color formats like LCH might not be supported. Leaving the
							field blank lets the color be determined based on the element
							being hinted.
						</p>
					</TextInput>
				</SettingRow>
				<SettingRow>
					<TextInput
						label="Font/border color"
						defaultValue={settings.hintFontColor}
						isValid={isValidSetting("hintFontColor", settings.hintFontColor)}
						onChange={(value) => {
							handleChange("hintFontColor", value);
						}}
						onBlur={handleBlur}
					>
						{!storedSettings.hintBackgroundColor && settings.hintFontColor && (
							<p className="small warning">
								No background color set. This value will be ignored.
							</p>
						)}
						<p className="small show-on-focus">
							Use a{" "}
							<a
								href="https://developer.mozilla.org/en-US/docs/Web/CSS/color_value"
								target="_blank"
								rel="noreferrer"
							>
								CSS color string
							</a>
							. Newer color formats like LCH might not be supported. Leaving the
							field blank lets the color be determined based on the element
							being hinted and the background color.
						</p>
					</TextInput>
				</SettingRow>

				<SettingRow>
					<NumberInput
						label="Background opacity"
						defaultValue={settings.hintBackgroundOpacity}
						min={0}
						max={1}
						step={0.05}
						isValid={isValidSetting(
							"hintBackgroundOpacity",
							settings.hintBackgroundOpacity
						)}
						isDisabled={
							Boolean(storedSettings.hintBackgroundColor) &&
							new Color(storedSettings.hintBackgroundColor).alpha() !== 1
						}
						onChange={(value) => {
							handleChange("hintBackgroundOpacity", value);
						}}
						onBlur={handleBlur}
					>
						<p className="small show-on-focus">
							Choose a value between 0 (fully transparent) and 1 (fully opaque).
						</p>
						{storedSettings.hintBackgroundColor &&
							new Color(storedSettings.hintBackgroundColor).alpha() !== 1 && (
								<p className="small">
									The chosen background color already has an alpha channel. This
									value will be ignored.
								</p>
							)}
					</NumberInput>
				</SettingRow>
				<SettingRow>
					<NumberInput
						label="Border width (px)"
						defaultValue={settings.hintBorderWidth}
						min={0}
						max={3}
						isValid={isValidSetting(
							"hintBorderWidth",
							settings.hintBorderWidth
						)}
						onChange={(value) => {
							handleChange("hintBorderWidth", value);
						}}
						onBlur={handleBlur}
					/>
				</SettingRow>
				<SettingRow>
					<NumberInput
						label="Border radius (px)"
						defaultValue={settings.hintBorderRadius}
						min={0}
						max={10}
						isValid={isValidSetting(
							"hintBorderRadius",
							settings.hintBorderRadius
						)}
						onChange={(value) => {
							handleChange("hintBorderRadius", value);
						}}
						onBlur={handleBlur}
					/>
				</SettingRow>
			</SettingsGroup>
			<SettingsGroup label="Scroll">
				<SettingRow>
					<RadioGroup
						label="Scroll behavior"
						name="scrollBehavior"
						defaultValue={settings.scrollBehavior}
						onChange={(value) => {
							handleChange("scrollBehavior", value);
						}}
					>
						<Radio value="auto">
							auto
							<p className="small">
								Follows the{" "}
								<a
									href="https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion#user_preferences"
									target="_blank"
									rel="noreferrer"
								>
									OS setting for reduced motion.
								</a>{" "}
							</p>
						</Radio>
						<Radio value="smooth">smooth</Radio>
						<Radio value="instant">instant</Radio>
					</RadioGroup>
				</SettingRow>
			</SettingsGroup>
			<SettingsGroup label="Notifications">
				<SettingRow>
					<Toggle
						label="Enable notifications"
						isPressed={settings.enableNotifications}
						onClick={() => {
							handleChange(
								"enableNotifications",
								!settings.enableNotifications
							);
						}}
					/>
				</SettingRow>
				<SettingRow>
					<Select
						label="Position"
						defaultValue={settings.toastPosition}
						isDisabled={!settings.enableNotifications}
						onChange={(value) => {
							handleChange("toastPosition", value);
						}}
					>
						<Option value="top-left">top-left</Option>
						<Option value="top-center">top-center</Option>
						<Option value="top-right">top-right</Option>
						<Option value="bottom-left">bottom-left</Option>
						<Option value="bottom-center">bottom-center</Option>
						<Option value="bottom-right">bottom-right</Option>
					</Select>
				</SettingRow>
				<SettingRow>
					<RadioGroup
						label="Transition"
						name="toastTransition"
						defaultValue={settings.toastTransition}
						isDisabled={!settings.enableNotifications}
						onChange={(value) => {
							handleChange("toastTransition", value);
						}}
					>
						<Radio value="bounce">bounce</Radio>
						<Radio value="slide">slide</Radio>
						<Radio value="flip">flip</Radio>
						<Radio value="zoom">zoom</Radio>
					</RadioGroup>
				</SettingRow>
			</SettingsGroup>
		</div>
	);
}
