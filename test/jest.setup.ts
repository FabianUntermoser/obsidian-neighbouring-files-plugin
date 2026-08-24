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
