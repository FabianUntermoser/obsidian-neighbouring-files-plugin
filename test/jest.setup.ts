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

// Obsidian also patches Document with a createEl/createSpan helper. jsdom only
// has createElement, so mirror the minimal shape MobileFab uses.
if (typeof Document !== "undefined") {
	(
		Document.prototype as unknown as {
			createEl: (tag: string, options?: Record<string, unknown>) => HTMLElement;
			createSpan: (options?: Record<string, unknown>) => HTMLSpanElement;
		}
	).createEl = function (
		this: Document,
		tag: string,
		options?: Record<string, unknown>
	): HTMLElement {
		const el = this.createElement(tag);
		if (options?.cls) el.className = String(options.cls);
		const attr = options?.attr as Record<string, string> | undefined;
		if (attr) {
			for (const key in attr) {
				el.setAttribute(key, attr[key]);
			}
		}
		return el;
	};
	(
		Document.prototype as unknown as {
			createEl: (tag: string, options?: Record<string, unknown>) => HTMLElement;
			createSpan: (options?: Record<string, unknown>) => HTMLSpanElement;
		}
	).createSpan = function (this: Document, options?: Record<string, unknown>): HTMLSpanElement {
		return (
			this as unknown as {
				createEl: (tag: string, options?: Record<string, unknown>) => HTMLElement;
			}
		).createEl("span", options) as HTMLSpanElement;
	};
}
