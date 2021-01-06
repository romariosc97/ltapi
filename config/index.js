const path = require("path")

const lt_api = require("./lowtide_api"),
      sf_api = require("./salesforce_api"),
      sfRestApiVersion = require("./salesforce_rest"),
      deployOptions = require("./deploy_options"),
      awsConfig = require("./aws");

const generateSfApiEndpoint = (session, endpoint) => {
  const base_url = session.salesforce.api.url
  const generated_path = path.join(base_url, sf_api[endpoint])
  return path.normalize(generated_path)
}

const generateLtApiEndpoint = (endpoint) => {
  return lt_api[endpoint]
}

module.exports = {
  awsConfig,
  sfRestApiVersion,
  deployOptions,
  ltApi: generateLtApiEndpoint,
  sfApi: generateSfApiEndpoint,
}
