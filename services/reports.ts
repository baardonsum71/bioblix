import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

import type { CreateReportInput } from '@/types';
import { COLLECTIONS, db } from '@/lib/firebase';

function reportsRef() {
  return collection(db, COLLECTIONS.reports);
}

/** Queue a UGC report for moderation review. */
export async function createReport(input: CreateReportInput): Promise<string> {
  const ref = await addDoc(reportsRef(), {
    postId: input.postId,
    reportedUserId: input.reportedUserId,
    reporterId: input.reporterId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
