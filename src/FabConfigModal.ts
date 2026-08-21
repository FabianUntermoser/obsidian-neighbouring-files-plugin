import { App, Modal, Setting } from "obsidian";
import type NeighbouringFileNavigatorPlugin from "./main";

const GESTURES: Array<{
	key: "fabSwipeLeftCommand" | "fabSwipeRightCommand" | "fabSwipeUpCommand" | "fabSwipeDownCommand";
	label: string;
}> = [
	{ key: "fabSwipeLeftCommand", label: "Swipe left" },
	{ key: "fabSwipeRightCommand", label: "Swipe right" },
	{ key: "fabSwipeUpCommand", label: "Swipe up" },
	{ key: "fabSwipeDownCommand", label: "Swipe down" },
];

/**
 * Config screen opened by tapping the mobile FAB.
 * Lets the user pick which plugin commands each swipe direction runs.
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

		const options: Array<{ id: string; name: string }> = [
			{ id: "", name: "Do nothing" },
			...this.plugin.getFabCommandOptions(),
		];

		for (const gesture of GESTURES) {
			new Setting(contentEl)
				.setName(gesture.label)
				.setDesc("Command run when swiping this direction on the button")
				.addDropdown((dropdown) => {
					for (const option of options) {
						dropdown.addOption(option.id, option.name);
					}
					dropdown.setValue(this.plugin.settings[gesture.key]);
					dropdown.onChange(async (value: string) => {
						this.plugin.settings[gesture.key] = value;
						await this.plugin.saveSettings();
					});
				});
		}
	}

	onClose() {
		this.contentEl.empty();
	}
}
