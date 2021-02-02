const getLastRefreshDates = async (conn, datasetIdArray) => {

  try {

    const result = await conn
      .sobject("EdgeMart")
      .retrieve(datasetIdArray)

    console.log(result)

    return result

  } catch (error) {
    console.error(error.message)
  }

}

module.exports = {
  getLastRefreshDates
}
