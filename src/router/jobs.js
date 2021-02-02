const queue = require("../queue")

const formatResponse = (job) => {

  const { session, ...rest } = job.data

  return {
    id: job.id,
    name: job.name,
    data: rest,
    queuedAt: new Date(job.timestamp),
    runAt: new Date(job.processedOn),
    doneAt: new Date(job.finishedOn),
    result: job.returnvalue,
    failed: job.failedReason
  }

}

const checkSessionJobs = async (req, res) => {

  console.log("Check status of jobs on current session.")

  try {

    let formattedResults = [];

    if (req.session.jobs.length === 0)
      return res.status(200).json([])

    const sessionJobs = req.session.jobs.map(d => d.job_id)

    const allCurrentJobs = await queue.getJobs(['active', 'completed'])
    const jobResults = allCurrentJobs.filter(d => sessionJobs.includes(d.id))

    if (jobResults && jobResults.length > 0) {
      formattedResults = jobResults.map(formatResponse)
      return res.status(200).json(formattedResults.reverse())
    } else {
      return res.status(500).json("Jobs not found in database.")
    }

  } catch (e) {
    console.error(e.message)
    return res.status(500).json(e.message)
  }

}

module.exports = {
  checkSessionJobs: checkSessionJobs
}
