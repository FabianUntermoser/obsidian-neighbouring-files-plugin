import { TFile, Workspace } from "obsidian";

export type SortFn = (a: TFile, b: TFile) => number;

export class NeighbouringFileNavigator {

	public static localeSorter: SortFn = (a: TFile, b: TFile) =>
		a.basename.localeCompare(
			b.basename,
			undefined,
			{ numeric: true, sensitivity: 'base' }
		);

	public static mtimeSorter: SortFn = (a: TFile, b: TFile) => { return a.stat.mtime - b.stat.mtime; };

	public static ctimeSorter: SortFn = (a: TFile, b: TFile) => { return a.stat.ctime - b.stat.ctime; };

	public static navigateToNextFile(workspace: Workspace) {
		console.debug("navigateToNextFile");
		this.navigateToNeighbouringFile(workspace, this.localeSorter, true);
	}

	public static navigateToPrevFile(workspace: Workspace) {
		console.debug("navigateToPrevFile");
		this.navigateToNeighbouringFile(workspace, this.localeSorter, false);
	}

	public static navigateToNextCreatedFile(workspace: Workspace) {
		console.debug("navigateToNextCreatedFile");
		this.navigateToNeighbouringFile(workspace, this.ctimeSorter, true);
	}

	public static navigateToPrevCreatedFile(workspace: Workspace) {
		console.debug("navigateToPrevCreatedFile");
		this.navigateToNeighbouringFile(workspace, this.ctimeSorter, false);
	}

	public static navigateToNextModifiedFile(workspace: Workspace) {
		console.debug("navigateToNextModifiedFile");
		this.navigateToNeighbouringFile(workspace, this.mtimeSorter, true);
	}

	public static navigateToPrevModifiedFile(workspace: Workspace) {
		console.debug("navigateToPrevModifiedFile");
		this.navigateToNeighbouringFile(workspace, this.mtimeSorter, false);
	}

	public static navigateToNeighbouringFile(workspace: Workspace, sortFn: SortFn, next?: boolean) {
		const activeFile = workspace.getActiveFile();
		if (!activeFile) return;

		const files = this.getNeighbouringFiles(activeFile, sortFn)
		if (!files) return;

		const currentItem = files.findIndex(
			(item) => item.name === activeFile.name
		);

		const toFile = next
			? files[(currentItem + 1) % files.length]
			: files[
			currentItem == 0
				? files.length - 1
				: (currentItem - 1) % files.length
		];

		workspace.getLeaf(false).openFile(toFile as TFile);
	}

	public static getNeighbouringFiles(file: TFile, sortFn: SortFn) {
		const files = file?.parent?.children;
		const filteredFiles = files?.filter(f => f instanceof TFile && f.extension === 'md') as TFile[];
		const sortedFiles = filteredFiles?.sort(sortFn);
		return sortedFiles;
	}

}
