import NeighbouringFileNavigatorPlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";
import { SORT_ORDER, INCLUDED_FILE_TYPES } from "NeighbouringFileNavigatorPluginSettings";

export default class NeighbouringFileNavigatorPluginSettingTab extends PluginSettingTab {
	plugin: NeighbouringFileNavigatorPlugin;

	constructor(app: App, plugin: NeighbouringFileNavigatorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Default sort order")
			.setDesc("Fallback sort order used for the default command")
			.addDropdown((dropdown) => {
				dropdown.addOption("alphabetical", "Alphabetical");
				dropdown.addOption("byCreatedTime", "Creation timestamp");
				dropdown.addOption("byModifiedTime", "Modification timestamp");
				dropdown.setValue(this.plugin.settings.defaultSortOrder);
				dropdown.onChange(async (value: SORT_ORDER) => {
					this.plugin.settings.defaultSortOrder = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Loop notes in folder")
			.setDesc(
				"Navigate to the first note when navigating past the last note in the same folder."
			)
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.enableFolderLoop);
				toggle.onChange(async (value: boolean) => {
					this.plugin.settings.enableFolderLoop = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Continue across folders")
			.setDesc("Move to adjacent folders when navigating beyond the current folder boundary.")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.enableFolderBoundary);
				toggle.onChange(async (value: boolean) => {
					this.plugin.settings.enableFolderBoundary = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Included file types")
			.setDesc("Set which file types to include in the navigation")
			.addDropdown((dropdown) => {
				dropdown.addOption("markdownOnly", "Markdown only");
				dropdown.addOption("allFiles", "All files");
				dropdown.addOption("additionalExtensions", "Additional file extensions below");
				dropdown.setValue(this.plugin.settings.includedFileTypes);
				dropdown.onChange(async (value: INCLUDED_FILE_TYPES) => {
					this.plugin.settings.includedFileTypes = value;
					await this.plugin.saveSettings();
					this.display();
				});
			});

		if (this.plugin.settings.includedFileTypes === "additionalExtensions") {
			new Setting(containerEl)
				.setName("Extensions")
				.setDesc(
					"List of additional file extensions to include in the navigation (comma separated)"
				)
				.addText((text) => {
					text.setPlaceholder("Canvas, PDF");
					text.setValue(this.plugin.settings.additionalExtensions.join(", "));
					text.onChange(async (value: string) => {
						this.plugin.settings.additionalExtensions = value
							.split(",")
							.map((ext) => ext.trim());
						await this.plugin.saveSettings();
					});
				});
		}
	}
}
