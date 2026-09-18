import type { Timestamp } from 'firebase/firestore';

/** Firestore `reports` document — UGC moderation queue. */
export interface Report {
  id: string;
  postId: string;
  reportedUserId: string;
  reporterId: string;
  createdAt: Timestamp;
}

export type CreateReportInput = {
  postId: string;
  reportedUserId: string;
  reporterId: string;
};
