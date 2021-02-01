module.exports = class {

  constructor(context) {
    this.context = context
    this.load = `q = load \"${this.context.datasetId}/${this.context.datasetVersionId}\";`;
    this.foreach = `q = foreach q generate '${this.context.fieldApiName}_Year' + \"-\" + '${this.context.fieldApiName}_Month' + \"-\" + '${this.context.fieldApiName}_Day' as '__Latest_YMD', count() as 'count';`;
    this.order = `q = order q by '__Latest_YMD' desc;`;
    this.limit = `q = limit q 1;`;
    this.query = { "query" : `${this.load} ${this.foreach} ${this.order} ${this.limit}` };
  }

  get json() {
    return JSON.stringify(this.query)
  }

}
