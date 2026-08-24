import { NeighbouringFileNavigator } from "./NeighbouringFileNavigator";
import NeighbouringFileNavigatorPluginSettings, {
	DEFAULT_SETTINGS,
} from "./NeighbouringFileNavigatorPluginSettings";
import NeighbouringFileNavigatorPluginSettingTab from "./NeighbouringFileNavigatorPluginSettingTab";
import FabConfigModal from "./FabConfigModal";
import MobileFab from "./MobileFab";
import { Platform, Plugin } from "obsidian";

export default class NeighbouringFileNavigatorPlugin extends Plugin {
	settings: NeighbouringFileNavigatorPluginSettings;
	private navigator: NeighbouringFileNavigator;
	private fab: MobileFab | null = null;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new NeighbouringFileNavigatorPluginSettingTab(this.app, this));
		this.navigator = new NeighbouringFileNavigator(this.settings);

		// Navigation commands: registered once, referenced by full id elsewhere.
		const workspace = this.app.workspace;
		const nav = this.navigator;
		const commands: Array<{ id: string; name: string; run: () => void }> = [
			{
				id: "next",
				name: "Navigate to next file",
				run: () => nav.navigateToNextFile(workspace),
			},
			{
				id: "prev",
				name: "Navigate to prev file",
				run: () => nav.navigateToPrevFile(workspace),
			},
			{
				id: "next-alphabetical",
				name: "Navigate to next file (alphabetical)",
				run: () => nav.navigateToNextAlphabeticalFile(workspace),
			},
			{
				id: "prev-alphabetical",
				name: "Navigate to prev file (alphabetical)",
				run: () => nav.navigateToPrevAlphabeticalFile(workspace),
			},
			{
				id: "older-created",
				name: "Navigate to older file (creation timestamp)",
				run: () => nav.navigateToOlderCreatedFile(workspace),
			},
			{
				id: "next-created",
				name: "Navigate to newer file (creation timestamp)",
				run: () => nav.navigateToNewerCreatedFile(workspace),
			},
			{
				id: "older-modified",
				name: "Navigate to older file (modification timestamp)",
				run: () => nav.navigateToOlderModifiedFile(workspace),
			},
			{
				id: "next-modified",
				name: "Navigate to newer file (modification timestamp)",
				run: () => nav.navigateToNewerModifiedFile(workspace),
			},
			{
				id: "folder-up",
				name: "Folder up",
				run: () => nav.navigateToParentFolder(workspace),
			},
			{
				id: "folder-down",
				name: "Folder down",
				run: () => nav.navigateToFirstChildFolder(workspace),
			},
			{
				id: "folder-next",
				name: "Next folder",
				run: () => nav.navigateToNextSiblingFolder(workspace),
			},
			{
				id: "folder-prev",
				name: "Prev folder",
				run: () => nav.navigateToPrevSiblingFolder(workspace),
			},
			{
				id: "next-dfs",
				name: "Navigate to next file (dfs across folders)",
				run: () => nav.navigateToNextDfsFile(workspace),
			},
			{
				id: "prev-dfs",
				name: "Navigate to prev file (dfs across folders)",
				run: () => nav.navigateToPrevDfsFile(workspace),
			},
		];

		for (const command of commands) {
			this.addCommand({ id: command.id, name: command.name, callback: command.run });
		}

		// legacy aliases, kept for hotkey compatibility
		const byId = (id: string) => commands.find((command) => command.id === id) ?? commands[0];
		this.addCommand({
			id: "prev-created",
			name: byId("older-created").name,
			callback: byId("older-created").run,
		});
		this.addCommand({
			id: "newer-created",
			name: byId("next-created").name,
			callback: byId("next-created").run,
		});
		this.addCommand({
			id: "prev-modified",
			name: byId("older-modified").name,
			callback: byId("older-modified").run,
		});
		this.addCommand({
			id: "newer-modified",
			name: byId("next-modified").name,
			callback: byId("next-modified").run,
		});

		this.refreshFab();
	}

	onunload() {
		this.fab?.onunload();
		this.fab = null;
	}

	/**
	 * Open the FAB config screen (tap action of the mobile button).
	 */
	openFabConfig() {
		new FabConfigModal(this.app, this).open();
	}

	/**
	 * Create or destroy the mobile FAB based on settings and platform.
	 */
	refreshFab() {
		if (!Platform.isMobile || !this.settings.showMobileFab) {
			this.fab?.onunload();
			this.fab = null;
			return;
		}
		if (this.fab) return;
		this.fab = new MobileFab(this);
	}

	async loadSettings() {
		const loaded =
			(await this.loadData()) as Partial<NeighbouringFileNavigatorPluginSettings> | null;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, loaded);
		this.migrateFabCommands();
	}

	/**
	 * Older saved values used bare ids ("next", "folder-up"); the FAB now
	 * runs commands by full Obsidian id ("neighbouring-files:next").
	 */
	private migrateFabCommands() {
		const keys = [
			"fabSwipeLeftCommand",
			"fabSwipeRightCommand",
			"fabSwipeUpCommand",
			"fabSwipeDownCommand",
		] as const;
		let changed = false;
		for (const key of keys) {
			const value = this.settings[key];
			if (value && !value.includes(":")) {
				this.settings[key] = `neighbouring-files:${value}`;
				changed = true;
			}
		}
		if (changed) void this.saveSettings();
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
