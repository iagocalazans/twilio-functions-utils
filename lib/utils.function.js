const extract = (property) => function (el) {
  return el[property];
};

const factory = (Instance) => function (ob) {
  return new Instance(ob);
};

module.exports = { extract, factory };
