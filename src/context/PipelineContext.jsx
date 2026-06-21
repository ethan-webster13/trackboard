/* ===========================================================================
   PipelineContext — the logged-in user's saved jobs, live from Firestore
   ---------------------------------------------------------------------------
   This provider subscribes to the current user's pipeline and shares it with
   the whole app. The Job Board uses it to show "Saved" state on each card; the
   Pipeline page uses it to render the Kanban columns. Because it's one shared
   real-time subscription, every part of the UI stays in sync automatically.
   =========================================================================== */

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import {
  saveJob as saveJobToDb,
  removeJob as removeJobFromDb,
  updateJobStage as updateJobStageInDb,
  subscribeToPipeline,
} from '../api/pipeline.js'

const PipelineContext = createContext(null)

export function PipelineProvider({ children }) {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  // Whenever the logged-in user changes, (re)subscribe to their pipeline.
  useEffect(() => {
    // Logged out: clear any previous user's data and stop here.
    if (!user) {
      setJobs([])
      setLoading(false)
      return
    }

    setLoading(true)
    // subscribeToPipeline returns an unsubscribe function. Returning it from
    // useEffect means React calls it on cleanup (logout or unmount), so we
    // never leak a listener or show the wrong user's data.
    const unsubscribe = subscribeToPipeline(user.uid, (nextJobs) => {
      setJobs(nextJobs)
      setLoading(false)
    })
    return unsubscribe
  }, [user])

  // A Set of saved job ids makes "is this job already saved?" an O(1) lookup.
  const savedIds = useMemo(
    () => new Set(jobs.map((job) => job.jobId)),
    [jobs]
  )

  const value = {
    jobs,
    loading,
    savedIds,
    isSaved: (jobId) => savedIds.has(String(jobId)),
    saveJob: (job) => saveJobToDb(user.uid, job),
    removeJob: (jobId) => removeJobFromDb(user.uid, jobId),
    moveJob: (jobId, stage) => updateJobStageInDb(user.uid, jobId, stage),
  }

  return (
    <PipelineContext.Provider value={value}>
      {children}
    </PipelineContext.Provider>
  )
}

export function usePipeline() {
  const context = useContext(PipelineContext)
  if (context === null) {
    throw new Error('usePipeline must be used inside a <PipelineProvider>')
  }
  return context
}
