import { chapelAudio } from "./audio/runtime";
export const unlockAudio = () => chapelAudio.unlock();
export const playBell = (eventId: string) =>
  chapelAudio.gift("bell_10", eventId);
