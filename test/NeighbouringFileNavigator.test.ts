import NeighbouringFileNavigator from "NeighbouringFileNavigator";
import { TAbstractFile, TFile, TFolder } from "obsidian";

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

describe('NeighbouringFileNavigator', () => {

	it('should contain all files', () => {
		// GIVEN
		const files = setup([
			createFile("1"),
			createFile("2"),
			createFile("3"),
		]);

		// WHEN
		const neighbours = NeighbouringFileNavigator.getNeighbouringFiles(files[0] as TFile)

		console.log(neighbours?.map(f => f.name));

		// THEN
		expect(neighbours).toHaveLength(3)
		files.forEach(child => expect(neighbours).toContain(child));
	});

	it('should only filter for markdown files', () => {
		// GIVEN
		const files = setup([
			createFile("1"),
			createFile("2"),
			createFile("3", "pdf"),
		]);

		// WHEN
		const neighbours = NeighbouringFileNavigator.getNeighbouringFiles(files[0] as TFile)

		console.log(neighbours?.map(f => f.name));

		// THEN
		expect(neighbours).toHaveLength(2)
		expect(neighbours).toContain(files[0]);
		expect(neighbours).toContain(files[1]);
	});

	it('should filter out directories', () => {
		// GIVEN
		const files = setup([
			createFile("1"),
			createDir("somedir")
		]);

		// WHEN
		const neighbours = NeighbouringFileNavigator.getNeighbouringFiles(files[0] as TFile)

		console.log(neighbours?.map(f => f.name));

		// THEN
		expect(neighbours).toHaveLength(1)
		expect(neighbours).toContain(files[0]);
	});
});
