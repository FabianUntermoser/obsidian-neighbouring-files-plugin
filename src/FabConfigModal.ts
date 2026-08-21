import { App, Modal, Setting } from "obsidian";
import type NeighbouringFileNavigatorPlugin from "./main";

/**
 * Config screen opened by tapping the mobile FAB.
 * Lets the user pick which plugin commands the swipe gestures run.
 */
export default class FabConfigModal extends Modal {
	private plugin: NeighbouringFileNavigatorPlugin;

	constructor(app: App, plugin: NeighbouringFileNavigatorPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		this.titleEl.setText("Mobile navigation button");
		contentEl.empty();

		const options = this.plugin.getFabCommandOptions();

		new Setting(contentEl)
			.setName("Swipe left")
			.setDesc("Command run when swiping left on the button")
			.addDropdown((dropdown) => {
				for (const option of options) {
					dropdown.addOption(option.id, option.name);
				}
				dropdown.setValue(this.plugin.settings.fabSwipeLeftCommand);
				dropdown.onChange(async (value: string) => {
					this.plugin.settings.fabSwipeLeftCommand = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(contentEl)
			.setName("Swipe right")
			.setDesc("Command run when swiping right on the button")
			.addDropdown((dropdown) => {
				for (const option of options) {
					dropdown.addOption(option.id, option.name);
				}
				dropdown.setValue(this.plugin.settings.fabSwipeRightCommand);
				dropdown.onChange(async (value: string) => {
					this.plugin.settings.fabSwipeRightCommand = value;
					await this.plugin.saveSettings();
				});
			});
	}

	onClose() {
		this.contentEl.empty();
	}
}
