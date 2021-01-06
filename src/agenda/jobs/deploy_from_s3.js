const auth = require(appRoot + "/src/auth")
const s3 = require(appRoot + "/src/repo")

module.exports = async (params) => {

  try {
    let room = params.session.salesforce.auth_response.id;
    my_io.to(room).emit("test", 'finally deploy'); 
    const conn = auth.refreshConnection(params.session)
    return await s3.downloadAndDeployTemplate(conn, params)
  } catch (e) {
    console.error(e.message)
    return { success: false, errors: [ e.message ] }
  }

}
