import {
  transformStyle,
  camelCase,
  camelCaseNodeName,
  removePixelsFromNodeValue,
  getEnabledAttributes,
  obtainComponentAtts,
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

  describe('obtainComponentAtts', () => {
    const createNode = (nodeName, nodeValue) => ({ nodeName, nodeValue });
    const styleWithFill = createNode(
      'style',
      'fill:rgb(0,0,255);stroke:rgb(0,0,0)',
    );
    const fillNone = createNode('fill', 'none');
    const attributes = [
      createNode('opacity', '1px'),
      createNode('x', undefined),
      createNode('another-prop-not-allowed', 'value not allowed'),
      createNode('enabled-prop', 'value enabled'),
      createNode(
        'style-allowed-property',
        'fill:rgb(0,0,255);stroke:rgb(0,0,0)',
      ),
    ];

    const enabledAttributes = ['enabledProp', 'styleAllowedProperty'];

    it('gets the components attributes without the "fill" property', () => {
      const componentAttrs = obtainComponentAtts(
        { attributes },
        enabledAttributes,
      );

      expect(componentAttrs).toEqual({
        enabledProp: 'value enabled',
        opacity: '1',
        styleAllowedProperty: 'fill:rgb(0,0,255);stroke:rgb(0,0,0)',
        x: undefined,
      });
    });

    it('gets the components attributes with "fill" untouched', () => {
      const componentAttrs = obtainComponentAtts(
        { attributes: attributes.concat(fillNone) },
        enabledAttributes,
      );

      expect(componentAttrs).toEqual({
        enabledProp: 'value enabled',
        fill: 'none',
        opacity: '1',
        styleAllowedProperty: 'fill:rgb(0,0,255);stroke:rgb(0,0,0)',
        x: undefined,
      });
    });

    it('gets the components attributes with "fill" replaced from "none" by the style', () => {
      const componentAttrs = obtainComponentAtts(
        { attributes: attributes.concat([fillNone, styleWithFill]) },
        enabledAttributes,
      );

      expect(componentAttrs).toEqual({
        enabledProp: 'value enabled',
        fill: 'rgb(0,0,255)',
        opacity: '1',
        stroke: 'rgb(0,0,0)',
        styleAllowedProperty: 'fill:rgb(0,0,255);stroke:rgb(0,0,0)',
        x: undefined,
      });
    });

    it('gets the components attributes with "fill" replaced from style by the fill argument', () => {
      const componentAttrs = obtainComponentAtts(
        { attributes: attributes.concat(styleWithFill) },
        enabledAttributes,
        '#ffaa00',
      );

      expect(componentAttrs).toEqual({
        enabledProp: 'value enabled',
        fill: '#ffaa00',
        opacity: '1',
        stroke: 'rgb(0,0,0)',
        styleAllowedProperty: 'fill:rgb(0,0,255);stroke:rgb(0,0,0)',
        x: undefined,
      });
    });

    it('gets the components attributes with "fill" replaced from prop by the fill argument', () => {
      const componentAttrs = obtainComponentAtts(
        { attributes: attributes.concat(createNode('fill', '#ff0000')) },
        enabledAttributes,
        '#0000ff',
        true,
      );

      expect(componentAttrs).toEqual({
        enabledProp: 'value enabled',
        fill: '#0000ff',
        opacity: '1',
        styleAllowedProperty: 'fill:rgb(0,0,255);stroke:rgb(0,0,0)',
        x: undefined,
      });
    });
  });
});
