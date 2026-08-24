/** Basic obsidian abstraction for any file or folder in a vault. */
export abstract class TAbstractFile {
	/**
	 * @public
	 */
	vault: Vault;
	/**
	 * @public
	 */
	path: string;
	/**
	 * @public
	 */
	name: string;
	/**
	 * @public
	 */
	parent: TFolder;
}

/** Tracks file created/modified time as well as file system size. */
export interface FileStats {
	/** @public */
	ctime: number;
	/** @public */
	mtime: number;
	/** @public */
	size: number;
}

/** A regular file in the vault. */
export class TFile extends TAbstractFile {
	stat: FileStats;
	basename: string;
	extension: string;
}

/** A folder in the vault. */
export class TFolder extends TAbstractFile {
	children: TAbstractFile[];

	isRoot(): boolean {
		return false;
	}
}

export class Vault {}

/** Minimal stand-in for the Obsidian plugin entry point. */
export class Plugin {}

/** App is typed as an opaque bag in the plugin; tests pass a stub. */
export type App = {
	commands?: unknown;
	workspace?: unknown;
};

/** Emits a temporary toast. */
export class Notice {
	static instances: Notice[] = [];
	constructor(public message: string) {
		Notice.instances.push(this);
	}
}

export function setIcon() {}

export class Workspace {
	on() {
		return () => {};
	}
	getActiveFile() {
		return null;
	}
	getLeavesOfType() {
		return [];
	}
}
