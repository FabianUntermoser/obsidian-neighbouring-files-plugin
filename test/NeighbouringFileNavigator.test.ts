import NeighbouringFileNavigator from "NeighbouringFileNavigator";
import { FileStats, TAbstractFile, TFile, TFolder } from "obsidian";

const createFile = (name: string, extension: string, stats?: FileStats): TFile => {
	const f = new TFile();
	f.basename = name;
	f.extension = extension;
	f.name = `${name}.${extension}`;
	f.stat = stats ? stats : { ctime: 1, mtime: 1, size: 1, };
	return f;
};

const createNote = (name: string, stats?: FileStats): TFile => {
	return createFile(name, "md", stats)
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

const setupFiles = (names: Array<string>) => {
	const children = names.map(c => createNote(c));
	return setup(children);
};

const expectNeighbours = (files : Array<TFile> ) => {
	const names = files?.map(n => n.basename)
	return expect(names)
}

describe('NeighbouringFileNavigator', () => {

	it('should contain all files', () => {
		// GIVEN
		const files = setupFiles(["1", "2", "3"]);

		// WHEN
		const neighbours = NeighbouringFileNavigator.getNeighbouringFiles(files[0] as TFile)

		// THEN
		expect(neighbours).toHaveLength(3)
		files.forEach(child => expect(neighbours).toContain(child));
	});

	it('should only filter for markdown files', () => {
		// GIVEN
		const files = setup([
			createNote("1"),
			createNote("2"),
			createFile("3", "pdf"),
		]);

		// WHEN
		const neighbours = NeighbouringFileNavigator.getNeighbouringFiles(files[0] as TFile)

		// THEN
		expect(neighbours).toHaveLength(2)
		expect(neighbours).toContain(files[0]);
		expect(neighbours).toContain(files[1]);
	});

	it('should filter out directories', () => {
		// GIVEN
		const files = setup([
			createNote("1"),
			createDir("somedir")
		]);

		// WHEN
		const neighbours = NeighbouringFileNavigator.getNeighbouringFiles(files[0] as TFile)

		// THEN
		expect(neighbours).toHaveLength(1)
		expect(neighbours).toContain(files[0]);
	});

	it('should sort files', () => {
		// GIVEN
		const files = setupFiles(["2", "1", "3"]);

		// WHEN
		const neighbours = NeighbouringFileNavigator.getNeighbouringFiles(files[0] as TFile)

		// THEN
		expectNeighbours(neighbours).toEqual(["1", "2", "3"])
	});

	it('should sort ignoring case', () => {
		// GIVEN
		const files = setupFiles(["test - 3", "Test - 2", "test - 1"]);

		// WHEN
		const neighbours = NeighbouringFileNavigator.getNeighbouringFiles(files[0] as TFile)

		// THEN
		expectNeighbours(neighbours).toEqual(["test - 1", "Test - 2", "test - 3"]);
	});

	it('should sort johny decimal', () => {
		// GIVEN
		const files = setupFiles([
			"2.2",
			"1",
			"2.9",
			"2.1",
			"2",
			"3",
			"2.11",
			"2.10",
		]);

		// WHEN
		const neighbours = NeighbouringFileNavigator.getNeighbouringFiles(files[0] as TFile);

		// THEN
		expectNeighbours(neighbours).toEqual([
			"1",
			"2",
			"2.1",
			"2.2",
			"2.9",
			"2.10",
			"2.11",
			"3"
		]);
	});

});
