const extract = (property) => function (el) {
  return el[property];
};

const factory = (Instance) => function (ob) {
  const props = { ...JSON.parse(JSON.stringify(ob)) };
  return new Instance(props);
};

module.exports = { extract, factory };
