const config = require(appRoot + "/config")

const { LatestDateQuery, BatchQuery } = require("./classes")

const getDateFields = async (conn, session, dsId) => {

  try {

    let dsEndpoint = (dsId) => config.sfApi(session, "wave_datasets") + `/${dsId}`

    const endpoint = dsEndpoint(dsId)
    const dataset = await conn.request(endpoint)
    const datasetVersion = await conn.request(dataset.currentVersionUrl)

    return datasetVersion.xmdMain.dates.map(field => ({
      folderId: dataset.folder.id,
      folderApiName: dataset.folder.name,
      folderLabel: dataset.folder.label,
      datasetId: dataset.id,
      datasetApiName: dataset.name,
      datasetLabel: dataset.label,
      datasetVersionId: datasetVersion.id,
      fieldApiName: field.fields.fullField,
      fieldLabel: field.label
    }))

  } catch (error) {
    const { errorCode, message } = error
    return Promise.reject({
      type: 'retrieve_dataset',
      status: 'error',
      errorCode,
      message
    })
  }

}

const gatherDateFields = async (conn, session, datasetArray) => {
  const dateFieldDataPromises = datasetArray.map(d => getDateFields(conn, session, d))
  return Promise.allSettled(dateFieldDataPromises)
}

const sendDateQuery = async (conn, session, flatFieldData) => {

  const { datasetId, datasetVersionId, fieldApiName } = flatFieldData

  try {

    if (fieldApiName === 'LastProcessedDate')
      return Promise.reject({
        type: 'retrieve_field',
        status: 'ignored',
        message: 'LastProcessedDate is not available for timeshifting.',
        ...flatFieldData
      })

    const latestDateQuery = new LatestDateQuery(datasetId, datasetVersionId, fieldApiName)
    const queryResponse = await conn.requestPost(config.sfApi(session, "wave_query"), latestDateQuery.query)
    const latestYmd = queryResponse.results.records[0].__Latest_YMD || null

    return { ...flatFieldData, latestYmd }

  } catch (error) {
    const { errorCode, message } = error
    return Promise.reject({
      type: 'retrieve_field',
      status: 'error',
      errorCode,
      message,
      ...flatFieldData
    })
  }

}

const gatherDateValues = async (conn, session, fieldData) => {

  const endpoint = config.sfApi(session, "wave_query")
  const queryList = fieldData.map(d => new LatestDateQuery(d))
  const batchQuery = new BatchQuery(conn, endpoint, queryList)

  await batchQuery.execute()

  return batchQuery.results

}

const suggestDates = (fieldList) => {

  let groupByKey = (list, key) => list.reduce((hash, obj) =>
    ({...hash, [obj[key]]:( hash[obj[key]] || [] ).concat(obj)}), {})

  let dateToString = (d) => {
    var mm = d.getUTCMonth() < 9 ? `0${d.getUTCMonth() + 1}` : d.getUTCMonth() + 1;
    var dd = d.getUTCDate() < 10 ? `0${d.getUTCDate()}` : d.getUTCDate();
    return `${d.getUTCFullYear()}-${mm}-${dd}`;
  }

  const groupedQueryResults = groupByKey(fieldList, 'datasetApiName'),
        datasetKeys = Object.keys(groupedQueryResults),
        parsedResults = {};

  datasetKeys.forEach(d => {

    const dataset = groupedQueryResults[d]

    const returnedDateArray = dataset
      .map(d => {
        const { records } = d.queryResult.results
        if (records.length && records[0].__Latest_YMD)
          return new Date(records[0].__Latest_YMD)
      })
      .filter(d => d)
      .sort().reverse()

    const today = new Date(),
          latestDate = returnedDateArray[0],
          suggestedDate = latestDate > today ? today : latestDate,
          suggestedDateString = dateToString(suggestedDate);

    parsedResults[d] = {
      fieldData: dataset,
      latestDate,
      suggestedDate,
      suggestedDateString
    }

  })

  return parsedResults

}

module.exports = {
  gatherDateFields,
  gatherDateValues,
  suggestDates
}
