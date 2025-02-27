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
		this.navigateToNeighbouringFile(workspace, sortFn, settings);
	}

	public static navigateToPrevFile(workspace: Workspace, settings: NeighbouringFileNavigatorPluginSettings) {
		const sortOrder = this.getFileExplorerSortOrder(workspace, settings);
		console.debug("navigateToPrevFile with sortOrder", sortOrder);
		const sortFn = this.sorters[sortOrder];
		this.navigateToNeighbouringFile(workspace, this.reverse(sortFn), settings);
	}

	public static navigateToNextAlphabeticalFile(workspace: Workspace, settings: NeighbouringFileNavigatorPluginSettings) {
		console.debug("navigateToNextAlphabeticalFile");
		this.navigateToNeighbouringFile(workspace, this.sorters.alphabetical, settings);
	}

	public static navigateToPrevAlphabeticalFile(workspace: Workspace, settings: NeighbouringFileNavigatorPluginSettings) {
		console.debug("navigateToPrevAlphabeticalFile");
		this.navigateToNeighbouringFile(workspace, this.sorters.alphabeticalReverse, settings);
	}

	public static navigateToOlderCreatedFile(workspace: Workspace, settings: NeighbouringFileNavigatorPluginSettings) {
		console.debug("navigateToOlderCreatedFile");
		this.navigateToNeighbouringFile(workspace, this.sorters.byCreatedTime, settings);
	}

	public static navigateToNewerCreatedFile(workspace: Workspace, settings: NeighbouringFileNavigatorPluginSettings) {
		console.debug("navigateToNewerCreatedFile");
		this.navigateToNeighbouringFile(workspace, this.sorters.byCreatedTimeReverse, settings);
	}

	public static navigateToOlderModifiedFile(workspace: Workspace, settings: NeighbouringFileNavigatorPluginSettings) {
		console.debug("navigateToOlderModifiedFile");
		this.navigateToNeighbouringFile(workspace, this.sorters.byModifiedTime, settings);
	}

	public static navigateToNewerModifiedFile(workspace: Workspace, settings: NeighbouringFileNavigatorPluginSettings) {
		console.debug("navigateToNewerModifiedFile");
		this.navigateToNeighbouringFile(workspace, this.sorters.byModifiedTimeReverse, settings);
	}

	public static navigateToNeighbouringFile(workspace: Workspace, sortFn: SortFn, settings: NeighbouringFileNavigatorPluginSettings) {
		const activeFile = workspace.getActiveFile();
		if (!activeFile) return;

		const files = this.getNeighbouringFiles(activeFile, sortFn, settings);
		if (!files) return;

		const currentItem = files.findIndex(
			(item) => item.name === activeFile.name
		);

		const toFile = files[(currentItem + 1) % files.length];

		workspace.getLeaf(false).openFile(toFile as TFile);
	}

	public static getNeighbouringFiles(file: TFile, sortFn: SortFn, settings: NeighbouringFileNavigatorPluginSettings) {
		const files = file?.parent?.children;
		let filteredFiles: TFile[] = [];
	
		if (settings.includedFileTypes === 'markdownOnly') {
			filteredFiles = files?.filter(f => f instanceof TFile && f.extension === 'md') as TFile[];
		} else if (settings.includedFileTypes === 'allFiles') {
			filteredFiles = files?.filter(f => f instanceof TFile) as TFile[];
		} else if (settings.includedFileTypes === 'additionalExtensions') {
			filteredFiles = files?.filter(f => f instanceof TFile &&
				(f.extension === 'md' || settings.additionalExtensions.includes(f.extension))) as TFile[];
		}
	
		const sortedFiles = filteredFiles?.sort(sortFn);
		return sortedFiles;
	}

}
