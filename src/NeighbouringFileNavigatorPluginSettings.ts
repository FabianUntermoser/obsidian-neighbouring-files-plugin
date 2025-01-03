export type SORT_ORDER = 'alphabetical' | 'byCreatedTime' | 'byModifiedTime';

export default interface NeighbouringFileNavigatorPluginSettings {
	defaultSortOrder: SORT_ORDER;
}
