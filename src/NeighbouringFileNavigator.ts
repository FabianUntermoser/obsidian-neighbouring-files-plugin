import NeighbouringFileNavigatorPluginSettings, { SORT_ORDER } from "NeighbouringFileNavigatorPluginSettings";
import { TFile, Workspace } from "obsidian";

export type SortFn = (a: TFile, b: TFile) => number;

export class NeighbouringFileNavigator {
	private readonly settings: NeighbouringFileNavigatorPluginSettings;

	constructor(settings: NeighbouringFileNavigatorPluginSettings) {
		this.settings = settings;
	}

	public static readonly localeSorter: SortFn = (a: TFile, b: TFile) =>
		a.basename.localeCompare(
			b.basename,
			undefined,
			{ numeric: true, sensitivity: 'base' }
		);

	public static readonly mtimeSorter: SortFn = (a: TFile, b: TFile) => { return b.stat.mtime - a.stat.mtime; };

	public static readonly ctimeSorter: SortFn = (a: TFile, b: TFile) => { return b.stat.ctime - a.stat.ctime; };

	public static reverse(fn: SortFn): SortFn {
		return (a, b) => -fn(a, b);
	}

	public static readonly sorters: Record<SORT_ORDER, SortFn> = {
		alphabetical: this.localeSorter,
		byCreatedTime: this.ctimeSorter,
		byModifiedTime: this.mtimeSorter,
		alphabeticalReverse: this.reverse(this.localeSorter),
		byCreatedTimeReverse: this.reverse(this.ctimeSorter),
		byModifiedTimeReverse: this.reverse(this.mtimeSorter),
	};

	private getFileExplorerSortOrder(workspace: Workspace): SORT_ORDER {
		return workspace.getLeavesOfType('file-explorer')?.first()?.getViewState()?.state?.sortOrder as SORT_ORDER
			?? this.settings.defaultSortOrder;
	}

	public navigateToNextFile(workspace: Workspace) {
		const sortOrder = this.getFileExplorerSortOrder(workspace);
		console.debug("navigateToNextFile with sortOrder", sortOrder);
		const sortFn = NeighbouringFileNavigator.sorters[sortOrder];
		this.navigateToNeighbouringFile(workspace, sortFn);
	}

	public navigateToPrevFile(workspace: Workspace) {
		const sortOrder = this.getFileExplorerSortOrder(workspace);
		console.debug("navigateToPrevFile with sortOrder", sortOrder);
		const sortFn = NeighbouringFileNavigator.sorters[sortOrder];
		this.navigateToNeighbouringFile(workspace, NeighbouringFileNavigator.reverse(sortFn));
	}

	public navigateToNextAlphabeticalFile(workspace: Workspace) {
		console.debug("navigateToNextAlphabeticalFile");
		this.navigateToNeighbouringFile(workspace, NeighbouringFileNavigator.sorters.alphabetical);
	}

	public navigateToPrevAlphabeticalFile(workspace: Workspace) {
		console.debug("navigateToPrevAlphabeticalFile");
		this.navigateToNeighbouringFile(workspace, NeighbouringFileNavigator.sorters.alphabeticalReverse);
	}

	public navigateToOlderCreatedFile(workspace: Workspace) {
		console.debug("navigateToOlderCreatedFile");
		this.navigateToNeighbouringFile(workspace, NeighbouringFileNavigator.sorters.byCreatedTime);
	}

	public navigateToNewerCreatedFile(workspace: Workspace) {
		console.debug("navigateToNewerCreatedFile");
		this.navigateToNeighbouringFile(workspace, NeighbouringFileNavigator.sorters.byCreatedTimeReverse);
	}

	public navigateToOlderModifiedFile(workspace: Workspace) {
		console.debug("navigateToOlderModifiedFile");
		this.navigateToNeighbouringFile(workspace, NeighbouringFileNavigator.sorters.byModifiedTime);
	}

	public navigateToNewerModifiedFile(workspace: Workspace) {
		console.debug("navigateToNewerModifiedFile");
		this.navigateToNeighbouringFile(workspace, NeighbouringFileNavigator.sorters.byModifiedTimeReverse);
	}

	public navigateToNeighbouringFile(workspace: Workspace, sortFn: SortFn) {
		const activeFile = workspace.getActiveFile();
		if (!activeFile) return;

		const files = this.getNeighbouringFiles(activeFile, sortFn);
		if (!files) return;

		const currentItem = files.findIndex(
			(item) => item.name === activeFile.name
		);

		const nextIndex = this.settings.enableFolderLoop
			? (currentItem + 1) % files.length
			: Math.min(currentItem + 1, files.length - 1);

		const toFile = files[nextIndex];
		workspace.getLeaf(false).openFile(toFile);
	}

	public getNeighbouringFiles(file: TFile, sortFn: SortFn) {
		const files = file?.parent?.children;
		let filteredFiles: TFile[] = [];

		if (this.settings.includedFileTypes === 'markdownOnly') {
			filteredFiles = files?.filter(f => f instanceof TFile && f.extension === 'md') as TFile[];
		} else if (this.settings.includedFileTypes === 'allFiles') {
			filteredFiles = files?.filter(f => f instanceof TFile) as TFile[];
		} else if (this.settings.includedFileTypes === 'additionalExtensions') {
			filteredFiles = files?.filter(f => f instanceof TFile &&
				(f.extension === 'md' || this.settings.additionalExtensions.includes(f.extension))) as TFile[];
		}

		const sortedFiles = filteredFiles?.sort(sortFn);
		return sortedFiles;
	}
}
