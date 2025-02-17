import NeighbouringFileNavigatorPlugin from './main';
import { App, PluginSettingTab, Setting } from 'obsidian';
import { SORT_ORDER } from 'NeighbouringFileNavigatorPluginSettings';

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
			.setName('Default Sort Order')
			.setDesc('Fallback sort order used for the default command')
			.addDropdown((dropdown) => {
				dropdown.addOption("alphabetical", "Alphabetical");
				dropdown.addOption("byCreatedTime", "Creation Timestamp");
				dropdown.addOption("byModifiedTime", "Modification Timestamp");
				dropdown.setValue(this.plugin.settings.defaultSortOrder)
				dropdown.onChange(async (value: SORT_ORDER) =>	{
					this.plugin.settings.defaultSortOrder = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Folder Cycling')
			.setDesc('Disable navigation to first note cycling through a folder')
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.disableFolderLooping);
				toggle.onChange(async (value) => {
					this.plugin.settings.disableFolderLooping = value;
					await this.plugin.saveSettings();
				});
			});
	}
}
