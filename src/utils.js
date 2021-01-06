const mongoose = require("mongoose")

const timestampedMessage = (message) => {
  console.log(`[${new Date().toLocaleTimeString()}]: ${message}`)
}

exports.bodyHasField = (req, field_name) => {
  return (
    req.body[field_name] &&
    req.body[field_name] !== ""
  )
}

exports.logRequest = (req, res, next) => {
  next()
}

exports.connectToDb = () => {

  const dbUri = process.env.MONGODB_URI,
        dbOptions = { useNewUrlParser: true, useUnifiedTopology: true };

  mongoose.connect(dbUri, dbOptions)
    .then(timestampedMessage('Connected to database.'))
    .catch(console.error)

}

exports.logAuth = (conn, userInfo) => {
  console.log("Successful Authorization:", conn.instanceUrl)
  console.log("User ID:", userInfo.id)
  console.log("Org ID:", userInfo.organizationId)
  console.log("Access Token: " + conn.accessToken)
}

exports.stayAwake = () => {}
