import NeighbouringFileNavigator from "NeighbouringFileNavigator";
import { TFile, TFolder } from "obsidian";

const addFile = (name: string, dir?: TFolder): TFile => {
	const file = new TFile();
	file.name = name;
	file.extension = name.split('.').pop() || '';
	file.basename = name.split('.').shift() || '';
	dir?.children.push(file);
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
		const file: TFile = createFolder('1.md', ['2.md', '3.md']);

		// WHEN
		const files = NeighbouringFileNavigator.getNeighbouringFiles(file)

		console.log(files?.map(f => f.name));

		// THEN
		expect(files).toBeTruthy();
		expect(files).toContain(file);
		file.parent?.children.forEach(child => expect(files).toContain(child));
	});

	it('should only filter for markdown files', () => {
		// GIVEN
		const file: TFile = createFolder('1.md', ['2.md', '3.pdf']);

		// WHEN
		const files = NeighbouringFileNavigator.getNeighbouringFiles(file)

		console.log(files?.map(f => f.name));

		// THEN
		expect(files).toBeTruthy();
		expect(files).toHaveLength(2)
		expect(files).toContain(file.parent?.children[0]);
		expect(files).toContain(file.parent?.children[1]);
	});

});
