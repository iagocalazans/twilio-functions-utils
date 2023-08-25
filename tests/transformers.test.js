/* eslint-disable max-classes-per-file */
/* global describe, it, expect */

const { transformListTo, transformInstanceTo, pipe } = require('../lib/transformers');
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

describe('Functional Transformers', () => {
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

  describe('pipe', () => {
    it('should pipe the first and second parameters of the pipe function', async () => {
      const sum2 = (x) => x + 2;
      const sum5 = (x) => x + 5;
      const sum8 = (x) => x + 8;
      const sum11 = (x) => x + 11;
      const sum14 = (x) => x + 14;

      const sum = pipe(
        sum2, sum5, sum8,
      );

      const sumTwo = pipe(
        sum2, sum5, sum8, sum11, sum14,
      );

      expect(sum(1)).toEqual(16);
      expect(sumTwo(2)).toEqual(42);
    });
  });
});
