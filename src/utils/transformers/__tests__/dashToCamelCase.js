import dashToCamelCase from '../dashToCamelCase';
import { dashToCamelCaseItems } from '../__mocks__';

describe('dashToCamelCase tests', () => {
  dashToCamelCaseItems.forEach(({ from, to }) => {
    it(`converts from "${from}" to "${to}"`, () => {
      const result = dashToCamelCase(from);
      expect(result).toEqual(to);
    });
  });
});
