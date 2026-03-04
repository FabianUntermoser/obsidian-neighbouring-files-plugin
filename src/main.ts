import { NeighbouringFileNavigator } from "NeighbouringFileNavigator";
import NeighbouringFileNavigatorPluginSettings, {
	DEFAULT_SETTINGS,
} from "NeighbouringFileNavigatorPluginSettings";
import NeighbouringFileNavigatorPluginSettingTab from "NeighbouringFileNavigatorPluginSettingTab";
import { Plugin } from "obsidian";

export default class NeighbouringFileNavigatorPlugin extends Plugin {
	settings: NeighbouringFileNavigatorPluginSettings;
	private navigator: NeighbouringFileNavigator;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(
			new NeighbouringFileNavigatorPluginSettingTab(this.app, this)
		);
		this.navigator = new NeighbouringFileNavigator(this.settings);

		this.addCommand({
			id: "next",
			name: "Navigate to next file",
			callback: () =>
				this.navigator.navigateToNextFile(this.app.workspace),
		});
		this.addCommand({
			id: "prev",
			name: "Navigate to prev file",
			callback: () =>
				this.navigator.navigateToPrevFile(this.app.workspace),
		});

		this.addCommand({
			id: "next-alphabetical",
			name: "Navigate to next file (alphabetical)",
			callback: () =>
				this.navigator.navigateToNextAlphabeticalFile(
					this.app.workspace
				),
		});
		this.addCommand({
			id: "prev-alphabetical",
			name: "Navigate to prev file (alphabetical)",
			callback: () =>
				this.navigator.navigateToPrevAlphabeticalFile(
					this.app.workspace
				),
		});

		const olderCreated = {
			name: "Navigate to older file (creation timestamp)",
			callback: () =>
				this.navigator.navigateToOlderCreatedFile(this.app.workspace),
		};
		this.addCommand({ ...olderCreated, id: "older-created" });
		this.addCommand({ ...olderCreated, id: "prev-created" });

		const newerCreated = {
			name: "Navigate to newer file (creation timestamp)",
			callback: () =>
				this.navigator.navigateToNewerCreatedFile(this.app.workspace),
		};
		this.addCommand({ ...newerCreated, id: "next-created" });
		this.addCommand({ ...newerCreated, id: "newer-created" });

		const olderModified = {
			name: "Navigate to older file (modification timestamp)",
			callback: () =>
				this.navigator.navigateToOlderModifiedFile(this.app.workspace),
		};
		this.addCommand({ ...olderModified, id: "older-modified" });
		this.addCommand({ ...olderModified, id: "prev-modified" });

		const newerModified = {
			name: "Navigate to newer file (modification timestamp)",
			callback: () =>
				this.navigator.navigateToNewerModifiedFile(this.app.workspace),
		};
		this.addCommand({ ...newerModified, id: "next-modified" });
		this.addCommand({ ...newerModified, id: "newer-modified" });
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
