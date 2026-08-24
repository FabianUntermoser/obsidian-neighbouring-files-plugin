import NeighbouringFileNavigatorPlugin from "./main";
import { App, PluginSettingTab, requireApiVersion } from "obsidian";
import type { SettingDefinitionItem } from "obsidian";

export default class NeighbouringFileNavigatorPluginSettingTab extends PluginSettingTab {
	plugin: NeighbouringFileNavigatorPlugin;

	constructor(app: App, plugin: NeighbouringFileNavigatorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	setControlValue(key: string, value: unknown): void | Promise<void> {
		if (requireApiVersion("1.13.0")) {
			const result = super.setControlValue(key, value);
			if (key === "showMobileFab") this.plugin.refreshFab();
			return result;
		}
		return undefined;
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: "Default sort order",
				desc: "Fallback sort order used for the default command",
				control: {
					type: "dropdown",
					key: "defaultSortOrder",
					options: {
						alphabetical: "Alphabetical",
						byCreatedTime: "Creation timestamp",
						byModifiedTime: "Modification timestamp",
						alphabeticalReverse: "Alphabetical (reverse)",
						byCreatedTimeReverse: "Creation timestamp (reverse)",
						byModifiedTimeReverse: "Modification timestamp (reverse)",
					},
				},
			},
			{
				name: "Loop notes in folder",
				desc: "Navigate to the first note when navigating past the last note in the same folder.",
				control: {
					type: "toggle",
					key: "enableFolderLoop",
				},
			},
			{
				name: "Continue across folders",
				desc: "Move to adjacent folders when navigating beyond the current folder boundary.",
				control: {
					type: "toggle",
					key: "enableFolderBoundary",
				},
			},
			{
				name: "Included file types",
				desc: "Set which file types to include in the navigation",
				control: {
					type: "dropdown",
					key: "includedFileTypes",
					options: {
						markdownOnly: "Markdown only",
						allFiles: "All files",
						additionalExtensions: "Additional file extensions below",
					},
				},
			},
			{
				type: "group",
				heading: "Mobile",
				items: [
					{
						name: "Mobile navigation button",
						desc: "Show a floating button on mobile with configurable swipe gestures and tap actions.",
						control: {
							type: "toggle",
							key: "showMobileFab",
						},
					},
					{
						name: "Fab gestures",
						desc: "Configure swipe gestures, tap actions and haptics for the mobile button.",
						render: (setting) => {
							setting.addButton((button) => {
								button.setButtonText("Open fab settings").onClick(() => {
									this.plugin.openFabConfig();
								});
							});
						},
					},
				],
			},
			{
				name: "Extensions",
				desc: "List of additional file extensions to include in the navigation (comma separated)",
				visible: () => this.plugin.settings.includedFileTypes === "additionalExtensions",
				render: (setting) => {
					setting.addText((text) => {
						text.setPlaceholder("Canvas, PDF");
						text.setValue(this.plugin.settings.additionalExtensions.join(", "));
						text.onChange(async (value: string) => {
							this.plugin.settings.additionalExtensions = value
								.split(",")
								.map((ext) => ext.trim());
							await this.plugin.saveSettings();
						});
					});
				},
			},
		];
	}
}
