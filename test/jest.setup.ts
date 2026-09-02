// Obsidian patches HTMLElement with a few extra methods that MobileFab relies
// on. jsdom doesn't provide them, so polyfill the ones the FAB actually uses.
// Applied before each test file that runs in a DOM environment.
if (typeof HTMLElement !== "undefined") {
	HTMLElement.prototype.addClass = function (className: string) {
		this.classList.add(className);
	};
	HTMLElement.prototype.removeClass = function (className: string) {
		this.classList.remove(className);
	};
	HTMLElement.prototype.setCssProps = function (props: Record<string, string>) {
		const propNames = Object.keys(props);
		for (const prop of propNames) {
			this.style.setProperty(prop, props[prop]);
		}
	};
	HTMLElement.prototype.setPointerCapture = function () {};
}

// Obsidian also patches Document and HTMLElement with createEl/createSpan
// helpers (document.body.createEl, this.contentEl.createSpan, etc.). jsdom
// only has createElement, so mirror the minimal shape MobileFab uses. Both
// prototypes share one implementation since the helpers accept any element
// or document as `this`.

/**
 * Resolve the owning document for the `this` receiver. A Document is itself
 * the document; an element exposes it via ownerDocument.
 */
const owningDoc = (receiver: unknown): Document => {
	if (typeof Document !== "undefined" && receiver instanceof Document) return receiver;
	return (receiver as { ownerDocument?: Document }).ownerDocument ?? (receiver as Document);
};

/** Minimal shape of the Obsidian createEl options MobileFab uses. */
type CreateElOptions = {
	cls?: string;
	attr?: Record<string, string>;
};

// Names avoid the ambient `createEl`/`createSpan` globals declared by the
// Obsidian typings (obsidian.d.ts `declare global`), which would collide.
const makeEl = function (this: unknown, tag: string, options?: CreateElOptions): HTMLElement {
	const el = owningDoc(this).createElement(tag);
	if (options?.cls) el.className = options.cls;
	const attr = options?.attr;
	if (attr) {
		for (const key in attr) {
			el.setAttribute(key, attr[key]);
		}
	}
	// Obsidian's createEl appends the new element to the receiver by default;
	// a Document appends to its body.
	const node = this as Node | null;
	if (node) {
		if (node.nodeType === 9) {
			(node as Document).body.appendChild(el);
		} else {
			node.appendChild(el);
		}
	}
	return el;
};
const makeSpan = function (this: unknown, options?: CreateElOptions): HTMLSpanElement {
	return makeEl.call(this, "span", options);
};

type CreateHelperTarget = {
	createEl: (this: unknown, tag: string, options?: CreateElOptions) => HTMLElement;
	createSpan: (this: unknown, options?: CreateElOptions) => HTMLSpanElement;
};

if (typeof Document !== "undefined") {
	Object.assign(Document.prototype as unknown as CreateHelperTarget, {
		createEl: makeEl,
		createSpan: makeSpan,
	});
}
if (typeof HTMLElement !== "undefined") {
	Object.assign(HTMLElement.prototype as unknown as CreateHelperTarget, {
		createEl: makeEl,
		createSpan: makeSpan,
	});
}
