import { Workspace, setIcon } from "obsidian";
import type NeighbouringFileNavigatorPlugin from "./main";

const SWIPE_THRESHOLD = 40;
const TAP_THRESHOLD = 10;
const TAP_TIMEOUT = 400;

/**
 * Mobile floating action button.
 *
 * Tap opens the config screen, swipe left/right run the configured commands.
 * Styling lives in styles.css.
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
		this.leafChangeRef = this.workspace.on("active-leaf-change", this.updateVisibility);
		this.updateVisibility();
	}

	private updateVisibility = () => {
		const hasActiveFile = Boolean(this.workspace.getActiveFile());
		this.fabEl.classList.toggle("is-visible", hasActiveFile);
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
		if (
			!this.swiped &&
			Math.abs(dx) > SWIPE_THRESHOLD &&
			Math.abs(dx) > Math.abs(dy) * 1.5
		) {
			this.swiped = true;
			this.onSwipe(dx < 0 ? "left" : "right");
		}
		const clampedDx = Math.max(-SWIPE_THRESHOLD, Math.min(SWIPE_THRESHOLD, dx));
		this.fabEl.setCssProps({ "--fab-drag-x": `${clampedDx}px` });
	};

	private onPointerUp = (ev: PointerEvent) => {
		if (!this.tracking) return;
		this.tracking = false;
		this.fabEl.removeClass("is-dragging");
		this.fabEl.setCssProps({ "--fab-drag-x": "0px" });
		if (ev.type === "pointercancel") return;
		const dx = ev.clientX - this.startX;
		const dy = ev.clientY - this.startY;
		const duration = Date.now() - this.startTime;
		if (!this.swiped && Math.hypot(dx, dy) < TAP_THRESHOLD && duration < TAP_TIMEOUT) {
			this.plugin.openFabConfig();
		}
	};

	private onSwipe(direction: "left" | "right") {
		const commandId =
			direction === "left"
				? this.plugin.settings.fabSwipeLeftCommand
				: this.plugin.settings.fabSwipeRightCommand;
		this.plugin.runFabCommand(commandId);
	}

	onunload() {
		this.workspace.offref(this.leafChangeRef);
		this.fabEl.remove();
	}
}
