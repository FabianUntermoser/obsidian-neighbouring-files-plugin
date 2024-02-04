import NeighbouringFileNavigator from "NeighbouringFileNavigator";
import { TFile, TFolder } from "obsidian";

const addFile = (name: string, dir: TFolder): TFile => {
	const file = new TFile();
	file.extension = 'md';
	file.basename = name;
	file.name = `${name}.md`;
	dir.children.push(file);
	return file;
};

const createFolder = (name: string, neighbours: string[]): TFile => {
	const dir = new TFolder();
	dir.children = [];
	const currentFile = addFile(name, dir);
	currentFile.parent = dir;
	neighbours.forEach(f => addFile(f, dir));
	return currentFile;
}

describe('NeighbouringFileNavigator', () => {
	it('should contain all files', () => {
		// GIVEN
		const file: TFile = createFolder('1', ['2', '3']);

		// WHEN
		const files = NeighbouringFileNavigator.getNeighbouringFiles(file)

		// THEN
		expect(files).toBeTruthy();
		expect(files).toContain(file);
		file.parent?.children.forEach(child => expect(files).toContain(child));
	});
});
