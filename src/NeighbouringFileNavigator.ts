import NeighbouringFileNavigatorPluginSettings, { SORT_ORDER } from "NeighbouringFileNavigatorPluginSettings";
import { TFile, Workspace } from "obsidian";

export type SortFn = (a: TFile, b: TFile) => number;

export class NeighbouringFileNavigator {

	public static localeSorter: SortFn = (a: TFile, b: TFile) =>
		a.basename.localeCompare(
			b.basename,
			undefined,
			{ numeric: true, sensitivity: 'base' }
		);

	public static mtimeSorter: SortFn = (a: TFile, b: TFile) => { return b.stat.mtime - a.stat.mtime; };

	public static ctimeSorter: SortFn = (a: TFile, b: TFile) => { return b.stat.ctime - a.stat.ctime; };

	public static reverse(fn: SortFn): SortFn {
		return (a, b) => -fn(a, b);
	}

	static sorters: Record<SORT_ORDER, SortFn> = {
		alphabetical: this.localeSorter,
		byCreatedTime: this.ctimeSorter,
		byModifiedTime: this.mtimeSorter,
		alphabeticalReverse: this.reverse(this.localeSorter),
		byCreatedTimeReverse: this.reverse(this.ctimeSorter),
		byModifiedTimeReverse: this.reverse(this.mtimeSorter),
	};

	private static getFileExplorerSortOrder(workspace: Workspace, settings: NeighbouringFileNavigatorPluginSettings): SORT_ORDER {
		return workspace.getLeavesOfType('file-explorer')?.first()?.getViewState()?.state?.sortOrder as SORT_ORDER
			?? settings.defaultSortOrder;
	}

	public static navigateToNextFile(workspace: Workspace, settings: NeighbouringFileNavigatorPluginSettings) {
		const sortOrder = this.getFileExplorerSortOrder(workspace, settings);
		console.debug("navigateToNextFile with sortOrder", sortOrder);
		const sortFn = this.sorters[sortOrder];
		this.navigateToNeighbouringFile(workspace, sortFn);
	}

	public static navigateToPrevFile(workspace: Workspace, settings: NeighbouringFileNavigatorPluginSettings) {
		const sortOrder = this.getFileExplorerSortOrder(workspace, settings);
		console.debug("navigateToPrevFile with sortOrder", sortOrder);
		const sortFn = this.sorters[sortOrder];
		this.navigateToNeighbouringFile(workspace, this.reverse(sortFn));
	}

	public static navigateToNextAlphabeticalFile(workspace: Workspace) {
		console.debug("navigateToNextAlphabeticalFile");
		this.navigateToNeighbouringFile(workspace, this.sorters.alphabetical);
	}

	public static navigateToPrevAlphabeticalFile(workspace: Workspace) {
		console.debug("navigateToPrevAlphabeticalFile");
		this.navigateToNeighbouringFile(workspace, this.sorters.alphabeticalReverse);
	}

	public static navigateToOlderCreatedFile(workspace: Workspace) {
		console.debug("navigateToOlderCreatedFile");
		this.navigateToNeighbouringFile(workspace, this.sorters.byCreatedTime);
	}

	public static navigateToNewerCreatedFile(workspace: Workspace) {
		console.debug("navigateToNewerCreatedFile");
		this.navigateToNeighbouringFile(workspace, this.sorters.byCreatedTimeReverse);
	}

	public static navigateToOlderModifiedFile(workspace: Workspace) {
		console.debug("navigateToOlderModifiedFile");
		this.navigateToNeighbouringFile(workspace, this.sorters.byModifiedTime);
	}

	public static navigateToNewerModifiedFile(workspace: Workspace) {
		console.debug("navigateToNewerModifiedFile");
		this.navigateToNeighbouringFile(workspace, this.sorters.byModifiedTimeReverse);
	}

	public static navigateToNeighbouringFile(workspace: Workspace, sortFn: SortFn) {
		const activeFile = workspace.getActiveFile();
		if (!activeFile) return;

		const files = this.getNeighbouringFiles(activeFile, sortFn)
		if (!files) return;

		const currentItem = files.findIndex(
			(item) => item.name === activeFile.name
		);

		const toFile = files[(currentItem + 1) % files.length];

		workspace.getLeaf(false).openFile(toFile as TFile);
	}

	public static getNeighbouringFiles(file: TFile, sortFn: SortFn) {
		const files = file?.parent?.children;
		const filteredFiles = files?.filter(f => f instanceof TFile && f.extension === 'md') as TFile[];
		const sortedFiles = filteredFiles?.sort(sortFn);
		return sortedFiles;
	}

}
