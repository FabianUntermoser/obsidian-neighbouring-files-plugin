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

const OWN_PREFIX = "neighbouring-files:";

/**
 * All app commands ordered for the FAB pickers: this plugin's commands
 * first, then the rest alphabetically.
 */
function fabCommandOptions(app: App): Array<{ id: string; name: string }> {
	const commands = appCommands(app).listCommands();
	const own = commands
		.filter((command) => command.id.startsWith(OWN_PREFIX))
		.sort((a, b) => a.name.localeCompare(b.name));
	const rest = commands
		.filter((command) => !command.id.startsWith(OWN_PREFIX))
		.sort((a, b) => a.name.localeCompare(b.name));
	return [...own, ...rest];
}

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

		const options = fabCommandOptions(this.app);

		new Setting(contentEl)
			.setName("Single tap")
			.setDesc("Command run when tapping the button once (delayed to allow double tap)")
			.addDropdown((dropdown) => {
				dropdown.addOption("", "Do nothing");
				for (const command of options) {
					dropdown.addOption(command.id, command.name);
				}
				if (options.some((c) => c.id === this.plugin.settings.fabSingleTapCommand)) {
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
				for (const command of options) {
					dropdown.addOption(command.id, command.name);
				}
				if (options.some((c) => c.id === this.plugin.settings.fabDoubleTapCommand)) {
					dropdown.setValue(this.plugin.settings.fabDoubleTapCommand);
				}
				dropdown.onChange(async (value: string) => {
					this.plugin.settings.fabDoubleTapCommand = value;
					await this.plugin.saveSettings();
				});
			});

		for (const gesture of GESTURES) {
			new Setting(contentEl)
				.setName(gesture.label)
				.setDesc("Command run when swiping this direction on the button")
				.addDropdown((dropdown) => {
					dropdown.addOption("", "Do nothing");
					for (const command of options) {
						dropdown.addOption(command.id, command.name);
					}
					const current = this.plugin.settings[gesture.key];
					if (current && options.some((c) => c.id === current)) {
						dropdown.setValue(current);
					}
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
