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
			.setDesc('Sort Order used for the default command')
			.addDropdown((dropdown) => {
				dropdown.addOption("alphabetical", "Alphabetical");
				dropdown.addOption("byCreatedTime", "Creation Timestamp");
				dropdown.addOption("byModifiedTime", "Modification Timestamp");
				dropdown.setValue(this.plugin.settings.defaultSortOrder)
				dropdown.onChange(async (value: SORT_ORDER) =>	{
					console.log("sort order", this.plugin.settings.defaultSortOrder);
					this.plugin.settings.defaultSortOrder = value;
					console.log("setting sort order", value);
					await this.plugin.saveSettings();
				});
			});
	}
}
