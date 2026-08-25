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

function swipeDirection(horizontal: boolean, dx: number, dy: number): Direction {
	return horizontal ? (dx < 0 ? "left" : "right") : dy < 0 ? "up" : "down";
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
	private pointerHandledTap = false;
	private drawerObserver: MutationObserver | null = null;
	private startX = 0;
	private startY = 0;
	private startTime = 0;

	constructor(plugin: NeighbouringFileNavigatorPlugin) {
		this.plugin = plugin;
		this.workspace = plugin.app.workspace;
		this.fabEl = this.buildFab();
		this.normalizeOffsets();
		this.applyPosition();
		this.register();
	}

	private onLeafChange = () => {
		this.updateVisibility();
	};

	private updateVisibility = () => {
		// hide while a side dock drawer covers the note, so the fab only
		// shows over the current leaf (state classes live on .workspace)
		const workspaceEl = this.workspace.containerEl;
		const dockOpen =
			Boolean(workspaceEl) &&
			(workspaceEl.classList.contains("is-left-sidedock-open") ||
				workspaceEl.classList.contains("is-right-sidedock-open"));
		const show = Boolean(this.workspace.getActiveFile()) && !dockOpen;
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

	private cancelLongPressOnMove(axisDelta: number) {
		if (!this.swiped && Math.abs(axisDelta) > MOVE_TOLERANCE && this.longPressTimer !== null) {
			window.clearTimeout(this.longPressTimer);
			this.longPressTimer = null;
		}
	}

	private nudge(horizontal: boolean, axisDelta: number) {
		const clampedDelta = Math.max(-NUDGE_DISTANCE, Math.min(NUDGE_DISTANCE, axisDelta));
		this.fabEl.setCssProps({
			"--fab-drag-x": horizontal
				? `${this.offsetX() + clampedDelta}px`
				: `${this.offsetX()}px`,
			"--fab-drag-y": horizontal
				? `${this.offsetY()}px`
				: `${this.offsetY() + clampedDelta}px`,
		});
	}

	private onPointerMove = (ev: PointerEvent) => {
		if (!this.tracking) return;
		const dx = ev.clientX - this.startX;
		const dy = ev.clientY - this.startY;
		const horizontal = Math.abs(dx) > Math.abs(dy);
		const axisDelta = horizontal ? dx : dy;
		this.cancelLongPressOnMove(axisDelta);
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
			this.onSwipe(swipeDirection(horizontal, dx, dy));
		}
		this.nudge(horizontal, axisDelta);
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
		// reset the gesture nudge so the button flips back to its resting spot
		this.resetPosition();
		if (!this.swiped && Math.hypot(dx, dy) < TAP_THRESHOLD) {
			this.pointerHandledTap = true;
			this.handleTap();
		}
	};

	private handleTap() {
		// first tap arms, second tap runs the double-tap command
		if (this.doubleTapTimer !== null) {
			window.clearTimeout(this.doubleTapTimer);
			this.doubleTapTimer = null;
			this.runCommand(this.plugin.settings.fabDoubleTapCommand);
			return;
		}
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

	private safeAreaRight() {
		const raw = getComputedStyle(window.activeDocument.documentElement)
			.getPropertyValue("--safe-area-inset-right")
			.trim();
		const px = parseFloat(raw);
		return Number.isFinite(px) ? px : 0;
	}

	/**
	 * Clamp persisted offsets to the current valid range so values written
	 * under older layouts (centered anchor) can not push the button off screen.
	 */
	private normalizeOffsets() {
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		this.plugin.settings.fabOffsetX = clampOffset(
			this.offsetX(),
			-(vw - 80 - this.safeAreaRight()),
			20
		);
		this.plugin.settings.fabOffsetY = clampOffset(this.offsetY(), -(vh - 140), 100);
	}

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
		// right-anchored: negative x moves left, 20px right padding is the flush
		// edge; the minimum keeps the button on screen past the safe area
		this.plugin.settings.fabOffsetX = clampOffset(x, -(vw - 80 - this.safeAreaRight()), 20);
		this.plugin.settings.fabOffsetY = clampOffset(y, -(vh - 140), 100);
		this.applyPosition();
	}

	private onClick = (ev: MouseEvent) => {
		// Pointer taps are handled in onPointerUp; ignore their trailing click.
		if (this.pointerHandledTap) {
			this.pointerHandledTap = false;
			return;
		}
		// Keyboard/assistive activation (no pointer events): run the single-tap command.
		if (ev.detail > 1) return;
		this.runCommand(this.plugin.settings.fabSingleTapCommand);
	};

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
		fab.addEventListener("click", this.onClick);

		doc.body.appendChild(fab);
		return fab;
	}

	private register() {
		this.leafChangeRef = this.workspace.on("active-leaf-change", this.onLeafChange);
		window.addEventListener("resize", this.onResize);
		// the mobile drawer slides in/out without an active-leaf change; watch
		// the is-open class so the fab hides while it covers the note
		this.drawerObserver = new MutationObserver(() => this.updateVisibility());
		this.drawerObserver.observe(window.activeDocument.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ["class"],
		});
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
		if (this.longPressTimer !== null) {
			window.clearTimeout(this.longPressTimer);
			this.longPressTimer = null;
		}
		if (this.singleTapTimer !== null) {
			window.clearTimeout(this.singleTapTimer);
			this.singleTapTimer = null;
		}
		if (this.doubleTapTimer !== null) {
			window.clearTimeout(this.doubleTapTimer);
			this.doubleTapTimer = null;
		}
		this.tracking = false;
		this.dragging = false;
		window.removeEventListener("resize", this.onResize);
		this.drawerObserver?.disconnect();
		this.drawerObserver = null;
		this.workspace.offref(this.leafChangeRef);
		this.fabEl.remove();
	}
}
