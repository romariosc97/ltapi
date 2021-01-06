const jsforce = require("jsforce")

const { ltApi, sfRestApi } = require(appRoot + "/config")

const logConnectionFound = (req) => {
  const { user, auth } = req.session.salesforce
  console.log(`Salesforce session: ${user.username} at ${auth.instanceUrl}`)
}

const logNoConnectionFound = () => {
  console.log(`No Salesforce session found.`)
}

const isAuthenticating = (req) => {

  const isAuthenticatingEndpoints = [
    ltApi("auth_login"),
    ltApi("auth_sfdc"),
    ltApi("auth_oauth"),
    ltApi("auth_callback")
  ]

  return isAuthenticatingEndpoints.includes(req.baseUrl)

}

const foundConnection = (req) => {

  if (!req.session.salesforce) {
    logNoConnectionFound(); return false;
  }

  const { auth } = req.session.salesforce,
        hasConnection = (auth !== {} && auth !== undefined)

  hasConnection
    ? logConnectionFound(req)
    : logNoConnectionFound();

  return hasConnection

}

exports.refreshConnection = (session) => {
  return new jsforce.Connection(session.salesforce.auth)
}

exports.handleAuthRequired = (req, res, next) => {

  if (!isAuthenticating(req) && !foundConnection(req))
    return res.status(403).json({
      message: `You are not authenticated with Salesforce!`
    })

  next()

}

exports.getSfdcApi = async (connection) => {

  try {
    const version_list = await connection.request(`/services/data`)
    return version_list.pop()
  } catch (error) {
    console.error(error)
    return sfRestApiVersion
  }

}
