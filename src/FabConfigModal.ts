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

type CommandKey =
	| "fabSingleTapCommand"
	| "fabDoubleTapCommand"
	| "fabSwipeLeftCommand"
	| "fabSwipeRightCommand"
	| "fabSwipeUpCommand"
	| "fabSwipeDownCommand";

interface CommandOption {
	id: string;
	name: string;
}

/**
 * All app commands ordered for the FAB pickers: this plugin's commands
 * first, then the rest alphabetically.
 */
function fabCommandOptions(app: App): CommandOption[] {
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

	private commandDropdown(setting: Setting, options: CommandOption[], key: CommandKey): Setting {
		return setting.addDropdown((dropdown) => {
			dropdown.addOption("", "Do nothing");
			for (const command of options) {
				dropdown.addOption(command.id, command.name);
			}
			const current = this.plugin.settings[key];
			if (current && options.some((command) => command.id === current)) {
				dropdown.setValue(current);
			}
			dropdown.onChange(async (value: string) => {
				this.plugin.settings[key] = value;
				await this.plugin.saveSettings();
			});
		});
	}

	private paddingSlider(setting: Setting, key: "fabPaddingX" | "fabPaddingY"): Setting {
		return setting.addSlider((slider) => {
			slider
				.setLimits(0, 120, 4)
				.setValue(this.plugin.settings[key])
				.onChange(async (value: number) => {
					this.plugin.settings[key] = value;
					await this.plugin.saveSettings();
					this.plugin.updateFabPadding();
				});
		});
	}

	onOpen() {
		const { contentEl } = this;
		this.titleEl.setText("Mobile navigation button");
		contentEl.empty();

		const options = fabCommandOptions(this.app);

		const tapSetting = new Setting(contentEl)
			.setName("Single tap")
			.setDesc("Command run when tapping the button once (delayed to allow double tap)");
		this.commandDropdown(tapSetting, options, "fabSingleTapCommand");

		const doubleTapSetting = new Setting(contentEl)
			.setName("Double tap")
			.setDesc("Command run when double tapping the button");
		this.commandDropdown(doubleTapSetting, options, "fabDoubleTapCommand");

		for (const gesture of GESTURES) {
			const setting = new Setting(contentEl)
				.setName(gesture.label)
				.setDesc("Command run when swiping this direction on the button");
			this.commandDropdown(setting, options, gesture.key);
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

		const padX = new Setting(contentEl)
			.setName("Horizontal padding")
			.setDesc("Distance from the left/right screen edges");
		this.paddingSlider(padX, "fabPaddingX");

		const padY = new Setting(contentEl)
			.setName("Vertical padding")
			.setDesc("Distance from the top/bottom screen edges");
		this.paddingSlider(padY, "fabPaddingY");
	}

	onClose() {
		this.contentEl.empty();
	}
}
