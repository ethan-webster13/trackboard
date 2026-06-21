/* ===========================================================================
   Pipeline data layer (Firestore)
   ---------------------------------------------------------------------------
   All reads/writes for a user's saved jobs live here, so components never deal
   with Firestore APIs directly.

   Data model — each user's saved jobs are stored under their own document:

       users/{uid}/pipeline/{jobId}

   Scoping everything under the user's uid means one user can never see or touch
   another user's data (enforced for real by the security rules you set in the
   Firebase console — see the Phase 5 setup guide).
   =========================================================================== */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase.js'

// The default stage a job lands in when first saved.
export const DEFAULT_STAGE = 'wishlist'

// Helper: a reference to one user's pipeline collection.
function pipelineCollection(uid) {
  return collection(db, 'users', uid, 'pipeline')
}

// Helper: a reference to a single saved-job document.
function pipelineDoc(uid, jobId) {
  return doc(db, 'users', uid, 'pipeline', String(jobId))
}

/**
 * Save a job to the user's pipeline. We store only the fields we need to
 * render the card later (not the huge HTML description), plus the stage and a
 * server-generated timestamp.
 */
export function saveJob(uid, job) {
  return setDoc(pipelineDoc(uid, job.id), {
    jobId: String(job.id),
    title: job.title ?? '',
    company_name: job.company_name ?? '',
    company_logo: job.company_logo ?? '',
    category: job.category ?? '',
    candidate_required_location: job.candidate_required_location ?? '',
    job_type: job.job_type ?? '',
    salary: job.salary ?? '',
    url: job.url ?? '',
    stage: DEFAULT_STAGE,
    savedAt: serverTimestamp(),
  })
}

/** Remove a job from the user's pipeline. */
export function removeJob(uid, jobId) {
  return deleteDoc(pipelineDoc(uid, jobId))
}

/** Move a saved job to a different stage (used by the Kanban board, Phase 6). */
export function updateJobStage(uid, jobId, stage) {
  return updateDoc(pipelineDoc(uid, jobId), { stage })
}

/**
 * Subscribe to a user's pipeline in REAL TIME. onSnapshot calls `callback`
 * immediately with the current data and again whenever it changes (from this
 * device or any other). Returns an unsubscribe function — call it to stop.
 */
export function subscribeToPipeline(uid, callback) {
  return onSnapshot(pipelineCollection(uid), (snapshot) => {
    const jobs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(jobs)
  })
}
