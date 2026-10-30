
import { CategoryValue } from '@/lib/categories';
import { Event, Organization } from '@/types/database';

export type FilterValue = 'today' | 'this-week' | 'this-month' | 'all';

export interface FilterOption {
  value: FilterValue;
  label: string;
}

export const FilterOptions: FilterOption[] = [
  { value: 'today', label: 'Today' },
  { value: 'this-week', label: 'This week' },
  { value: 'this-month', label: 'This month' },
  { value: 'all', label: 'All' },
];

// Category filter: one category, or all of them
export type CategoryFilterValue = CategoryValue | 'all';

// An event together with the organization hosting it
export interface EventItem {
  event: Event;
  organization: Organization;
  categories: CategoryValue[];
}
