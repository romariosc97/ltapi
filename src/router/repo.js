const repo = require(appRoot + "/src/repo"),
      validation = require("./validation");

const agenda = require(appRoot + "/src/agenda")

const getTemplates = async (req, res) => {

  try {

  const params = {
    branch: req.params.branch,
    org_api: parseInt(req.session.salesforce.api.version)
  }

  const result = await repo.getTemplateManifest(params)
  res.status(200).json(result)

  } catch (e) {
    console.error(e.message)
    res.status(500).json(e.message)
  }

}

const deployFromS3 = async (req, res) => {

  if (!validation.validTemplateDeploy(req))
    return res.status(400).json({
      error : "Request body malformed."
    })

  const params = {
    session: req.session,
    branch: req.params.branch,
    template_keys: req.body.templates
  }
  console.log('Empieza el deploy')
  const deploy = await agenda.queue.now("deploy_s3_templates", params)

  const jobInfo = {
    job_name: "Deploy Operation",
    job_details: {
      branch: req.params.branch,
      templates: req.body.templates
    },
    job_id: deploy.attrs._id,
    run_at: deploy.attrs.nextRunAt
  }

  req.session.jobs.push(jobInfo)

  res.status(200).json(jobInfo)


}

module.exports = {
  getTemplates: getTemplates,
  deployFromS3: deployFromS3
}
