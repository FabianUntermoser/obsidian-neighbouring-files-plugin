import { App, Modal, Setting } from "obsidian";
import type NeighbouringFileNavigatorPlugin from "./main";
import { appCommands } from "./MobileFab";

const GESTURES: Array<{
	key:
		| "fabSwipeLeftCommand"
		| "fabSwipeRightCommand"
		| "fabSwipeUpCommand"
		| "fabSwipeDownCommand";
	label: string;
}> = [
	{ key: "fabSwipeLeftCommand", label: "Swipe left" },
	{ key: "fabSwipeRightCommand", label: "Swipe right" },
	{ key: "fabSwipeUpCommand", label: "Swipe up" },
	{ key: "fabSwipeDownCommand", label: "Swipe down" },
];

/**
 * Config screen opened by long-pressing the mobile FAB.
 * Lets the user pick which commands the tap gestures and swipe directions run.
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

		const commands = appCommands(this.app)
			.listCommands()
			.sort((a, b) => a.name.localeCompare(b.name));

		new Setting(contentEl)
			.setName("Single tap")
			.setDesc("Command run when tapping the button once (delayed to allow double tap)")
			.addDropdown((dropdown) => {
				dropdown.addOption("", "Do nothing");
				for (const command of commands) {
					dropdown.addOption(command.id, command.name);
				}
				if (
					commands.some(
						(command) => command.id === this.plugin.settings.fabSingleTapCommand
					)
				) {
					dropdown.setValue(this.plugin.settings.fabSingleTapCommand);
				}
				dropdown.onChange(async (value: string) => {
					this.plugin.settings.fabSingleTapCommand = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(contentEl)
			.setName("Double tap")
			.setDesc("Command run when double tapping the button")
			.addDropdown((dropdown) => {
				dropdown.addOption("", "Do nothing");
				for (const command of commands) {
					dropdown.addOption(command.id, command.name);
				}
				if (
					commands.some(
						(command) => command.id === this.plugin.settings.fabDoubleTapCommand
					)
				) {
					dropdown.setValue(this.plugin.settings.fabDoubleTapCommand);
				}
				dropdown.onChange(async (value: string) => {
					this.plugin.settings.fabDoubleTapCommand = value;
					await this.plugin.saveSettings();
				});
			});

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

		new Setting(contentEl)
			.setName("Haptics")
			.setDesc("Vibrate on long press")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.fabHaptics);
				toggle.onChange(async (value: boolean) => {
					this.plugin.settings.fabHaptics = value;
					await this.plugin.saveSettings();
				});
			});
	}

	onClose() {
		this.contentEl.empty();
	}
}
