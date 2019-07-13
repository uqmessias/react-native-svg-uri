import {
  transformStyle,
  camelCase,
  camelCaseNodeName,
  removePixelsFromNodeValue,
  getEnabledAttributes,
} from '..';

describe('attributeTranformer tests', () => {
  describe('transformStyle', () => {
    it('transforms style attribute', () => {
      expect(
        transformStyle({
          nodeName: 'style',
          nodeValue: 'fill:rgb(0,0,255);stroke:rgb(0,0,0)',
        }),
      ).toEqual({
        fill: 'rgb(0,0,255)',
        stroke: 'rgb(0,0,0)',
      });
    });

    it('transforms style attribute with dash-case attribute and ignores invalid node values', () => {
      expect(
        transformStyle({
          nodeName: 'style',
          nodeValue: 'stop-color:#ffffff;:ignored-value',
        }),
      ).toEqual({
        stopColor: '#ffffff',
      });
    });

    it('transforms style attribute with dash-case attribute and ignores invalid node values', () => {
      expect(
        transformStyle({
          nodeName: 'style',
          nodeValue: 'fill: #ffffff',
          fillProp: '#ff00ff',
        }),
      ).toEqual({
        fill: '#ff00ff',
      });
    });

    it('does not transform style attribute because it does not have a valid value', () => {
      expect(transformStyle({ nodeName: 'style', nodeValue: '' })).toBe(null);
    });
  });

  describe('camelCaseNodeName', () => {
    it('gets name of the node in camelCase format', () => {
      expect(
        camelCaseNodeName({ nodeName: 'stop-color', nodeValue: '2px' }),
      ).toEqual({ nodeName: 'stopColor', nodeValue: '2px' });
    });
  });

  describe('removePixelsFromNodeValue', () => {
    it('removes pixels from x, y, height and width attributes', () => {
      expect(
        removePixelsFromNodeValue({ nodeName: 'x', nodeValue: '2px' }),
      ).toEqual({ nodeName: 'x', nodeValue: '2' });
      expect(
        removePixelsFromNodeValue({ nodeName: 'y', nodeValue: '4px' }),
      ).toEqual({ nodeName: 'y', nodeValue: '4' });
      expect(
        removePixelsFromNodeValue({ nodeName: 'height', nodeValue: '65px' }),
      ).toEqual({ nodeName: 'height', nodeValue: '65' });
      expect(
        removePixelsFromNodeValue({ nodeName: 'width', nodeValue: '999px' }),
      ).toEqual({ nodeName: 'width', nodeValue: '999' });
    });
  });

  describe('getEnabledAttributes', () => {
    it('return true when nodeName is found', () => {
      const enabledAttributes = ['x', 'y', 'strokeOpacity'];
      const hasEnabledAttribute = getEnabledAttributes(enabledAttributes);

      expect(hasEnabledAttribute({ nodeName: 'x' })).toEqual(true);
      expect(hasEnabledAttribute({ nodeName: 'stroke-opacity' })).toEqual(true);
    });

    it('return false when nodeName is not found', () => {
      const enabledAttributes = ['width', 'height'];
      const hasEnabledAttribute = getEnabledAttributes(enabledAttributes);

      expect(hasEnabledAttribute({ nodeName: 'depth' })).toEqual(false);
    });
  });
});
