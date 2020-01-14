import {
  fetchSvgData,
  getFixedYPosition,
  getHrefValue,
  trimElementChilden,
} from '../index';

describe('utils tests', () => {
  const createNode = (attributes, parentNode, nodeName, nodeValue) => ({
    attributes,
    parentNode,
    nodeName,
    nodeValue,
  });
  const emptyNode = createNode([]);

  describe('getFixedYPosition tests', () => {
    it('gets the value passed to y as the fixed Y position if it has no parent node or font size attribute', () => {
      const y = 20;
      const newY = getFixedYPosition(emptyNode, y);
      const newYWithParent = getFixedYPosition(
        createNode([
          {
            name: 'another-attribute',
            value: 'another attribute value',
          },
        ]),
        y,
      );

      expect(newY).toBe(y);
      expect(newYWithParent).toBe(y);
    });

    it('gets the value passed to y as the fixed Y position if it has a parent node but no font size attribute', () => {
      const y = 20;
      const newY = getFixedYPosition(emptyNode, y);
      const newYWithParent = getFixedYPosition(
        createNode([
          {
            name: 'another-attribute',
            value: 'another attribute value',
          },
        ]),
        y,
      );

      expect(newY).toBe(y);
      expect(newYWithParent).toBe(y);
    });

    it('gets the value passed to y minus the font-size node or parent node attribute value', () => {
      const attributes = [
        {
          name: 'font-size',
          value: '10',
        },
      ];
      const newY = getFixedYPosition(createNode(attributes), 30);
      const newYFromParent = getFixedYPosition(
        createNode([], createNode(attributes)),
        30,
      );

      expect(newY).toBe(20);
      expect(newYFromParent).toBe(20);
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

  describe('fetchSvgData tests', () => {
    const textPromise = jest.fn(() => Promise.resolve('SVG data'));
    const fetchReq = jest.fn(() => Promise.resolve({ text: textPromise }));
    const uri = 'https://uritoosvg.com';
    const promiseError = new Error('Generic async error');

    global.fetch = fetchReq;

    afterEach(() => {
      fetchReq.mockClear();
      textPromise.mockClear();
    });

    it('gets the data without any error', async () => {
      const { data, error } = await fetchSvgData(uri);

      expect(fetchReq).toHaveBeenCalledTimes(1);
      expect(fetchReq).toHaveBeenCalledWith(uri);
      expect(textPromise).toHaveBeenCalledTimes(1);
      expect(data).toBe('SVG data');
      expect(error).toBeUndefined();
    });

    it('gets an error if the fetch promise fails', async () => {
      fetchReq.mockRejectedValueOnce(promiseError);

      const { data, error } = await fetchSvgData(uri);

      expect(fetchReq).toHaveBeenCalledTimes(1);
      expect(fetchReq).toHaveBeenCalledWith(uri);
      expect(textPromise).not.toHaveBeenCalled();
      expect(data).toBeUndefined();
      expect(error).toBe(promiseError);
    });

    it('gets an error if the text promise fails', async () => {
      textPromise.mockRejectedValueOnce(promiseError);

      const { data, error } = await fetchSvgData(uri);

      expect(fetchReq).toHaveBeenCalledTimes(1);
      expect(fetchReq).toHaveBeenCalledWith(uri);
      expect(textPromise).toHaveBeenCalledTimes(1);
      expect(data).toBeUndefined();
      expect(error).toBe(promiseError);
    });
  });
});
