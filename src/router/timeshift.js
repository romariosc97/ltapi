const queue = require(appRoot + "/src/queue")

exports.shiftDatasets = async (req, res) => {

  const params = {
    session: req.session,
    ...req.body
  }

  io.to(req.session.socketRoom).emit('jobUpdate', 'Starting Timeshift Operation.')

  try {

    const result = await queue.add('generate_timeshift_dataflow', params)

    const jobInfo = {
      job_name: "Timeshift Operation",
      job_details: {
        params: req.body
      },
      job_id: result.id,
      run_at: new Date(result.timestamp)
    }

    req.session.jobs.push(jobInfo)
    res.status(200).json(jobInfo)

  } catch (error) {
    res.status(500).json(error)
  }

}
