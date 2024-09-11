import NeighbouringFileNavigator from "NeighbouringFileNavigator";
import { Notice, Plugin, UserEvent } from "obsidian";

export type IDirection = "left" | "right";
interface TouchDelta {
  x: number;
  y: number;
}

const MIN_X_THRESHOLD = 20;
const MAX_Y_THRESHOLD = 50;
const TWO_FINGER_SWIPE_THRESHOLD = 120;

function sameDirection(delta1: number, delta2: number) {
  return delta1 * delta2 > 0 || delta1 === delta2;
}

type IGestureState =
  | "notouch"
  | "considering"
  | "invalid"
  | "tracking"
  | "complete";

export class SwipeManager {
  private touchDeltas: TouchDelta[];
  private onTwoFingerSwipe: (dir: IDirection) => void;

  private gestureState: IGestureState = "notouch";

  constructor(onTwoFingerSwipe: (dir: IDirection) => void) {
    this.onTwoFingerSwipe = onTwoFingerSwipe;

    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
  }

  handleTouchStart(e: TouchEvent): void {
    if (this.gestureState === "notouch" && e.touches.length === 2) {
      this.gestureState = "considering";
    } else {
      return;
    }
		new Notice("⇢ Touch Start");

    this.touchDeltas = [];

    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      this.touchDeltas.push({
        x: touch.clientX,
        y: touch.clientY,
      });
    }
  }

  handleTouchMove(e: TouchEvent): void {
    if (["considering", "tracking"].includes(this.gestureState)) {
      e.stopImmediatePropagation();
    }

		new Notice("⇢ Touch Move");
    if (this.gestureState === "considering") {
      const fingerOneDelta = this.touchDeltas[0];
      const x1Diff = fingerOneDelta.x - e.touches[0].clientX;
      const y1Diff = fingerOneDelta.y - e.touches[0].clientY;

      const fingerTwoDelta = this.touchDeltas[0];
      const x2Diff = fingerTwoDelta.x - e.touches[0].clientX;
      const y2Diff = fingerTwoDelta.y - e.touches[0].clientY;

      if (
        Math.abs(y1Diff) > MAX_Y_THRESHOLD ||
        Math.abs(y2Diff) > MAX_Y_THRESHOLD ||
        !sameDirection(x1Diff, x2Diff)
      ) {
        this.gestureState = "invalid";
      }

      if (
        Math.abs(x1Diff) > MIN_X_THRESHOLD ||
        Math.abs(x2Diff) > MIN_X_THRESHOLD
      ) {
        this.gestureState = "tracking";
        e.stopImmediatePropagation();
      }
    }
  }

  handleTouchEnd(e: TouchEvent): void {
    if (this.gestureState === "tracking" || this.gestureState === "complete") {
      e.stopImmediatePropagation();
    }


		new Notice("⇢ Touch End");

    if (this.gestureState === "tracking") {
      const fingerOneDelta = this.touchDeltas[0];
      const x1Diff = fingerOneDelta.x - e.touches[0].clientX;

      const fingerTwoDelta = this.touchDeltas[0];
      const x2Diff = fingerTwoDelta.x - e.touches[0].clientX;

      if (x1Diff && x2Diff > TWO_FINGER_SWIPE_THRESHOLD) {
        this.onTwoFingerSwipe("left");
      } else if (x1Diff && x2Diff < -TWO_FINGER_SWIPE_THRESHOLD) {
        this.onTwoFingerSwipe("right");
      }
      this.gestureState = "complete";
    }

    if (e.touches.length === 0) {
      this.gestureState = "notouch";
    }
  }
}


export default class NeighbouringFileNavigatorPlugin extends Plugin {
	private swipeManager: SwipeManager;

	handleSwipe(direction: IDirection): void {
		new Notice("⇢ Touch forward");
		if (direction === "right") {
			history.back();
			new Notice("⇠ Go back");
			NeighbouringFileNavigator.navigateToNeighbouringFile(this.app.workspace, true)
		} else {
			history.forward();
			new Notice("⇢ Go forward");
			NeighbouringFileNavigator.navigateToNeighbouringFile(this.app.workspace, false)
		}
	}

	async onload() {

		this.handleSwipe = this.handleSwipe.bind(this);
		this.swipeManager = new SwipeManager(this.handleSwipe);

		document.body.addEventListener(
			"touchstart",
			this.swipeManager.handleTouchStart,
			false
		);
		document.body.addEventListener(
			"touchmove",
			this.swipeManager.handleTouchMove,
			true
		);
		document.body.addEventListener(
			"touchend",
			this.swipeManager.handleTouchEnd,
			false
		);

		this.addCommand({
			id: "next",
			name: "Navigate to next file",
			callback: () => NeighbouringFileNavigator.navigateToNeighbouringFile(this.app.workspace, true),
		});

		this.addCommand({
			id: "prev",
			name: "Navigate to previous file",
			callback: () => NeighbouringFileNavigator.navigateToNeighbouringFile(this.app.workspace, false),
		});
	}

	onunload() { }
}
