import {
  transformStyle,
  camelCase,
  camelCaseNodeName,
  removePixelsFromNodeValue,
  getEnabledAttributes,
  obtainComponentAtts,
  elementsMap,
  postProcessAttributes,
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

  describe('elementsMap[*].postProcessAttributes', () => {
    const emptyAttributesObj = {};
    const emptyNode = { attributes: [] };

    [
      'circle',
      'ellipse',
      'g',
      'line',
      'linearGradient',
      'polygon',
      'polyline',
      'radialGradient',
      'rect',
      'stop',
      'text',
    ].forEach(elementName => {
      it(`ensures that the ${elementName}.postProcessAttributes is the default one`, () => {
        expect(
          elementsMap[elementName].postProcessAttributes(emptyAttributesObj),
        ).toBe(postProcessAttributes(emptyAttributesObj));

        expect(elementsMap[elementName].postProcessAttributes).toBe(
          postProcessAttributes,
        );
      });
    });

    it('always gets a new object regardless the arguments passed to "defs" method', () => {
      const { postProcessAttributes } = elementsMap['defs'];
      const withoutProps = postProcessAttributes(
        emptyAttributesObj,
        undefined,
        emptyNode,
      );
      const withPropsButNoProperties = postProcessAttributes(
        emptyAttributesObj,
        {},
        emptyNode,
      );
      const withNoArgs = postProcessAttributes();

      expect(withoutProps).toEqual(emptyAttributesObj);
      expect(withoutProps).not.toBe(emptyAttributesObj);

      expect(withPropsButNoProperties).toEqual(emptyAttributesObj);
      expect(withPropsButNoProperties).not.toBe(emptyAttributesObj);

      expect(withNoArgs).toEqual(emptyAttributesObj);
      expect(withNoArgs).not.toBe(emptyAttributesObj);
    });

    // #region Path tests
    it('gets the same attritubes when there is no "fill" prop or no props at all for "path" method', () => {
      const { postProcessAttributes } = elementsMap['path'];
      const withoutProps = postProcessAttributes(
        emptyAttributesObj,
        undefined,
        emptyNode,
      );
      const withoutFillProp = postProcessAttributes(
        emptyAttributesObj,
        {},
        emptyNode,
      );
      const withFillPropNull = postProcessAttributes(
        emptyAttributesObj,
        { fill: null },
        emptyNode,
      );

      expect(withoutProps).toBe(emptyAttributesObj);
      expect(withoutFillProp).toBe(emptyAttributesObj);
      expect(withFillPropNull).toBe(emptyAttributesObj);
    });

    it('gets the attritubes with the "fill" prop when it is provided for "path" method', () => {
      const withFillProp = { fill: 'value for fill prop' };
      const attrWithFill = elementsMap['path'].postProcessAttributes(
        emptyAttributesObj,
        withFillProp,
        emptyNode,
      );

      expect(attrWithFill).toEqual(withFillProp);
      expect(attrWithFill).not.toBe(withFillProp);
    });
    // #endregion

    // #region Svg tests
    it('gets the same attritubes when there is no "height", "width" props or no props at all for "svg" method', () => {
      const { postProcessAttributes } = elementsMap['svg'];
      const withoutProps = postProcessAttributes(
        emptyAttributesObj,
        undefined,
        emptyNode,
      );
      const withoutHeightOrWidthProp = postProcessAttributes(
        emptyAttributesObj,
        {},
        emptyNode,
      );
      const withHeightPropNull = postProcessAttributes(
        emptyAttributesObj,
        { height: null },
        emptyNode,
      );
      const withWidthPropNull = postProcessAttributes(
        emptyAttributesObj,
        { width: null },
        emptyNode,
      );
      const withHeightAndWidthPropNull = postProcessAttributes(
        emptyAttributesObj,
        { height: null, width: null },
        emptyNode,
      );

      expect(withoutProps).toBe(emptyAttributesObj);
      expect(withoutHeightOrWidthProp).toBe(emptyAttributesObj);
      expect(withHeightPropNull).toBe(emptyAttributesObj);
      expect(withWidthPropNull).toBe(emptyAttributesObj);
      expect(withHeightAndWidthPropNull).toBe(emptyAttributesObj);
    });

    it('gets the attritubes with the "height" prop when it is provided for "svg" method', () => {
      const withHeightProp = { height: '1342px' };
      const attrWithHeight = elementsMap['svg'].postProcessAttributes(
        emptyAttributesObj,
        withHeightProp,
        emptyNode,
      );

      expect(attrWithHeight).toEqual(withHeightProp);
      expect(attrWithHeight).not.toBe(withHeightProp);
    });

    it('gets the attritubes with the "width" prop when it is provided for "svg" method', () => {
      const withWidthProp = { width: '1342px' };
      const attrWithWidth = elementsMap['svg'].postProcessAttributes(
        emptyAttributesObj,
        withWidthProp,
        emptyNode,
      );

      expect(attrWithWidth).toEqual(withWidthProp);
      expect(attrWithWidth).not.toBe(withWidthProp);
    });

    it('gets the attritubes with the "height" and "width" prop when it is provided for "svg" method', () => {
      const withHeightAndWidthProp = { height: '1342px', width: '1394px' };
      const attrWithHeightAndWidth = elementsMap['svg'].postProcessAttributes(
        emptyAttributesObj,
        withHeightAndWidthProp,
        emptyNode,
      );

      expect(attrWithHeightAndWidth).toEqual(withHeightAndWidthProp);
      expect(attrWithHeightAndWidth).not.toBe(withHeightAndWidthProp);
    });
    // #endregion

    // #region TSpan tests
    it('gets the same attritubes passed as argument when there is no "y" prop or no props at all for "tspan" method', () => {
      const { postProcessAttributes } = elementsMap['tspan'];
      const yNullAttribute = { y: null };
      const withUndefinedAttributes = postProcessAttributes(
        undefined,
        {},
        emptyNode,
      );
      const withNullAttributes = postProcessAttributes(null, {}, emptyNode);
      const withoutYAttribute = postProcessAttributes(
        emptyAttributesObj,
        {},
        emptyNode,
      );
      const withYAttributeNull = postProcessAttributes(
        yNullAttribute,
        {},
        emptyNode,
      );

      expect(withUndefinedAttributes).toBeUndefined();
      expect(withNullAttributes).toBeNull();
      expect(withoutYAttribute).toBe(emptyAttributesObj);
      expect(withYAttributeNull).toBe(yNullAttribute);
    });

    it('gets the attritubes with the "y" prop when it is provided for "tspan" method', () => {
      const withYAttributes = { y: 4 };
      const attrWithY = elementsMap['tspan'].postProcessAttributes(
        withYAttributes,
        {},
        emptyNode,
      );

      expect(attrWithY).toEqual(withYAttributes);
      expect(attrWithY).not.toBe(withYAttributes);
    });
    // #endregion

    // #region Use tests
    const href = '#usingHref';
    const hrefLegacy = '#usingXlinkHref';

    it('gets hyperlink reference passed as "xlink:href" attribute to "use" method', () => {
      const { postProcessAttributes } = elementsMap['use'];
      const nodeWithXLinkHrefAttribute = {
        attributes: [{ name: 'xlink:href', value: hrefLegacy }],
      };
      const withUndefinedAttributes = postProcessAttributes(
        emptyAttributesObj,
        {},
        nodeWithXLinkHrefAttribute,
      );

      expect(withUndefinedAttributes).toEqual({ href: hrefLegacy });
    });

    it('gets hyperlink reference passed as "href" attribute to "use" method', () => {
      const { postProcessAttributes } = elementsMap['use'];
      const nodeWithXLinkHrefAttribute = {
        attributes: [{ name: 'href', value: href }],
      };
      const withUndefinedAttributes = postProcessAttributes(
        emptyAttributesObj,
        {},
        nodeWithXLinkHrefAttribute,
      );

      expect(withUndefinedAttributes).toEqual({ href });
    });

    it('gets hyperlink reference passed as "href" attribute instead of "xlink:href" attribute for "use" method', () => {
      const { postProcessAttributes } = elementsMap['use'];
      const nodeWithXLinkHrefAttribute = {
        attributes: [
          { name: 'xlink:href', value: hrefLegacy },
          { name: 'href', value: href },
        ],
      };
      const withUndefinedAttributes = postProcessAttributes(
        emptyAttributesObj,
        {},
        nodeWithXLinkHrefAttribute,
      );

      expect(withUndefinedAttributes).toEqual({ href });
    });
    // #endregion
  });
});
