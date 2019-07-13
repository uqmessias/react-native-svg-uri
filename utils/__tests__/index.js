import { getFixedYPosition, getHrefValue, trimElementChilden } from '../index';

describe('utils tests', () => {
  describe('getFixedYPosition tests', () => {
    it('gets the value passed to y as the fixed Y position if it has no attributes', () => {
      const newY = getFixedYPosition({ parentNode: {} }, 20);
      expect(newY).toBe(20);
    });

    it('gets the value passed to y as the fixed Y position if it has no parent node or font size attribute', () => {
      const newY = getFixedYPosition({ attributes: [] }, 20);
      expect(newY).toBe(20);
    });

    it('gets the value passed to y minus the font-size attribute value', () => {
      const newY = getFixedYPosition(
        {
          attributes: [
            {
              name: 'font-size',
              value: 10,
            },
          ],
        },
        30,
      );
      expect(newY).toBe('20');
    });
  });

  describe('getHrefValue tests', () => {
    const stopColorAttribute = { name: 'stopColor', value: '#000000' };
    const hrefAttribute = { name: 'href', value: '#myGradient' };
    const xLinkhrefAttribute = {
      name: 'xlink:href',
      value: '#myLinearGradient',
    };

    it('gets null when the node has no attributes', () => {
      const result = getHrefValue({});
      expect(result).toBe(null);
    });

    it('gets undefined when the node has no attributes with "href" or "xlink:href" name', () => {
      const result = getHrefValue({
        attributes: [stopColorAttribute],
      });
      expect(result).toBe(undefined);
    });

    it('gets "href" value when there is only "href" to get', () => {
      const result = getHrefValue({
        attributes: [stopColorAttribute, hrefAttribute],
      });
      expect(result).toBe(hrefAttribute.value);
    });

    it('gets "href" value even when there is also "xlink:href" to get', () => {
      const result = getHrefValue({
        attributes: [stopColorAttribute, hrefAttribute, xLinkhrefAttribute],
      });
      expect(result).toBe(hrefAttribute.value);
    });

    it('gets "href" value', () => {
      const result = getHrefValue({
        attributes: [stopColorAttribute, xLinkhrefAttribute],
      });
      expect(result).toBe(xLinkhrefAttribute.value);
    });
  });

  describe('trimElementChilden tests', () => {
    const notTimmableElements = [1, {}, true, '  asdhf', 'asdhfk'];
    const trimmableElements = ['', '   '];

    it('does not trims any item', () => {
      const result = trimElementChilden(notTimmableElements);
      expect(result).toEqual(notTimmableElements);
    });

    it('trims only the trimmable items', () => {
      const result = trimElementChilden(
        notTimmableElements.concat(trimmableElements),
      );
      expect(result).toEqual(notTimmableElements);
    });

    it('trims all items', () => {
      const result = trimElementChilden(trimmableElements);
      expect(result).toEqual([]);
    });
  });
});
