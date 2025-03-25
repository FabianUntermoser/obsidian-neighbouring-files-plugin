export const DEFAULT_SETTINGS: NeighbouringFileNavigatorPluginSettings = {
	// sorting
	defaultSortOrder: "alphabetical",
	// navigation options
	enableFolderLoop: false,
	// file mask
	includedFileTypes: "markdownOnly",
	additionalExtensions: ["canvas", "pdf"],
};

export type SORT_ORDER =
	| "alphabetical"
	| "byCreatedTime"
	| "byModifiedTime"
	| "alphabeticalReverse"
	| "byCreatedTimeReverse"
	| "byModifiedTimeReverse";

export type INCLUDED_FILE_TYPES =
	| "markdownOnly"
	| "allFiles"
	| "additionalExtensions";

export default interface NeighbouringFileNavigatorPluginSettings {
	defaultSortOrder: SORT_ORDER;
	enableFolderLoop: boolean;
	includedFileTypes: INCLUDED_FILE_TYPES;
	additionalExtensions: string[];
}
