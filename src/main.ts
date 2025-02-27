import { NeighbouringFileNavigator } from "NeighbouringFileNavigator";
import NeighbouringFileNavigatorPluginSettings from "NeighbouringFileNavigatorPluginSettings";
import NeighbouringFileNavigatorPluginSettingTab from "NeighbouringFileNavigatorPluginSettingTab";
import { Plugin } from "obsidian";

const DEFAULT_SETTINGS: Partial<NeighbouringFileNavigatorPluginSettings> = {
	defaultSortOrder: 'alphabetical',
	includedFileTypes: 'markdownOnly',
	additionalExtensions: ['canvas', 'pdf'],
};

export default class NeighbouringFileNavigatorPlugin extends Plugin {

	settings: NeighbouringFileNavigatorPluginSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new NeighbouringFileNavigatorPluginSettingTab(this.app, this));

		this.addCommand({
			id: "next",
			name: "Navigate to next file",
			callback: () => NeighbouringFileNavigator.navigateToNextFile(this.app.workspace, this.settings),
		});
		this.addCommand({
			id: "prev",
			name: "Navigate to prev file",
			callback: () => NeighbouringFileNavigator.navigateToPrevFile(this.app.workspace, this.settings),
		});

		this.addCommand({
			id: "next-alphabetical",
			name: "Navigate to next file (alphabetical)",
			callback: () => NeighbouringFileNavigator.navigateToNextAlphabeticalFile(this.app.workspace, this.settings),
		});
		this.addCommand({
			id: "prev-alphabetical",
			name: "Navigate to prev file (alphabetical)",
			callback: () => NeighbouringFileNavigator.navigateToPrevAlphabeticalFile(this.app.workspace, this.settings),
		});

		const olderCreatedCommand = {
			name: "Navigate to older file (creation timestamp)",
			callback: () => NeighbouringFileNavigator.navigateToOlderCreatedFile(this.app.workspace, this.settings),
		};
		this.addCommand({ ...olderCreatedCommand, id: "older-created" });
		this.addCommand({ ...olderCreatedCommand, id: "prev-created" });

		const newerCreatedCommand = {
			name: "Navigate to newer file (creation timestamp)",
			callback: () => NeighbouringFileNavigator.navigateToNewerCreatedFile(this.app.workspace, this.settings),
		};
		this.addCommand({ ...newerCreatedCommand, id: "next-created" });
		this.addCommand({ ...newerCreatedCommand, id: "newer-created" });

		const olderModifiedCommand = {
			name: "Navigate to older file (modification timestamp)",
			callback: () => NeighbouringFileNavigator.navigateToOlderModifiedFile(this.app.workspace, this.settings),
		};
		this.addCommand({ ...olderModifiedCommand, id: "older-modified" });
		this.addCommand({ ...olderModifiedCommand, id: "prev-modified" });

		const newerModifiedCommand = {
			name: "Navigate to newer file (modification timestamp)",
			callback: () => NeighbouringFileNavigator.navigateToNewerModifiedFile(this.app.workspace, this.settings),
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
