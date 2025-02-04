export type SORT_ORDER =
	  'alphabetical'
	| 'byCreatedTime'
	| 'byModifiedTime'
	| 'alphabeticalReverse'
	| 'byCreatedTimeReverse'
	| 'byModifiedTimeReverse';

export default interface NeighbouringFileNavigatorPluginSettings {
	defaultSortOrder: SORT_ORDER;
}
