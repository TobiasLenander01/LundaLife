import { Category, DateFilterOption } from '@/types/app';
import { FiCalendar, FiCoffee, FiMusic, FiMoreHorizontal } from 'react-icons/fi';
import { BiBeer } from 'react-icons/bi';
import { MdRestaurant, MdDirectionsBike } from 'react-icons/md';

export const DateFilterOptions: DateFilterOption[] = [
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'this-week', label: 'This Week' },
  { value: 'next-week', label: 'Next Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

export const Categories: Category[] = [
  { value: 'all', label: 'All Events', icon: <FiCalendar /> },
  { value: 'breakfast', label: 'Breakfast', icon: <FiCoffee />, keywords: ['frukost'] },
  { value: 'lunch', label: 'Lunch', icon: <MdRestaurant />, keywords: ['lunch', 'brunch', 'food'] },
  { value: 'bar', label: 'Bar', icon: <BiBeer />, keywords: ['bar', 'pub'] },
  { value: 'club', label: 'Club', icon: <FiMusic />, keywords: ['klubb', 'disco', 'dj', 'casa', 'eftersläpp', 'kajplats', 'afterparty'] },
  { value: 'bikeparty', label: 'Bike Party', icon: <MdDirectionsBike />, keywords: ['bike', 'cykel', 'pedal']},
  { value: 'other', label: 'Other', icon: <FiMoreHorizontal /> },
];