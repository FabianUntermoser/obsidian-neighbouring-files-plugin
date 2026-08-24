/**
 * @jest-environment jsdom
 */
import MobileFab from "../src/MobileFab";
import { Notice } from "./__mocks__/obsidian";

const DOUBLE_TAP_TIMEOUT = 450;
const LONG_PRESS_MS = 500;

type CommandRecorder = { executed: string[] };

const makeCommands = (): CommandRecorder & { executeCommandById: jest.Mock } => {
	const recorder: CommandRecorder = { executed: [] };
	const executeCommandById = jest.fn((id: string) => {
		recorder.executed.push(id);
		return true;
	});
	return { ...recorder, executeCommandById };
};

const makeWorkspace = (activeFile: unknown = { path: "a.md" }) => {
	const workspace: Record<string, unknown> = {
		on: jest.fn(() => () => {}),
		offref: jest.fn(),
		getActiveFile: jest.fn(() => activeFile),
	};
	return workspace as unknown as Record<string, unknown> & {
		on: jest.Mock;
		offref: jest.Mock;
		getActiveFile: jest.Mock;
	};
};

const makePlugin = (overrides: Partial<Record<string, string>> = {}) => {
	const commands = makeCommands();
	const workspace = makeWorkspace();
	const settings: Record<string, string | number | boolean> = {
		fabSingleTapCommand: "neighbouring-files:next",
		fabDoubleTapCommand: "",
		fabSwipeLeftCommand: "neighbouring-files:previous",
		fabSwipeRightCommand: "neighbouring-files:next",
		fabSwipeUpCommand: "",
		fabSwipeDownCommand: "",
		fabOffsetX: 0,
		fabOffsetY: 0,
		fabHaptics: false,
		...overrides,
	};
	const plugin = {
		app: {
			commands,
			workspace,
		},
		settings,
		saveSettings: jest.fn(),
		openFabConfig: jest.fn(),
	};
	return {
		plugin,
		commands,
		workspace,
	};
};

const getFab = () => {
	const el = document.body.querySelector(".neighbouring-files-fab");
	if (!el) throw new Error("fab element not found in the DOM");
	return el as HTMLElement;
};

const fire = (type: string, x = 0, y = 0, opts: Record<string, unknown> = {}) => {
	const ev = new Event(type) as Event & Record<string, unknown>;
	Object.assign(ev, { clientX: x, clientY: y, pointerId: 1, detail: 0, ...opts });
	getFab().dispatchEvent(ev);
};

describe("MobileFab", () => {
	let fab: MobileFab;
	let commands: ReturnType<typeof makeCommands>;

	beforeEach(() => {
		(window as unknown as { activeDocument: Document }).activeDocument = window.document;
		document.body.innerHTML = "";
		Notice.instances.length = 0;
		jest.useFakeTimers();
	});

	afterEach(() => {
		if (fab) fab.onunload();
		jest.useRealTimers();
	});

	const mount = (overrides: Partial<Record<string, string>> = {}) => {
		const ctx = makePlugin(overrides);
		commands = ctx.commands;
		fab = new MobileFab(ctx.plugin as never);
		return ctx;
	};

	describe("swipes", () => {
		it("runs the right command for each direction", () => {
			mount();
			const cases: Array<[number, number, string]> = [
				[-50, 0, "neighbouring-files:previous"],
				[50, 0, "neighbouring-files:next"],
				[0, -50, ""],
				[0, 50, ""],
			];
			for (const [dx, dy, expected] of cases) {
				commands.executed.length = 0;
				fire("pointerdown", 0, 0);
				fire("pointermove", dx, dy);
				fire("pointerup", dx, dy);
				if (expected) {
					expect(commands.executed).toContain(expected);
				} else {
					expect(commands.executed).toHaveLength(0);
				}
			}
		});

		it("does not also trigger the single-tap command on a swipe", () => {
			mount({ fabSingleTapCommand: "single-tap:cmd" });
			fire("pointerdown", 0, 0);
			fire("pointermove", 80, 0);
			fire("pointerup", 80, 0);
			jest.advanceTimersByTime(DOUBLE_TAP_TIMEOUT + 10);
			expect(commands.executed).not.toContain("single-tap:cmd");
		});
	});

	describe("taps", () => {
		it("runs the single-tap command after the double-tap window", () => {
			mount();
			fire("pointerdown", 0, 0);
			fire("pointerup", 0, 0);
			expect(commands.executed).toHaveLength(0);
			jest.advanceTimersByTime(DOUBLE_TAP_TIMEOUT + 10);
			expect(commands.executed).toEqual(["neighbouring-files:next"]);
		});

		it("runs the double-tap command instead of the single-tap one", () => {
			mount({ fabDoubleTapCommand: "neighbouring-files:previous" });
			fire("pointerdown", 0, 0);
			fire("pointerup", 0, 0);
			fire("pointerdown", 0, 0);
			fire("pointerup", 0, 0);
			expect(commands.executed).toEqual(["neighbouring-files:previous"]);
		});

		it("does nothing when the single-tap command is empty", () => {
			mount({ fabSingleTapCommand: "" });
			fire("pointerdown", 0, 0);
			fire("pointerup", 0, 0);
			jest.advanceTimersByTime(DOUBLE_TAP_TIMEOUT + 10);
			expect(commands.executed).toHaveLength(0);
		});
	});

	describe("long press", () => {
		it("opens the fab config when held still", () => {
			const { plugin } = mount();
			fire("pointerdown", 0, 0);
			jest.advanceTimersByTime(LONG_PRESS_MS);
			fire("pointerup", 0, 0);
			expect(plugin.openFabConfig).toHaveBeenCalled();
		});

		it("drags and persists a new position when moved", () => {
			const { plugin } = mount();
			fire("pointerdown", 0, 0);
			jest.advanceTimersByTime(LONG_PRESS_MS);
			fire("pointermove", 60, 40);
			fire("pointerup", 60, 40);
			expect(plugin.settings.fabOffsetX).not.toBe(0);
			expect(plugin.saveSettings).toHaveBeenCalled();
		});
	});

	describe("keyboard / assistive activation", () => {
		it("runs the single-tap command from a plain click", () => {
			mount();
			getFab().click();
			expect(commands.executed).toEqual(["neighbouring-files:next"]);
		});

		it("ignores the trailing click after a pointer tap", () => {
			mount();
			fire("pointerdown", 0, 0);
			fire("pointerup", 0, 0);
			getFab().click();
			jest.advanceTimersByTime(DOUBLE_TAP_TIMEOUT + 10);
			expect(commands.executed).toEqual(["neighbouring-files:next"]);
		});
	});

	describe("command execution", () => {
		it("shows a notice when the command id does not exist", () => {
			mount();
			commands.executeCommandById.mockReturnValue(false);
			fire("pointerdown", 0, 0);
			fire("pointerup", 0, 0);
			jest.advanceTimersByTime(DOUBLE_TAP_TIMEOUT + 10);
			expect(Notice.instances.length).toBeGreaterThan(0);
		});
	});

	describe("cleanup", () => {
		it("removes the element and clears timers on unload", () => {
			mount();
			fire("pointerdown", 0, 0);
			jest.advanceTimersByTime(LONG_PRESS_MS / 2);
			expect(getFab()).toBeTruthy();
			fab.onunload();
			expect(document.body.querySelector(".neighbouring-files-fab")).toBeNull();
			expect(fab).toBeDefined();
		});
	});
});
