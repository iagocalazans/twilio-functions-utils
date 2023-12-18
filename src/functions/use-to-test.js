const functionUsedToTest = async function (event) {
  if (event.to && event.from) {
    const call = await this.client.calls.create({
      from: event.from,
      to: event.to,
    });

    return call;
  }

  return event;
};

module.exports = {
  functionUsedToTest,
};
