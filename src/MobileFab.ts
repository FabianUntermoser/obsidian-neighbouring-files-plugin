import { Workspace, setIcon } from "obsidian";
import type NeighbouringFileNavigatorPlugin from "./main";

const SWIPE_THRESHOLD = 40;
const TAP_THRESHOLD = 10;
const TAP_TIMEOUT = 400;
const MOVE_TOLERANCE = 8;

type Direction = "left" | "right" | "up" | "down";

const SWIPE_COMMAND_KEYS: Record<
	Direction,
	| "fabSwipeLeftCommand"
	| "fabSwipeRightCommand"
	| "fabSwipeUpCommand"
	| "fabSwipeDownCommand"
> = {
	left: "fabSwipeLeftCommand",
	right: "fabSwipeRightCommand",
	up: "fabSwipeUpCommand",
	down: "fabSwipeDownCommand",
};

/**
 * Mobile floating action button.
 *
 * Tap opens the config screen, swipes run the configured commands.
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
	private startX = 0;
	private startY = 0;
	private startTime = 0;

	constructor(plugin: NeighbouringFileNavigatorPlugin) {
		this.plugin = plugin;
		this.workspace = plugin.app.workspace;
		this.fabEl = this.buildFab();
		this.register();
	}

	private buildFab(): HTMLElement {
		const doc = window.activeDocument;
		const fab = doc.createElement("button");
		fab.className = "neighbouring-files-fab";
		fab.setAttribute("aria-label", "Navigate to neighbouring files");
		fab.type = "button";

		const prevIcon = doc.createElement("span");
		setIcon(prevIcon, "chevron-left");
		const nextIcon = doc.createElement("span");
		setIcon(nextIcon, "chevron-right");
		fab.append(prevIcon, nextIcon);

		fab.addEventListener("pointerdown", this.onPointerDown);
		fab.addEventListener("pointermove", this.onPointerMove);
		fab.addEventListener("pointerup", this.onPointerUp);
		fab.addEventListener("pointercancel", this.onPointerUp);

		doc.body.appendChild(fab);
		return fab;
	}

	private register() {
		this.leafChangeRef = this.workspace.on("active-leaf-change", this.onLeafChange);
		this.updateVisibility();
	}

	private onLeafChange = () => {
		this.updateVisibility();
	};

	private updateVisibility = () => {
		this.fabEl.classList.toggle("is-visible", Boolean(this.workspace.getActiveFile()));
	};

	private onPointerDown = (ev: PointerEvent) => {
		this.tracking = true;
		this.swiped = false;
		this.startX = ev.clientX;
		this.startY = ev.clientY;
		this.startTime = Date.now();
		this.fabEl.setPointerCapture(ev.pointerId);
		// disable the transform transition so the FAB follows the finger
		this.fabEl.addClass("is-dragging");
	};

	private onPointerMove = (ev: PointerEvent) => {
		if (!this.tracking) return;
		const dx = ev.clientX - this.startX;
		const dy = ev.clientY - this.startY;
		const horizontal = Math.abs(dx) > Math.abs(dy);
		const axisDelta = horizontal ? dx : dy;
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
		const clampedDelta = Math.max(-SWIPE_THRESHOLD, Math.min(SWIPE_THRESHOLD, axisDelta));
		this.fabEl.setCssProps({
			"--fab-drag-x": horizontal ? `${clampedDelta}px` : "0px",
			"--fab-drag-y": horizontal ? "0px" : `${clampedDelta}px`,
		});
	};

	private onPointerUp = (ev: PointerEvent) => {
		if (!this.tracking) return;
		this.tracking = false;
		this.fabEl.removeClass("is-dragging");
		this.fabEl.setCssProps({ "--fab-drag-x": "0px", "--fab-drag-y": "0px" });
		if (ev.type === "pointercancel") return;
		const dx = ev.clientX - this.startX;
		const dy = ev.clientY - this.startY;
		const duration = Date.now() - this.startTime;
		if (!this.swiped && Math.hypot(dx, dy) < TAP_THRESHOLD && duration < TAP_TIMEOUT) {
			this.plugin.openFabConfig();
		}
	};

	private onSwipe(direction: Direction) {
		const commandId = this.plugin.settings[SWIPE_COMMAND_KEYS[direction]];
		this.plugin.runFabCommand(commandId);
	}

	onunload() {
		this.workspace.offref(this.leafChangeRef);
		this.fabEl.remove();
	}
}
