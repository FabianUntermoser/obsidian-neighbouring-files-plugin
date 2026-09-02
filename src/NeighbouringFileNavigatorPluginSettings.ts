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
	fabSwipeLeftCommand: "neighbouring-files:next",
	fabSwipeRightCommand: "neighbouring-files:prev",
	fabSwipeUpCommand: "neighbouring-files:folder-up",
	fabSwipeDownCommand: "neighbouring-files:folder-down",
	fabDoubleTapCommand: "",
	fabSingleTapCommand: "",
	fabHaptics: true,
	fabOffsetX: 0,
	fabOffsetY: 0,
	fabPaddingX: 28,
	fabPaddingY: 80,
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
	fabDoubleTapCommand: string;
	fabSingleTapCommand: string;
	fabHaptics: boolean;
	fabOffsetX: number;
	fabOffsetY: number;
	fabPaddingX: number;
	fabPaddingY: number;
}
