import NeighbouringFileNavigatorPluginSettings, {
	SORT_ORDER,
} from "NeighbouringFileNavigatorPluginSettings";
import { TAbstractFile, TFile, TFolder, Workspace } from "obsidian";

export type SortFn = (a: TFile, b: TFile) => number;

export class NeighbouringFileNavigator {
	private readonly settings: NeighbouringFileNavigatorPluginSettings;

	constructor(settings: NeighbouringFileNavigatorPluginSettings) {
		this.settings = settings;
	}

	public static readonly localeSorter: SortFn = (a: TFile, b: TFile) =>
		a.basename.localeCompare(b.basename, undefined, {
			numeric: true,
			sensitivity: "base",
		});

	public static readonly mtimeSorter: SortFn = (a: TFile, b: TFile) => {
		return b.stat.mtime - a.stat.mtime;
	};

	public static readonly ctimeSorter: SortFn = (a: TFile, b: TFile) => {
		return b.stat.ctime - a.stat.ctime;
	};

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
		return (
			(workspace.getLeavesOfType("file-explorer")?.first()?.getViewState()
				?.state?.sortOrder as SORT_ORDER) ??
			this.settings.defaultSortOrder
		);
	}

	public navigateToNextFile(workspace: Workspace) {
		const sortOrder = this.getFileExplorerSortOrder(workspace);
		console.debug("navigateToNextFile with sortOrder", sortOrder);
		const sortFn = NeighbouringFileNavigator.sorters[sortOrder];
		this.navigateToNeighbouringFile(workspace, sortFn, true);
	}

	public navigateToPrevFile(workspace: Workspace) {
		const sortOrder = this.getFileExplorerSortOrder(workspace);
		console.debug("navigateToPrevFile with sortOrder", sortOrder);
		const sortFn = NeighbouringFileNavigator.sorters[sortOrder];
		this.navigateToNeighbouringFile(workspace, sortFn, false);
	}

	public navigateToNextAlphabeticalFile(workspace: Workspace) {
		console.debug("navigateToNextAlphabeticalFile");
		this.navigateToNeighbouringFile(
			workspace,
			NeighbouringFileNavigator.sorters.alphabetical,
			true
		);
	}

	public navigateToPrevAlphabeticalFile(workspace: Workspace) {
		console.debug("navigateToPrevAlphabeticalFile");
		this.navigateToNeighbouringFile(
			workspace,
			NeighbouringFileNavigator.sorters.alphabetical,
			false
		);
	}

	public navigateToOlderCreatedFile(workspace: Workspace) {
		console.debug("navigateToOlderCreatedFile");
		this.navigateToNeighbouringFile(
			workspace,
			NeighbouringFileNavigator.sorters.byCreatedTime,
			true
		);
	}

	public navigateToNewerCreatedFile(workspace: Workspace) {
		console.debug("navigateToNewerCreatedFile");
		this.navigateToNeighbouringFile(
			workspace,
			NeighbouringFileNavigator.sorters.byCreatedTimeReverse,
			true
		);
	}

	public navigateToOlderModifiedFile(workspace: Workspace) {
		console.debug("navigateToOlderModifiedFile");
		this.navigateToNeighbouringFile(
			workspace,
			NeighbouringFileNavigator.sorters.byModifiedTime,
			true
		);
	}

	public navigateToNewerModifiedFile(workspace: Workspace) {
		console.debug("navigateToNewerModifiedFile");
		this.navigateToNeighbouringFile(
			workspace,
			NeighbouringFileNavigator.sorters.byModifiedTimeReverse,
			true
		);
	}

	public navigateToNeighbouringFile(
		workspace: Workspace,
		sortFn: SortFn,
		forward = true
	) {
		const activeFile = workspace.getActiveFile();
		if (!activeFile) return;

		const files = this.getNeighbouringFiles(activeFile, sortFn);
		if (!files.length) return;

		const currentItem = files.findIndex(
			(item) => item.name === activeFile.name
		);

		if (currentItem === -1) return;

		const delta = forward ? 1 : -1;
		const tentativeIndex = currentItem + delta;
		const isAtBoundary =
			tentativeIndex < 0 || tentativeIndex >= files.length;
		// loop inside folders
		const nextIndex = this.settings.enableFolderLoop
			? isAtBoundary
				? forward
					? 0
					: files.length - 1
				: tentativeIndex
			: Math.max(0, Math.min(tentativeIndex, files.length - 1));

		let toFile = files[nextIndex];

		const atFolderBoundary =
			!this.settings.enableFolderLoop &&
			nextIndex === currentItem &&
			isAtBoundary &&
			(forward ? currentItem === files.length - 1 : currentItem === 0);

		if (atFolderBoundary && this.settings.enableFolderBoundary) {
			const boundaryFile = this.findBoundaryFile(
				activeFile,
				sortFn,
				forward
			);
			if (boundaryFile) {
				toFile = boundaryFile;
			}
		}

		if (!toFile) return;
		workspace.getLeaf(false).openFile(toFile);
	}

	private filterFiletype(file: TFile) {
		if (this.settings.includedFileTypes === "allFiles") return true;

		if (this.settings.includedFileTypes === "markdownOnly") {
			return file.extension === "md";
		} else if (this.settings.includedFileTypes === "additionalExtensions") {
			return (
				file.extension === "md" ||
				this.settings.additionalExtensions.includes(file.extension)
			);
		}
	}

	public getNeighbouringFiles(file: TFile, sortFn: SortFn): TFile[] {
		return file.parent
			? this.getSortedFilesInFolder(file.parent, sortFn)
			: [];
	}

	private getSortedFilesInFolder(folder: TFolder, sortFn: SortFn): TFile[] {
		return (
			folder.children
				?.filter((child): child is TFile => child instanceof TFile)
				.filter((file) => this.filterFiletype(file))
				.sort(sortFn) ?? []
		);
	}

	private findBoundaryFile(
		activeFile: TFile,
		sortFn: SortFn,
		forward: boolean
	): TFile | undefined {
		let currentFolder = activeFile.parent;
		if (!currentFolder) return undefined;

		while (currentFolder && currentFolder.parent) {
			const parentFolder: TFolder = currentFolder.parent;
			const siblingFolders =
				parentFolder.children?.filter(
					(child: TAbstractFile): child is TFolder =>
						child instanceof TFolder
				) ?? [];
			const folderIndex = siblingFolders.findIndex(
				(folder: TFolder) => folder === currentFolder
			);

			if (folderIndex !== -1) {
				const step = forward ? 1 : -1;
				for (
					let index = folderIndex + step;
					index >= 0 && index < siblingFolders.length;
					index += step
				) {
					const folder = siblingFolders[index];
					const sortedFiles = this.getSortedFilesInFolder(
						folder,
						sortFn
					);
					if (sortedFiles.length) {
						return forward
							? sortedFiles[0]
							: sortedFiles[sortedFiles.length - 1];
					}
				}
			}

			const parentFiles = this.getSortedFilesInFolder(
				parentFolder,
				sortFn
			);
			if (parentFiles.length) {
				return forward
					? parentFiles[0]
					: parentFiles[parentFiles.length - 1];
			}

			currentFolder = parentFolder;
		}

		return undefined;
	}
}
