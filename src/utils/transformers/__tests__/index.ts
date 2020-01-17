import { Attribute, XmlNode } from '@utils/types';

import {
  transformStyle,
  camelCaseAttribute,
  removePixelsFromAttribute,
  getEnabledAttributes,
  obtainComponentAtts,
  elementsMap,
  postProcessAttributes,
  renderSvgElementByNodeWithItsChildNodes,
  IAllowedElements,
} from '..';

describe('attributeTranformer tests', () => {
  describe('transformStyle', () => {
    it('transforms style attribute', () => {
      expect(
        transformStyle({
          name: 'style',
          value: 'fill:rgb(0,0,255);stroke:rgb(0,0,0)',
        }),
      ).toEqual({
        fill: 'rgb(0,0,255)',
        stroke: 'rgb(0,0,0)',
      });
    });

    it('transforms style attribute with dash-case attribute and ignores invalid values', () => {
      expect(
        transformStyle({
          name: 'style',
          value: 'stop-color:#ffffff;:ignored-value',
        }),
      ).toEqual({
        stopColor: '#ffffff',
      });
    });

    it('transforms style attribute with dash-case attribute and ignores invalid values', () => {
      expect(
        transformStyle({
          name: 'style',
          value: 'fill: #ffffff',
          fillProp: '#ff00ff',
        }),
      ).toEqual({
        fill: '#ff00ff',
      });
    });

    it('does not transform style attribute because it does not have a valid value', () => {
      expect(transformStyle({ name: 'style', value: '' })).toBe(null);
    });
  });

  describe('camelCaseAttribute', () => {
    it('gets name of the in camelCase format', () => {
      expect(camelCaseAttribute({ name: 'stop-color', value: '2px' })).toEqual({
        name: 'stopColor',
        value: '2px',
      });
    });
  });

  describe('removePixelsFromAttribute', () => {
    it('removes pixels from x, y, height and width attributes', () => {
      expect(
        removePixelsFromAttribute({ name: 'x', value: '2px' })).toEqual({
        name: 'x',
        value: '2',
      });
      expect(removePixelsFromAttribute({ name: 'y', value: '4px' })).toEqual({
        name: 'y',
        value: '4',
      });
      expect(
        removePixelsFromAttribute({ name: 'height', value: '65px' }),
      ).toEqual({ name: 'height', value: '65' });
      expect(
        removePixelsFromAttribute({ name: 'width', value: '999px' }),
      ).toEqual({ name: 'width', value: '999' });
    });
  });

  describe('getEnabledAttributes', () => {
    it('return true when name is found', () => {
      const enabledAttributes = ['x', 'y', 'strokeOpacity'];
      const hasEnabledAttribute = getEnabledAttributes(enabledAttributes);

      expect(hasEnabledAttribute({ name: 'x', value: '' })).toEqual(true);
      expect(hasEnabledAttribute({ name: 'stroke-opacity', value: '' })).toEqual(true);
    });

    it('return false when name is not found', () => {
      const enabledAttributes = ['width', 'height'];
      const hasEnabledAttribute = getEnabledAttributes(enabledAttributes);

      expect(hasEnabledAttribute({ name: 'depth', value: '' })).toEqual(false);
    });
  });

  describe('obtainComponentAtts', () => {
    const createAttribute = (name: string, value: string): Attribute => ({ name, value });
    const styleWithFill = createAttribute(
      'style',
      'fill:rgb(0,0,255);stroke:rgb(0,0,0)',
    );
    const fillNone = createAttribute('fill', 'none');
    const attributes = [
      createAttribute('opacity', '1px'),
      createAttribute('x', ''),
      createAttribute('another-prop-not-allowed', 'value not allowed'),
      createAttribute('enabled-prop', 'value enabled'),
      createAttribute(
        'style-allowed-property',
        'fill:rgb(0,0,255);stroke:rgb(0,0,0)',
      ),
    ];

    const enabledAttributes = ['enabledProp', 'styleAllowedProperty'];

    it('gets the components attributes without the "fill" property', () => {
      const componentAttrs = obtainComponentAtts(
        { attributes} as any,
        enabledAttributes,
      );

      expect(componentAttrs).toEqual({
        enabledProp: 'value enabled',
        opacity: '1',
        styleAllowedProperty: 'fill:rgb(0,0,255);stroke:rgb(0,0,0)',
        x: '',
      });
    });

    it('gets the components attributes with "fill" untouched', () => {
      const componentAttrs = obtainComponentAtts(
        { attributes: attributes.concat(fillNone) } as any, 
        enabledAttributes,
      );

      expect(componentAttrs).toEqual({
        enabledProp: 'value enabled',
        fill: 'none',
        opacity: '1',
        styleAllowedProperty: 'fill:rgb(0,0,255);stroke:rgb(0,0,0)',
        x: '',
      });
    });

    it('gets the components attributes with "fill" replaced from "none" by the style', () => {
      const componentAttrs = obtainComponentAtts(
        { attributes: attributes.concat([fillNone, styleWithFill]) } as any,
        enabledAttributes,
      );

      expect(componentAttrs).toEqual({
        enabledProp: 'value enabled',
        fill: 'rgb(0,0,255)',
        opacity: '1',
        stroke: 'rgb(0,0,0)',
        styleAllowedProperty: 'fill:rgb(0,0,255);stroke:rgb(0,0,0)',
        x: '',
      });
    });

    it('gets the components attributes with "fill" replaced from style by the fill argument', () => {
      const componentAttrs = obtainComponentAtts(
        { attributes: attributes.concat(styleWithFill) } as any,
        enabledAttributes,
        '#ffaa00',
      );

      expect(componentAttrs).toEqual({
        enabledProp: 'value enabled',
        fill: '#ffaa00',
        opacity: '1',
        stroke: 'rgb(0,0,0)',
        styleAllowedProperty: 'fill:rgb(0,0,255);stroke:rgb(0,0,0)',
        x: '',
      });
    });

    it('gets the components attributes with "fill" replaced from prop by the fill argument', () => {
      const componentAttrs = obtainComponentAtts(
        { attributes: attributes.concat(createAttribute('fill', '#ff0000')) } as any,
        enabledAttributes,
        '#0000ff',
        true,
      );

      expect(componentAttrs).toEqual({
        enabledProp: 'value enabled',
        fill: '#0000ff',
        opacity: '1',
        styleAllowedProperty: 'fill:rgb(0,0,255);stroke:rgb(0,0,0)',
        x: '',
      });
    });
  });

  describe('elementsMap[*].postProcessAttributes', () => {
    const emptyAttributesObj = {} as any;
    const emptyNode = { attributes: [] } as any;

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
        const elementItem = elementsMap[elementName as IAllowedElements];
        expect(
          elementItem.postProcessAttributes(emptyAttributesObj),
        ).toBe(postProcessAttributes(emptyAttributesObj));

        expect(elementItem.postProcessAttributes).toBe(
          postProcessAttributes,
        );
      });
    });

    it('always gets a new object regardless the arguments passed to "defs" method', () => {
      const { postProcessAttributes } = elementsMap['defs'];
      const withoutProps = postProcessAttributes(
        emptyAttributesObj,
        undefined as any,
        emptyNode,
      ) as () => void;;
      const withPropsButNoProperties = postProcessAttributes(
        emptyAttributesObj,
        {} as any,
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
        {} as any,
        emptyNode,
      );
      const withFillPropUndefined = postProcessAttributes(
        emptyAttributesObj,
        { fill: undefined } as any,
        emptyNode,
      );

      expect(withoutProps).toBe(emptyAttributesObj);
      expect(withoutFillProp).toBe(emptyAttributesObj);
      expect(withFillPropUndefined).toBe(emptyAttributesObj);
    });

    it('gets the attritubes with the "fill" prop when it is provided for "path" method', () => {
      const withFillProp = { fill: 'value for fill prop' } as any;
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
        {} as any,
        emptyNode,
      );
      const withHeightPropNull = postProcessAttributes(
        emptyAttributesObj,
        { height: null } as any,
        emptyNode,
      );
      const withWidthPropNull = postProcessAttributes(
        emptyAttributesObj,
        { width: null } as any,
        emptyNode,
      );
      const withHeightAndWidthPropNull = postProcessAttributes(
        emptyAttributesObj,
        { height: null, width: null } as any,
        emptyNode,
      );

      expect(withoutProps).toBe(emptyAttributesObj);
      expect(withoutHeightOrWidthProp).toBe(emptyAttributesObj);
      expect(withHeightPropNull).toBe(emptyAttributesObj);
      expect(withWidthPropNull).toBe(emptyAttributesObj);
      expect(withHeightAndWidthPropNull).toBe(emptyAttributesObj);
    });

    it('gets the attritubes with the "height" prop when it is provided for "svg" method', () => {
      const withHeightProp = { height: '1342px' } as any;
      const attrWithHeight = elementsMap['svg'].postProcessAttributes(
        emptyAttributesObj,
        withHeightProp,
        emptyNode,
      );

      expect(attrWithHeight).toEqual(withHeightProp);
      expect(attrWithHeight).not.toBe(withHeightProp);
    });

    it('gets the attritubes with the "width" prop when it is provided for "svg" method', () => {
      const withWidthProp = { width: '1342px' } as any;
      const attrWithWidth = elementsMap['svg'].postProcessAttributes(
        emptyAttributesObj,
        withWidthProp,
        emptyNode,
      );

      expect(attrWithWidth).toEqual(withWidthProp);
      expect(attrWithWidth).not.toBe(withWidthProp);
    });

    it('gets the attritubes with the "height" and "width" prop when it is provided for "svg" method', () => {
      const withHeightAndWidthProp = { height: '1342px', width: '1394px' } as any;
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
      const yNullAttribute = { y: null } as any;
      const withUndefinedAttributes = postProcessAttributes(
        undefined,
        {} as any,
        emptyNode,
      );
      const withoutYAttribute = postProcessAttributes(
        emptyAttributesObj,
        {} as any,
        emptyNode,
      );
      const withYAttributeNull = postProcessAttributes(
        yNullAttribute,
        {} as any,
        emptyNode,
      );

      expect(withUndefinedAttributes).toBeUndefined();
      expect(withoutYAttribute).toBe(emptyAttributesObj);
      expect(withYAttributeNull).toBe(yNullAttribute);
    });

    it('gets the attritubes with the "y" prop when it is provided for "tspan" method', () => {
      const withYAttributes = { y: 4 } as any;
      const attrWithY = elementsMap['tspan'].postProcessAttributes(
        withYAttributes,
        {} as any,
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
      } as any;
      const withUndefinedAttributes = postProcessAttributes(
        emptyAttributesObj,
        {} as any,
        nodeWithXLinkHrefAttribute,
      );

      expect(withUndefinedAttributes).toEqual({ href: hrefLegacy });
    });

    it('gets hyperlink reference passed as "href" attribute to "use" method', () => {
      const { postProcessAttributes } = elementsMap['use'];
      const nodeWithXLinkHrefAttribute = {
        attributes: [{ name: 'href', value: href }],
      } as any;
      const withUndefinedAttributes = postProcessAttributes(
        emptyAttributesObj,
        {} as any,
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
      } as any;
      const withUndefinedAttributes = postProcessAttributes(
        emptyAttributesObj,
        {} as any,
        nodeWithXLinkHrefAttribute,
      );

      expect(withUndefinedAttributes).toEqual({ href });
    });
    // #endregion
  });

  describe('renderSvgElementByNodeWithItsChildNodes', () => {
    const svgRenderer = jest.fn((...args) => args) as any;
    const notAllowedRenderer = jest.fn(node => node.nodeName);

  const createNode = (
    attributes: Attribute[] = [],
    nodeName: string = 'none',
    nodeValue?: string,
  ): XmlNode => ({
    attributes,
    nodeName,
    nodeValue,
  });
    const notAllowedNode = createNode([], 'notAllowedNode');
    const svgNodeWithoutChildNodes = createNode([], 'svg');
    const svgNodeWithNotAllowedChildNodes = {
      ...svgNodeWithoutChildNodes,
      childNodes: [notAllowedNode],
    };

    afterEach(() => {
      svgRenderer.mockClear();
      notAllowedRenderer.mockClear();
    });

    it('renders "null" when the passed "node" is not allowed and the "notAllowedSvgElementsRenderer" is not a valid function', () => {
      const rendered = renderSvgElementByNodeWithItsChildNodes(
        notAllowedNode,
        svgRenderer,
        null,
      );
      expect(rendered).toBeNull();
      expect(svgRenderer).not.toHaveBeenCalled();
      expect(notAllowedRenderer).not.toHaveBeenCalled();
    });

    it('renders "null" when the "notAllowedSvgElementsRenderer" is not a valid function', () => {
      const rendered = renderSvgElementByNodeWithItsChildNodes(
        null,
        svgRenderer,
        notAllowedRenderer,
      );

      expect(rendered).toBeNull();
      expect(svgRenderer).not.toHaveBeenCalled();
      expect(notAllowedRenderer).not.toHaveBeenCalled();
    });

    it('renders "null" when the  "svgElementRenderer" is not a valid function', () => {
      const rendered = renderSvgElementByNodeWithItsChildNodes(
        notAllowedNode,
        null,
        notAllowedRenderer,
      );

      expect(rendered).toBeNull();
      expect(svgRenderer).not.toHaveBeenCalled();
      expect(notAllowedRenderer).not.toHaveBeenCalled();
    });

    it('calls "notAllowedSvgElementsRenderer" when the passed "node" is not allowed', () => {
      const rendered = renderSvgElementByNodeWithItsChildNodes(
        notAllowedNode,
        svgRenderer,
        notAllowedRenderer,
      );

      expect(rendered).toBe(notAllowedNode.nodeName);
      expect(svgRenderer).not.toHaveBeenCalled();
      expect(notAllowedRenderer).toHaveBeenCalledTimes(1);
      expect(notAllowedRenderer).toHaveBeenCalledWith(notAllowedNode);
    });

    it('renders the node with no children when it has no child nodes', () => {
      const rendered = renderSvgElementByNodeWithItsChildNodes(
        svgNodeWithoutChildNodes,
        svgRenderer,
        notAllowedRenderer,
      );

      expect(rendered).toEqual([svgNodeWithoutChildNodes, []]);
      expect(svgRenderer).toHaveBeenCalledTimes(1);
      expect(svgRenderer).toHaveBeenCalledWith(svgNodeWithoutChildNodes, []);
      expect(notAllowedRenderer).not.toHaveBeenCalled();
    });

    it('renders the node with no children when it has "0" child nodes', () => {
      const svgNodeWithZeroChildNodes = {
        ...svgNodeWithoutChildNodes,
        childNodes: [],
      };
      const rendered = renderSvgElementByNodeWithItsChildNodes(
        svgNodeWithZeroChildNodes,
        svgRenderer,
        notAllowedRenderer,
      );

      expect(rendered).toEqual([svgNodeWithZeroChildNodes, []]);
      expect(svgRenderer).toHaveBeenCalledTimes(1);
      expect(svgRenderer).toHaveBeenCalledWith(svgNodeWithZeroChildNodes, []);
      expect(notAllowedRenderer).not.toHaveBeenCalled();
    });

    it('renders the node with a text child and another node child', () => {
      const textNode = createNode([], 'text','this is the value of the text node');
      const svgNodeWithTextAndNormalNodeChildNodes = {
        ...svgNodeWithoutChildNodes,
        childNodes: [textNode, svgNodeWithoutChildNodes],
      };
      const rendered = renderSvgElementByNodeWithItsChildNodes(
        svgNodeWithTextAndNormalNodeChildNodes,
        svgRenderer,
        notAllowedRenderer,
      );

      expect(rendered).toEqual([
        svgNodeWithTextAndNormalNodeChildNodes,
        [textNode.nodeValue, [svgNodeWithoutChildNodes, []]],
      ]);
      expect(svgRenderer).toHaveBeenCalledTimes(2);
      expect(svgRenderer).toHaveBeenNthCalledWith(
        1,
        svgNodeWithoutChildNodes,
        [],
      );
      expect(svgRenderer).toHaveBeenNthCalledWith(
        2,
        svgNodeWithTextAndNormalNodeChildNodes,
        [textNode.nodeValue, [svgNodeWithoutChildNodes, []]],
      );
      expect(notAllowedRenderer).not.toHaveBeenCalled();
    });

    it('renders the node with a not allowed child', () => {
      const rendered = renderSvgElementByNodeWithItsChildNodes(
        svgNodeWithNotAllowedChildNodes,
        svgRenderer,
        notAllowedRenderer,
      );

      expect(rendered).toEqual([
        svgNodeWithNotAllowedChildNodes,
        [notAllowedNode.nodeName],
      ]);
      expect(svgRenderer).toHaveBeenCalledTimes(1);
      expect(notAllowedRenderer).toHaveBeenCalledTimes(1);
      expect(svgRenderer).toHaveBeenCalledWith(svgNodeWithNotAllowedChildNodes, [
        notAllowedNode.nodeName
      ]);
      expect(notAllowedRenderer).toHaveBeenCalledWith(notAllowedNode);
    });

    it('renders the node with a not allowed child and an invalid "notAllowedSvgElementsRenderer" function', () => {
      const rendered = renderSvgElementByNodeWithItsChildNodes(
        svgNodeWithNotAllowedChildNodes,
        svgRenderer,
        null,
      );

      expect(rendered).toEqual([svgNodeWithNotAllowedChildNodes, []]);
      expect(svgRenderer).toHaveBeenCalledTimes(1);
      expect(svgRenderer).toHaveBeenCalledWith(
        svgNodeWithNotAllowedChildNodes,
        [],
      );
      expect(notAllowedRenderer).not.toHaveBeenCalled();
    });
  });
});
