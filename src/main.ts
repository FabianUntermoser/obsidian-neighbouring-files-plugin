import { NeighbouringFileNavigator } from "NeighbouringFileNavigator";
import NeighbouringFileNavigatorPluginSettings from "NeighbouringFileNavigatorPluginSettings";
import NeighbouringFileNavigatorPluginSettingTab from "NeighbouringFileNavigatorPluginSettingTab";
import { Plugin } from "obsidian";

const DEFAULT_SETTINGS: Partial<NeighbouringFileNavigatorPluginSettings> = {
	defaultSortOrder: 'alphabetical',
	enableFolderLoop: false,
};

export default class NeighbouringFileNavigatorPlugin extends Plugin {
	settings: NeighbouringFileNavigatorPluginSettings;
	private navigator: NeighbouringFileNavigator;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new NeighbouringFileNavigatorPluginSettingTab(this.app, this));
		this.navigator = new NeighbouringFileNavigator(this.settings);

		this.addCommand({
			id: "next",
			name: "Navigate to next file",
			callback: () => this.navigator.navigateToNextFile(this.app.workspace)
		});
		this.addCommand({
			id: "prev",
			name: "Navigate to prev file",
			callback: () => this.navigator.navigateToPrevFile(this.app.workspace)
		});

		this.addCommand({
			id: "next-alphabetical",
			name: "Navigate to next file (alphabetical)",
			callback: () => this.navigator.navigateToNextAlphabeticalFile(this.app.workspace)
		});
		this.addCommand({
			id: "prev-alphabetical",
			name: "Navigate to prev file (alphabetical)",
			callback: () => this.navigator.navigateToPrevAlphabeticalFile(this.app.workspace)
		});

		const olderCreatedCommand = {
			name: "Navigate to older file (creation timestamp)",
			callback: () => this.navigator.navigateToOlderCreatedFile(this.app.workspace)
		};
		this.addCommand({ ...olderCreatedCommand, id: "older-created" });
		this.addCommand({ ...olderCreatedCommand, id: "prev-created" });

		const newerCreatedCommand = {
			name: "Navigate to newer file (creation timestamp)",
			callback: () => this.navigator.navigateToNewerCreatedFile(this.app.workspace)
		};
		this.addCommand({ ...newerCreatedCommand, id: "next-created" });
		this.addCommand({ ...newerCreatedCommand, id: "newer-created" });

		const olderModifiedCommand = {
			name: "Navigate to older file (modification timestamp)",
			callback: () => this.navigator.navigateToOlderModifiedFile(this.app.workspace)
		};
		this.addCommand({ ...olderModifiedCommand, id: "older-modified" });
		this.addCommand({ ...olderModifiedCommand, id: "prev-modified" });

		const newerModifiedCommand = {
			name: "Navigate to newer file (modification timestamp)",
			callback: () => this.navigator.navigateToNewerModifiedFile(this.app.workspace)
		};
		this.addCommand({ ...newerModifiedCommand, id: "next-modified" });
		this.addCommand({ ...newerModifiedCommand, id: "newer-modified" });
	}

	onunload() { }

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
