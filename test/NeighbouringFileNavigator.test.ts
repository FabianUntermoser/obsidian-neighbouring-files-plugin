import NeighbouringFileNavigator from "NeighbouringFileNavigator";
import { TAbstractFile, TFile, TFolder } from "obsidian";

const addFile = (name: string, dir?: TFolder): TFile => {
	const file = new TFile();
	file.name = name;
	file.extension = name.split('.').pop() || '';
	file.basename = name.split('.').shift() || '';
	dir?.children.push(file);
	return file;
};

const createFile = (name: string, extension: string = "md"): TFile => {
	const f = new TFile();
	f.basename = name;
	f.extension = extension;
	f.name = `${name}.${extension}`;
	return f;
};

const createDir = (name: string): TFolder => {
	const dir = new TFolder();
	dir.name = name;
	dir.children = [];
	return dir
};

const setup = (children: Array<TAbstractFile>) => {
	const parent = new TFolder();
	parent.children = children;
	children.forEach(c => c.parent = parent);
	return children;
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

	it('should filter out directories', () => {
		// GIVEN
		const dir = setup([
			createFile("1"),
			createDir("somedir")
		]);

		// WHEN
		const files = NeighbouringFileNavigator.getNeighbouringFiles(dir[0] as TFile)

		console.log(files?.map(f => f.name));

		// THEN
		expect(files).toHaveLength(1)
		expect(files).toContain(dir[0]);
	});
});
