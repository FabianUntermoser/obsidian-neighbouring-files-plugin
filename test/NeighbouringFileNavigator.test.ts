import { NeighbouringFileNavigator } from "NeighbouringFileNavigator";
import NeighbouringFileNavigatorPluginSettings, {
	DEFAULT_SETTINGS,
} from "NeighbouringFileNavigatorPluginSettings";
import { FileStats, TAbstractFile, TFile, TFolder } from "obsidian";

const createNote = (name: string, stats?: FileStats): TFile =>
	createFile(name, "md", stats);

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

const createFolder = (
	name: string,
	children: Array<TAbstractFile> = []
): TFolder => {
	const folder = createDir(name);
	setup(children, folder);
	return folder;
};

const setup = (
	children: Array<TAbstractFile>,
	parent: TFolder = new TFolder()
) => {
	parent.children = children;
	children.forEach((c) => {
		c.parent = parent;
	});
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
		it("contains all files", () => {
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

		it("filters markdown files only", () => {
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

		it("filters out directories", () => {
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

		it("sorts files", () => {
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

		it("sorts case-insensitively", () => {
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

		it("sorts johny decimal", () => {
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

		it("sorts by creation time", () => {
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

		it("sorts by modified time", () => {
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

	describe("Settings: File Types", () => {
		beforeEach(() => {
			settings.includedFileTypes = "markdownOnly";
			settings.additionalExtensions = ["canvas", "pdf"];
		});

		it("includes markdown only", () => {
			// GIVEN
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

		it("includes specified extensions", () => {
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

		it("includes all files", () => {
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

	describe("Settings: Folder Loop", () => {
		beforeEach(() => {
			settings.enableFolderLoop = false;
		});

		it("loops folder", () => {
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

		it("does not loop folder", () => {
			// GIVEN
			const files = setupFiles(["1", "2", "3"]);
			workspace.getActiveFile.mockReturnValue(files[2]);

			// WHEN
			navigator.navigateToNextAlphabeticalFile(workspace);

			// THEN
			expect(leaf.openFile).toHaveBeenCalledWith(files[2]);
			expect(leaf.openFile).not.toHaveBeenCalledWith(files[0]);
			expect(leaf.openFile).not.toHaveBeenCalledWith(files[1]);
		});
	});

	describe("Settings: Folder Boundaries", () => {
		beforeEach(() => {
			settings.enableFolderLoop = false;
			settings.enableFolderBoundary = true;
		});

		it("crosses to next folder", () => {
			// GIVEN
			const fromFile = createNote("3");
			const expectedFile = createNote("4");
			setup([
				createFolder("FolderA", [fromFile]),
				createFolder("FolderB", [expectedFile]),
			]);
			workspace.getActiveFile.mockReturnValue(fromFile);
			// WHEN
			navigator.navigateToNextAlphabeticalFile(workspace);

			// THEN
			expect(leaf.openFile).toHaveBeenCalledWith(expectedFile);
		});

		it("crosses forward into nested sibling", () => {
			// GIVEN
			const fileA = createNote("A");
			const fileB = createNote("B");
			setup([
				createFolder("FolderA", [fileA]),
				createFolder("FolderB", [createFolder("FolderBSub", [fileB])]),
			]);
			workspace.getActiveFile.mockReturnValue(fileA);
			// WHEN
			navigator.navigateToNextAlphabeticalFile(workspace);

			// THEN
			expect(leaf.openFile).toHaveBeenCalledWith(fileB);
		});

		it("crosses backward into deepest sibling", () => {
			// GIVEN
			const fileA1 = createNote("A1");
			const expectedFile = createNote("A2");
			const fileB = createNote("B");
			setup([
				createFolder("FolderA", [
					fileA1,
					createFolder("FolderASub", [expectedFile]),
				]),
				createFolder("FolderB", [fileB]),
			]);
			workspace.getActiveFile.mockReturnValue(fileB);
			// WHEN
			navigator.navigateToPrevAlphabeticalFile(workspace);

			// THEN
			expect(leaf.openFile).toHaveBeenCalledWith(expectedFile);
		});

		it("falls back to ancestor file", () => {
			// GIVEN
			const fileInE = createNote("Ancestor File");
			const fileA1 = createNote("File A1");
			setup([
				createFolder("FolderD", [
					createFolder("FolderE", [
						fileInE,
						createFolder("FolderC", [
							createFolder("FolderA", [fileA1]),
						]),
					]),
				]),
			]);

			workspace.getActiveFile.mockReturnValue(fileA1);
			// WHEN
			navigator.navigateToPrevAlphabeticalFile(workspace);

			// THEN
			expect(leaf.openFile).toHaveBeenCalledWith(fileInE);
		});
	});

	describe("Folder Navigation Commands", () => {
		it("goes to parent folder", () => {
			// GIVEN
			const rootFile1 = createNote("1");
			const fileA1 = createNote("A1");
			setup([rootFile1, createFolder("FolderA", [fileA1])]);
			workspace.getActiveFile.mockReturnValue(fileA1);

			// WHEN
			navigator.navigateToParentFolder(workspace);

			// THEN
			expect(leaf.openFile).toHaveBeenCalledWith(rootFile1);
		});

		it("goes to first child folder", () => {
			// GIVEN
			const rootFile = createNote("Root");
			const fileB1 = createNote("B1");
			setup([rootFile, createFolder("FolderB", [fileB1])]);
			workspace.getActiveFile.mockReturnValue(rootFile);

			// WHEN
			navigator.navigateToFirstChildFolder(workspace);

			// THEN
			expect(leaf.openFile).toHaveBeenCalledWith(fileB1);
		});

		it("goes to next sibling folder", () => {
			// GIVEN
			const fileA1 = createNote("A1");
			const fileC1 = createNote("C1");
			setup([
				createFolder("FolderA", [fileA1]),
				createFolder("FolderB", []),
				createFolder("FolderC", [fileC1]),
			]);
			workspace.getActiveFile.mockReturnValue(fileA1);

			// WHEN
			navigator.navigateToNextSiblingFolder(workspace);

			// THEN
			expect(leaf.openFile).toHaveBeenCalledWith(fileC1);
		});

		it("goes to previous sibling folder", () => {
			// GIVEN
			const fileA1 = createNote("A1");
			const fileA2 = createNote("A2");
			const fileC1 = createNote("C1");
			setup([
				createFolder("FolderA", [fileA1, fileA2]),
				createFolder("FolderB", []),
				createFolder("FolderC", [fileC1]),
			]);
			workspace.getActiveFile.mockReturnValue(fileC1);

			// WHEN
			navigator.navigateToPrevSiblingFolder(workspace);

			// THEN
			expect(leaf.openFile).toHaveBeenCalledWith(fileA2);
		});
	});
});
