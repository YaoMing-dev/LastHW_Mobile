// Navigation types
import { SongResult } from '../types';

export type RootTabParamList = {
  Home: undefined;
  Search: { transcript?: string; results?: SongResult[] } | undefined;
  Library: undefined;
  Settings: undefined;
};
