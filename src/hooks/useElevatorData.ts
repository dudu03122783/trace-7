import { useData } from '../context/DataContext';

export function useElevatorData() {
  const { getBitData, getMs25Data, getMs50Data, getSnapshotData, getSignalDescription } = useData();
  
  return {
    bitData: getBitData(),
    data25ms: getMs25Data(),
    data50ms: getMs50Data(),
    snapshotData: getSnapshotData(),
    getSignalDescription
  };
}