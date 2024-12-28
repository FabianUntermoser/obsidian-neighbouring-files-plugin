import { TFile, Workspace } from "obsidian";

export default class NeighbouringFileNavigator {

	public static navigateToNextFile(workspace: Workspace) {
		console.debug("navigateToNextFile");
		this.navigateToNeighbouringFile(workspace, true);
	}

	public static navigateToPrevFile(workspace: Workspace) {
		console.debug("navigateToPrevFile");
		this.navigateToNeighbouringFile(workspace, false);
	}

	public static navigateToNextModifiedFile(workspace: Workspace) {
		console.debug("navigateToNextModifiedFile");
		// NOT IMPLEMENTED
		this.navigateToNeighbouringFile(workspace, false);
	}

	public static navigateToPrevModifiedFile(workspace: Workspace) {
		console.debug("navigateToPrevModifiedFile");
		// NOT IMPLEMENTED
	}

	public static navigateToNextCreatedFile(workspace: Workspace) {
		console.debug("navigateToNextCreatedFile");
		// NOT IMPLEMENTED
	}

	public static navigateToPrevCreatedFile(workspace: Workspace) {
		console.debug("navigateToPrevCreatedFile");
		// NOT IMPLEMENTED
	}


	public static navigateToNeighbouringFile(workspace: Workspace, next?: boolean) {
		const activeFile = workspace.getActiveFile();
		if (!activeFile) return;

		const files = NeighbouringFileNavigator.getNeighbouringFiles(activeFile);
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

	public static getNeighbouringFiles(file: TFile) {
		const files = file?.parent?.children;
		const filteredFiles = files?.filter(f => f instanceof TFile && f.extension === 'md') as TFile[];
		const sortedFiles = filteredFiles?.sort((a, b) =>
			a.basename.localeCompare(b.basename, undefined, {
				numeric: true,
				sensitivity: 'base',
			}))
		return sortedFiles;
	}

}
