import { NeighbouringFileNavigator } from "NeighbouringFileNavigator";
import NeighbouringFileNavigatorPluginSettings, { DEFAULT_SETTINGS } from "NeighbouringFileNavigatorPluginSettings";
import { FileStats, TAbstractFile, TFile, TFolder } from "obsidian";

const createNote = (name: string, stats?: FileStats): TFile => createFile(name, "md", stats);

const createFile = (
	name: string,
	extension: string,
	stats?: FileStats
): TFile => {
	const f = new TFile();
	f.basename = name;
	f.extension = extension;
	f.name = `${name}.${extension}`;
	f.stat = stats ?? { ctime: 1, mtime: 1, size: 1 };
	return f;
};

const createDir = (name: string): TFolder => {
	const dir = new TFolder();
	dir.name = name;
	dir.children = [];
	return dir;
};

const setup = (children: Array<TAbstractFile>) => {
	const parent = new TFolder();
	parent.children = children;
	children.forEach((c) => (c.parent = parent));
	return children;
};

const setupFiles = (names: Array<string>) => {
	const children = names.map((c) => createNote(c));
	return setup(children) as TFile[];
};

const expectNeighbours = (files: Array<TFile>) => {
	const names = files?.map((n) => n.basename);
	return expect(names);
};

describe("NeighbouringFileNavigator", () => {
	const settings: NeighbouringFileNavigatorPluginSettings = DEFAULT_SETTINGS;
	const navigator = new NeighbouringFileNavigator(settings);
	const leaf = {
		openFile: jest.fn(),
	} as any;
	const workspace = {
		getActiveFile: jest.fn(),
		getLeaf: jest.fn(() => leaf),
	} as any;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("Sorting", () => {
		it("should contain all files", () => {
			// GIVEN
			const files = setupFiles(["1", "2", "3"]);

			// WHEN
			const neighbours = navigator.getNeighbouringFiles(
				files[0],
				NeighbouringFileNavigator.localeSorter
			);

			// THEN
			expect(neighbours).toHaveLength(3);
			files.forEach((child) => expect(neighbours).toContain(child));
		});

		it("should only filter for markdown files", () => {
			// GIVEN
			const files = setup([
				createNote("1"),
				createNote("2"),
				createFile("3", "pdf"),
			]) as TFile[];

			// WHEN
			const neighbours = navigator.getNeighbouringFiles(
				files[0],
				NeighbouringFileNavigator.localeSorter
			);

			// THEN
			expect(neighbours).toHaveLength(2);
			expect(neighbours).toContain(files[0]);
			expect(neighbours).toContain(files[1]);
		});

		it("should filter out directories", () => {
			// GIVEN
			const files = setup([
				createNote("1"),
				createDir("somedir"),
			]) as TFile[];

			// WHEN
			const neighbours = navigator.getNeighbouringFiles(
				files[0],
				NeighbouringFileNavigator.localeSorter
			);

			// THEN
			expect(neighbours).toHaveLength(1);
			expect(neighbours).toContain(files[0]);
		});

		it("should sort files", () => {
			// GIVEN
			const files = setupFiles(["2", "1", "3"]);

			// WHEN
			const neighbours = navigator.getNeighbouringFiles(
				files[0],
				NeighbouringFileNavigator.localeSorter
			);

			// THEN
			expectNeighbours(neighbours).toEqual(["1", "2", "3"]);
		});

		it("should sort ignoring case", () => {
			// GIVEN
			const files = setupFiles(["test - 3", "Test - 2", "test - 1"]);

			// WHEN
			const neighbours = navigator.getNeighbouringFiles(
				files[0],
				NeighbouringFileNavigator.localeSorter
			);

			// THEN
			expectNeighbours(neighbours).toEqual([
				"test - 1",
				"Test - 2",
				"test - 3",
			]);
		});

		it("should sort johny decimal", () => {
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
			const neighbours = navigator.getNeighbouringFiles(
				files[0],
				NeighbouringFileNavigator.localeSorter
			);

			// THEN
			expectNeighbours(neighbours).toEqual([
				"1",
				"2",
				"2.1",
				"2.2",
				"2.9",
				"2.10",
				"2.11",
				"3",
			]);
		});

		it("should sort files based on creation timestamp", () => {
			// GIVEN
			const files = setup([
				createNote("2", {
					ctime: 1689876543210, // 2023-07-20T01:22:23.210Z
					mtime: 1704025483489, // 2023-12-31T12:24:43.489Z
					size: 4380, // 4.38 KB
				}),
				createNote("1", {
					ctime: 1700989701724, // 2023-11-26T04:01:41.724Z
					mtime: 1692456789100, // 2023-08-19T11:13:09.100Z
					size: 102400, // 100 KB
				}),
				createNote("3", {
					ctime: 1672502400000, // 2023-01-01T00:00:00.000Z
					mtime: 1675180800000, // 2023-02-01T00:00:00.000Z
					size: 5242880, // 5 MB
				}),
			]) as TFile[];

			// WHEN
			const neighbours = navigator.getNeighbouringFiles(
				files[0],
				NeighbouringFileNavigator.ctimeSorter
			);

			// THEN
			expectNeighbours(neighbours).toEqual(["1", "2", "3"]);
		});

		it("should sort files based on modified timestamp", () => {
			// GIVEN
			const files = setup([
				createNote("2", {
					ctime: 1700989701724, // 2023-11-26T04:01:41.724Z
					mtime: 1692456789100, // 2023-08-19T11:13:09.100Z
					size: 5242880, // 5 MB
				}),
				createNote("3", {
					ctime: 1689876543210, // 2023-07-20T01:22:23.210Z
					mtime: 1675180800000, // 2023-02-01T00:00:00.000Z
					size: 102400, // 100 KB
				}),
				createNote("1", {
					ctime: 1672502400000, // 2023-01-01T00:00:00.000Z
					mtime: 1704025483489, // 2023-12-31T12:24:43.489Z
					size: 4380, // 4.38 KB
				}),
			]) as TFile[];

			// WHEN
			const neighbours = navigator.getNeighbouringFiles(
				files[0],
				NeighbouringFileNavigator.mtimeSorter
			);

			// THEN
			expectNeighbours(neighbours).toEqual(["1", "2", "3"]);
		});
	});

	describe("Settings: Folder Loop", () => {
		it("should loop folder", () => {
			// GIVEN
			const files = setupFiles(["1", "2", "3"]);
			workspace.getActiveFile.mockReturnValue(files[2]);
			settings.enableFolderLoop = true;

			// WHEN
			navigator.navigateToNextAlphabeticalFile(workspace);

			// THEN
			expect(leaf.openFile).toHaveBeenCalledWith(files[0]);
			expect(leaf.openFile).not.toHaveBeenCalledWith(files[1]);
			expect(leaf.openFile).not.toHaveBeenCalledWith(files[2]);
		});

		it("should not loop folders", () => {
			// GIVEN
			const files = setupFiles(["1", "2", "3"]);
			workspace.getActiveFile.mockReturnValue(files[2]);
			settings.enableFolderLoop = false;

			// WHEN
			navigator.navigateToNextAlphabeticalFile(workspace);

			// THEN
			expect(leaf.openFile).toHaveBeenCalledWith(files[2]);
			expect(leaf.openFile).not.toHaveBeenCalledWith(files[0]);
			expect(leaf.openFile).not.toHaveBeenCalledWith(files[1]);
		});
	});

	describe("Settings: File Types", () => {
		it("should include markdown only", () => {
			// GIVEN
			settings.includedFileTypes = "markdownOnly";
			const files = setup([
				createNote("1"),
				createNote("2"),
				createFile("3", "txt"),
				createFile("4", "pdf"),
			]);

			// WHEN
			const neighbours = navigator.getNeighbouringFiles(
				files[0] as TFile,
				NeighbouringFileNavigator.localeSorter
			);

			// THEN
			expectNeighbours(neighbours).toEqual(["1", "2"]);
		});

		it("should include specified extensions", () => {
			// GIVEN
			settings.includedFileTypes = "additionalExtensions";
			settings.additionalExtensions = ["pdf"];
			const files = setup([
				createNote("1"),
				createNote("2"),
				createFile("3", "txt"),
				createFile("4", "pdf"),
			]);

			// WHEN
			const neighbours = navigator.getNeighbouringFiles(
				files[0] as TFile,
				NeighbouringFileNavigator.localeSorter
			);

			// THEN
			expectNeighbours(neighbours).toEqual(["1", "2", "4"]);
		});

		it("should include all files", () => {
			// GIVEN
			settings.includedFileTypes = "allFiles";
			const files = setup([
				createNote("1"),
				createNote("2"),
				createFile("3", "txt"),
				createFile("4", "pdf"),
			]);

			// WHEN
			const neighbours = navigator.getNeighbouringFiles(
				files[0] as TFile,
				NeighbouringFileNavigator.localeSorter
			);

			// THEN
			expectNeighbours(neighbours).toEqual(["1", "2", "3", "4"]);
		});
	});
});
