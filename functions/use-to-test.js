async function functionUsedToTest(event) {
  if (event.to && event.from) {
    const call = await this.twilio.calls.create({
      from: event.from,
      to: event.to,
    });

    return call;
  }

  return event;
}

module.exports = {
  functionUsedToTest,
};
