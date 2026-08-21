export const DEFAULT_SETTINGS: NeighbouringFileNavigatorPluginSettings = {
	// sorting
	defaultSortOrder: "alphabetical",
	// navigation options
	enableFolderLoop: false,
	enableFolderBoundary: false,
	// file mask
	includedFileTypes: "markdownOnly",
	additionalExtensions: ["canvas", "pdf"],
	// mobile fab
	showMobileFab: true,
	fabSwipeLeftCommand: "next",
	fabSwipeRightCommand: "prev",
	fabSwipeUpCommand: "",
	fabSwipeDownCommand: "",
};

export type SORT_ORDER =
	| "alphabetical"
	| "byCreatedTime"
	| "byModifiedTime"
	| "alphabeticalReverse"
	| "byCreatedTimeReverse"
	| "byModifiedTimeReverse";

export type INCLUDED_FILE_TYPES = "markdownOnly" | "allFiles" | "additionalExtensions";

export default interface NeighbouringFileNavigatorPluginSettings {
	defaultSortOrder: SORT_ORDER;
	enableFolderLoop: boolean;
	enableFolderBoundary: boolean;
	includedFileTypes: INCLUDED_FILE_TYPES;
	additionalExtensions: string[];
	showMobileFab: boolean;
	fabSwipeLeftCommand: string;
	fabSwipeRightCommand: string;
	fabSwipeUpCommand: string;
	fabSwipeDownCommand: string;
}
