class Branch {

  constructor({ inputDataset, dateFields = [], seedDate = new Date(), primer = true }) {

    this.inputName = inputDataset
    this.outputName = inputDataset
    this.fields = dateFields
    this.lpd = seedDate
    this.generateEpoch = primer

    this.load = this.setLoad()
    this.compute = this.computeDates(this.load.name)
    this.clear = this.dropDates(this.compute.name)
    this.shift = this.shiftDates(this.clear.name)
    this.clean = this.dropAux(this.shift.name)
    this.register = this.setRegister(this.clean.name)

    this.nodes = ["load", "compute", "clear", "shift", "clean", "register"]

  }

  seedName (s) { return `${s}_${this.inputName}`; }

  termAux (s) { return `${s}_Aux`; }
  termEpoch (s) { return `toDate('${s}_sec_epoch')`; }
  termShift (s) { return `toDate('${s}_sec_epoch' + 'ElapsedSeconds')`; }

  get calcEpoch () { return this.lpd.getTime() / 1e3; }

  get staticExp () {
    return `86400 * date_diff("day", toDate(${this.calcEpoch}), now())`;
  }

  get dynamicExp () {
    return `86400 * date_diff("day", toDate(\'LastProcessedDate_sec_epoch\'), now())`;
  }

  setLoad () {
    return new Load(this.seedName("Load_Dataset"), this.inputName);
  }

  computeDates(source) {
    const computedFields = this.fields
      .map(d => new ComputedField("Date", this.termAux(d.fieldApiName), null, this.termEpoch(d.fieldApiName)));
    if (this.generateEpoch)
      computedFields.push(new ComputedField("Numeric", "ElapsedSeconds", null, this.staticExp))
    else
      computedFields.push(new ComputedField("Numeric", "ElapsedSeconds", null, this.dynamicExp))

    return new Compute(this.seedName("Compute_Aux"), source, computedFields)
  }

  dropDates(source) {
    const dropFields = this.fields.map(d => d.fieldApiName)
    return new Slice(this.seedName("Drop_Dates"), source, dropFields)
  }

  shiftDates(source) {
    const shiftFields = this.fields
      .map(d => new ComputedField("Date", d.fieldApiName, d.fieldLabel, this.termShift(this.termAux(d.fieldApiName))));
    shiftFields.push(new ComputedField("Date", "LastProcessedDate", "Last Processed", "now()"))
    return new Compute(this.seedName("Shift_Dates"), source, shiftFields)
  }

  dropAux(source) {
    const dropFields = this.fields.map(d => this.termAux(d.fieldApiName))
    dropFields.push("ElapsedSeconds")
    return new Slice(this.seedName("Drop_Aux"), source, dropFields)
  }

  setRegister (source) {
    return new Register(this.seedName("Register_Shifted_Dataset"), source, this.outputName);
  }

  get object() {
    var temp = {};
    this.nodes.forEach(n => temp[this[n].name] = this[n].block);
    return temp;
  }

  get json() {
    return JSON.stringify(this.object);
  }

}

class Node {

  constructor(name) {
    this.name = name;
    this.block = {
        action: null,
        parameters: {}
    };
  }

  get node() {
    var outer = {};
    outer[this.name] = Object.assign({}, this);
    return outer;
  }

  get json() {
    return JSON.stringify(this.outer);
  }

}


class Load extends Node {
  constructor(name, alias) {
    super(name);
    this.block.action = "edgemart";
    this.block.parameters.alias = alias;
  }
}

class Register extends Node {
  constructor(name, source, outputName) {
    super(name);
    this.block.action = "sfdcRegister";
    this.block.parameters.source = source;
    this.block.parameters.alias = outputName;
    this.block.parameters.name = outputName;
  }
}

class Slice extends Node {
  constructor(name, source, fieldArray) {
    super(name);
    this.block.action = "sliceDataset";
    this.block.parameters.mode = "drop";
    this.block.parameters.source = source;
    this.block.parameters.fields = fieldArray.map(d => ({ "name" : d }));
  }
}

class Compute extends Node {
  constructor(name, source, computedFieldArray) {
    super(name);
    this.block.action = "computeExpression";
    this.block.parameters.source = source;
    this.block.parameters.mergeWithSource = true;
    this.block.parameters.computedFields = [];
    this.block.parameters.computedFields = computedFieldArray.map(d => d.object);
  }
}

class ComputedField {

  constructor(type, name, label, saqlExp) {

    this.type = type;
    this.name = name;
    this.label = label || name;

    if (type === "Date") {
      this.format = "yyyy-MM-dd";
      this.isYearEndFiscalYear = true;
    }

    else if (type === "Numeric") {
      this.scale = 0;
      this.precision = 18;
    }

    this.saqlExpression = saqlExp;

  }

  get object() {
    return Object.assign({}, this);
  }

}

module.exports = {
    Branch: Branch,
    Node: Node,
    Load: Load,
    Register: Register,
    Slice: Slice,
    Compute: Compute,
    ComputedField: ComputedField
}
