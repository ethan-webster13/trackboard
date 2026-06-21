/* ===========================================================================
   Remotive API client
   ---------------------------------------------------------------------------
   All communication with the Remotive jobs API lives in this one file. The
   rest of the app calls fetchJobs() and never has to know the URL or the exact
   response shape. Keeping "how we talk to the outside world" separate from
   "how we render the UI" is a common, valuable pattern.

   ⚠️ Real-world note: the *free* Remotive endpoint returns a fixed promotional
   batch of jobs and IGNORES the documented `category` and `limit` query params.
   So we fetch the whole batch once and do all filtering on the client. (Lesson:
   always verify how an API actually behaves, not just what the docs claim.)

   API docs: https://remotive.com/api-documentation
   =========================================================================== */

const BASE_URL = 'https://remotive.com/api/remote-jobs'

/**
 * Fetch the current batch of remote jobs from Remotive.
 *
 * @param {object} options
 * @param {AbortSignal} [options.signal] optional signal to cancel the request
 * @returns {Promise<Array>} array of job objects
 *
 * Throws an Error if the network request fails or the server responds with a
 * non-2xx status — the caller catches it and shows an error message.
 */
export async function fetchJobs({ signal } = {}) {
  const response = await fetch(BASE_URL, { signal })

  if (!response.ok) {
    throw new Error(`Remotive API error: ${response.status}`)
  }

  const data = await response.json()
  // The API wraps the array under a "jobs" key. Default to [] just in case.
  return data.jobs ?? []
}
