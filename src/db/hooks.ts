import { useLiveQuery } from 'dexie-react-hooks'
import { getSettings } from './repo'

/** Live settings; undefined while the first read is in flight. */
export function useSettings() {
  return useLiveQuery(() => getSettings())
}
