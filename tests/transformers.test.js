/* eslint-disable max-classes-per-file */
/* global describe, it, expect */

const { transformListTo, transformInstanceTo } = require('../lib/transformers');
const { extract, factory } = require('../lib/utils.function');

class Droid {
  constructor({ name }) {
    this.name = name;
  }
}

class Soldier {
  constructor({ name }) {
    this.name = name;
  }
}

describe('transformListTo', () => {
  it('should return a name list', async () => {
    const list = ([first, second, last]) => new Promise((resolve) => {
      resolve([
        new Droid({ name: first }),
        new Droid({ name: second }),
        new Droid({ name: last })]);
    });

    const names = await transformListTo(list, extract('name'))(['Twilio', 'Iago', 'Calazans']);

    expect(names).toEqual(['Twilio', 'Iago', 'Calazans']);
  });
});

describe('transformInstanceTo', () => {
  it('should return a Soldier Instance named Twilio', async () => {
    const caller = ({ name }) => ({ fetch: async () => new Droid({ name }) });

    const soldier = await transformInstanceTo(caller, factory(Soldier))({ name: 'Twilio' });

    expect(soldier).toBeInstanceOf(Soldier);
    expect(soldier.name).toBe('Twilio');
  });
});
