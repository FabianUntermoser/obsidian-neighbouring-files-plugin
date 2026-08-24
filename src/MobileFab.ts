import { App, Notice, Workspace, setIcon } from "obsidian";
import type NeighbouringFileNavigatorPlugin from "./main";

const SWIPE_THRESHOLD = 40;
const TAP_THRESHOLD = 10;
const MOVE_TOLERANCE = 8;
const LONG_PRESS_MS = 500;
const NUDGE_DISTANCE = 6;
const DOUBLE_TAP_TIMEOUT = 450;

type Direction = "left" | "right" | "up" | "down";

const SWIPE_COMMAND_KEYS: Record<
	Direction,
	"fabSwipeLeftCommand" | "fabSwipeRightCommand" | "fabSwipeUpCommand" | "fabSwipeDownCommand"
> = {
	left: "fabSwipeLeftCommand",
	right: "fabSwipeRightCommand",
	up: "fabSwipeUpCommand",
	down: "fabSwipeDownCommand",
};

function clampOffset(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value));
}

/** app.commands is not in the 1.13.1 d.ts; minimal typed view. */
export interface AppCommands {
	executeCommandById(id: string): Promise<boolean> | boolean;
	listCommands(): Array<{ id: string; name: string }>;
}

export function appCommands(app: App): AppCommands {
	return (app as unknown as { commands: AppCommands }).commands;
}

/**
 * Mobile floating action button.
 *
 * Swipes run the configured commands, double tap runs a command, long press
 * opens the config screen, long press + drag repositions the button.
 * Visible whenever a file is open. Styling lives in styles.css.
 */
export default class MobileFab {
	private plugin: NeighbouringFileNavigatorPlugin;
	private fabEl: HTMLElement;
	private workspace: Workspace;
	private leafChangeRef: ReturnType<Workspace["on"]>;

	// gesture state
	private tracking = false;
	private swiped = false;
	private dragging = false;
	private visible = false;
	private dragBaseX = 0;
	private dragBaseY = 0;
	private dragViewportW = 0;
	private dragViewportH = 0;
	private longPressTimer: number | null = null;
	private doubleTapTimer: number | null = null;
	private singleTapTimer: number | null = null;
	private startX = 0;
	private startY = 0;
	private startTime = 0;

	constructor(plugin: NeighbouringFileNavigatorPlugin) {
		this.plugin = plugin;
		this.workspace = plugin.app.workspace;
		this.fabEl = this.buildFab();
		this.applyPosition();
		this.register();
	}

	private onLeafChange = () => {
		this.updateVisibility();
	};

	private updateVisibility = () => {
		const show = Boolean(this.workspace.getActiveFile());
		if (show === this.visible) return;
		this.visible = show;
		this.fabEl.classList.toggle("is-visible", show);
	};

	private onResize = () => {
		// keyboard opening shrinks the viewport and re-anchors the fixed
		// bottom position; keep the fab under the finger mid-drag
		if (!this.tracking || !this.dragging) return;
		const vh = window.innerHeight;
		const dy = this.dragViewportH - vh;
		if (dy !== 0) {
			this.plugin.settings.fabOffsetY = clampOffset(
				this.plugin.settings.fabOffsetY + dy,
				-(vh - 140),
				100
			);
			this.applyPosition();
		}
		this.dragViewportW = window.innerWidth;
		this.dragViewportH = vh;
	};

	private onPointerDown = (ev: PointerEvent) => {
		this.tracking = true;
		this.swiped = false;
		this.dragging = false;
		if (this.singleTapTimer !== null) {
			window.clearTimeout(this.singleTapTimer);
			this.singleTapTimer = null;
		}
		this.startX = ev.clientX;
		this.startY = ev.clientY;
		this.startTime = Date.now();
		this.fabEl.setPointerCapture(ev.pointerId);
		if (this.longPressTimer !== null) window.clearTimeout(this.longPressTimer);
		this.longPressTimer = window.setTimeout(() => {
			this.longPressTimer = null;
			if (!this.tracking || this.swiped) return;
			this.dragging = true;
			this.dragBaseX = this.offsetX();
			this.dragBaseY = this.offsetY();
			this.dragViewportW = window.innerWidth;
			this.dragViewportH = window.innerHeight;
			this.fabEl.addClass("is-dragging");
			if (
				this.plugin.settings.fabHaptics &&
				typeof navigator !== "undefined" &&
				typeof navigator.vibrate === "function"
			) {
				navigator.vibrate(15);
			}
		}, LONG_PRESS_MS);
	};

	private onPointerMove = (ev: PointerEvent) => {
		if (!this.tracking) return;
		const dx = ev.clientX - this.startX;
		const dy = ev.clientY - this.startY;
		const horizontal = Math.abs(dx) > Math.abs(dy);
		const axisDelta = horizontal ? dx : dy;
		if (!this.swiped && Math.abs(axisDelta) > MOVE_TOLERANCE) {
			if (this.longPressTimer !== null) {
				window.clearTimeout(this.longPressTimer);
				this.longPressTimer = null;
			}
		}
		if (this.dragging) {
			this.moveDrag(this.dragBaseX + dx, this.dragBaseY + dy);
			return;
		}
		if (
			!this.swiped &&
			Math.abs(axisDelta) > SWIPE_THRESHOLD &&
			Math.abs(axisDelta) > MOVE_TOLERANCE
		) {
			this.swiped = true;
			const direction: Direction = horizontal
				? dx < 0
					? "left"
					: "right"
				: dy < 0
					? "up"
					: "down";
			this.onSwipe(direction);
		}
		const clampedDelta = Math.max(-NUDGE_DISTANCE, Math.min(NUDGE_DISTANCE, axisDelta));
		this.fabEl.setCssProps({
			"--fab-drag-x": horizontal
				? `${this.offsetX() + clampedDelta}px`
				: `${this.offsetX()}px`,
			"--fab-drag-y": horizontal
				? `${this.offsetY()}px`
				: `${this.offsetY() + clampedDelta}px`,
		});
	};

	private onPointerUp = (ev: PointerEvent) => {
		if (!this.tracking) return;
		this.tracking = false;
		if (this.longPressTimer !== null) {
			window.clearTimeout(this.longPressTimer);
			this.longPressTimer = null;
		}
		this.fabEl.removeClass("is-dragging");
		if (ev.type === "pointercancel") {
			this.resetPosition();
			this.dragging = false;
			return;
		}
		const dx = ev.clientX - this.startX;
		const dy = ev.clientY - this.startY;
		if (this.dragging) {
			this.dragging = false;
			this.applyPosition();
			void this.plugin.saveSettings();
			// long-press held still: open the fab settings instead of repositioning
			if (Math.hypot(dx, dy) < TAP_THRESHOLD) {
				this.plugin.openFabConfig();
			}
			return;
		}
		if (!this.swiped) {
			this.resetPosition();
			if (Math.hypot(dx, dy) < TAP_THRESHOLD) {
				// tap: first tap arms, second tap runs the double-tap command
				if (this.doubleTapTimer !== null) {
					window.clearTimeout(this.doubleTapTimer);
					this.doubleTapTimer = null;
					this.runCommand(this.plugin.settings.fabDoubleTapCommand);
				} else {
					this.doubleTapTimer = window.setTimeout(() => {
						this.doubleTapTimer = null;
					}, DOUBLE_TAP_TIMEOUT);
					const singleTapCommand = this.plugin.settings.fabSingleTapCommand;
					if (singleTapCommand) {
						this.singleTapTimer = window.setTimeout(() => {
							this.singleTapTimer = null;
							this.runCommand(singleTapCommand);
						}, DOUBLE_TAP_TIMEOUT);
					}
				}
			}
		}
	};

	private offsetX() {
		return Number(this.plugin.settings.fabOffsetX) || 0;
	}

	private offsetY() {
		return Number(this.plugin.settings.fabOffsetY) || 0;
	}

	private applyPosition() {
		this.fabEl.setCssProps({
			"--fab-drag-x": `${this.offsetX()}px`,
			"--fab-drag-y": `${this.offsetY()}px`,
		});
	}

	private resetPosition() {
		this.applyPosition();
	}

	private moveDrag(x: number, y: number) {
		const vw = this.dragViewportW || window.innerWidth;
		const vh = this.dragViewportH || window.innerHeight;
		this.plugin.settings.fabOffsetX = clampOffset(x, -(vw / 2 - 40), vw / 2 - 40);
		this.plugin.settings.fabOffsetY = clampOffset(y, -(vh - 140), 100);
		this.applyPosition();
	}

	private buildFab(): HTMLElement {
		const doc = window.activeDocument;
		const fab = doc.createElement("button");
		fab.className = "neighbouring-files-fab";
		fab.setAttribute("aria-label", "Navigate to neighbouring files");
		fab.type = "button";

		const icon = doc.createElement("span");
		setIcon(icon, "circle-dot");
		fab.append(icon);

		fab.addEventListener("pointerdown", this.onPointerDown);
		fab.addEventListener("pointermove", this.onPointerMove);
		fab.addEventListener("pointerup", this.onPointerUp);
		fab.addEventListener("pointercancel", this.onPointerUp);

		doc.body.appendChild(fab);
		return fab;
	}

	private register() {
		this.leafChangeRef = this.workspace.on("active-leaf-change", this.onLeafChange);
		window.addEventListener("resize", this.onResize);
		this.updateVisibility();
	}

	private onSwipe(direction: Direction) {
		const commandId = this.plugin.settings[SWIPE_COMMAND_KEYS[direction]];
		this.runCommand(commandId);
	}

	/**
	 * Execute a command by its full Obsidian id (e.g. "neighbouring-files:next").
	 * Works for this plugin's commands and any other installed command.
	 */
	private runCommand(commandId: string) {
		if (!commandId) return;
		const result = appCommands(this.plugin.app).executeCommandById(commandId);
		if (typeof result === "object" && result !== null) {
			void result.then((executed) => {
				if (!executed) new Notice(`Command not found: ${commandId}`);
			});
		} else if (result === false) {
			new Notice(`Command not found: ${commandId}`);
		}
	}

	onunload() {
		window.removeEventListener("resize", this.onResize);
		this.workspace.offref(this.leafChangeRef);
		this.fabEl.remove();
	}
}
