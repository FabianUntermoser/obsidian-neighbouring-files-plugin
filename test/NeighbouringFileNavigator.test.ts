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

	it('should sort modified files', () => {

		const fileStats1: FileStats = {
			ctime: 1672502400000, // 2023-01-01T00:00:00.000Z
			mtime: 1675180800000, // 2023-02-01T00:00:00.000Z
			size: 5242880,        // 5 MB
		};

		const fileStats2: FileStats = {
			ctime: 1689876543210, // 2023-07-20T01:22:23.210Z
			mtime: 1692456789100, // 2023-08-19T11:13:09.100Z
			size: 102400,         // 100 KB
		};

		const fileStats3: FileStats = {
			ctime: 1700989701724, // 2023-11-26T04:01:41.724Z
			mtime: 1704025483489, // 2023-12-31T12:24:43.489Z
			size: 4380,           // 4.38 KB
		};

		const f1 :TFile = createNote("1", fileStats1);
		const f2 :TFile = createNote("2", fileStats2);
		const f3 :TFile = createNote("3", fileStats3);

		// GIVEN
		const files = setup([f3,f2,f1]);

		// WHEN
		const neighbours = NeighbouringFileNavigator.getNeighbouringModifiedFiles(files[0] as TFile)

		// THEN
		expectNeighbours(neighbours).toEqual([ "1", "2", "3" ]);
	});

});
