import type { Timestamp } from 'firebase/firestore';

export type LiveStatus = 'live' | 'ended';

/** Firestore `lives/{id}` — active or ended live sessions. */
export type LiveSession = {
  id: string;
  hostUserId: string;
  hostDisplayName: string;
  title: string;
  /** LiveKit room name (same as id for MVP). */
  roomName: string;
  status: LiveStatus;
  startedAt: Timestamp | null;
  endedAt?: Timestamp | null;
};
