import { createContext, useContext, useState, type ReactNode } from 'react';
import { maps, type MapId } from './maps';

const MapContext = createContext<{ mapId: MapId; setMapId: (id: MapId) => void }>({ mapId: 'europe', setMapId: () => {} });
/** Map selection is shared across tabs; historical progress keys and schemas stay stable. */
export function MapProvider({ children }: { children: ReactNode }) {
  const [mapId, setMapId] = useState<MapId>('europe');
  return <MapContext.Provider value={{ mapId, setMapId }}>{children}</MapContext.Provider>;
}
export function useMap() {
  const { mapId, setMapId } = useContext(MapContext);
  return { mapId, setMapId, map: maps[mapId] };
}
