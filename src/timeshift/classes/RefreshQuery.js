module.exports = class {

  constructor(datasetId, datasetVersionId) {
    this.load = `q = load \"${datasetId}/${datasetVersionId}\";`
    this.foreach = `q = foreach q generate count() as 'count';`
    this.query = { "query" : `${this.load} ${this.foreach}` }
  }

  get json() {
    return JSON.stringify(this.query)
  }

}
