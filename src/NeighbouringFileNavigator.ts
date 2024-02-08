import { TFile } from "obsidian";

export default class NeighbouringFileNavigator {

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
