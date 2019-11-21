import dashToCamelCase from './dashToCamelCase';

export const camelCaseNodeName = ({ nodeName, nodeValue }) => ({
  nodeName: dashToCamelCase(nodeName),
  nodeValue,
});

export const removePixelsFromNodeValue = ({ nodeName, nodeValue }) => ({
  nodeName,
  nodeValue: nodeValue && nodeValue.replace('px', ''),
});

export const transformStyle = ({ nodeName, nodeValue, fillProp }) => {
  if (nodeName === 'style' && !!nodeValue) {
    return nodeValue.split(';').reduce((acc, attribute) => {
      const [property, value] = attribute.split(':');
      if (property == '') {
        return acc;
      }

      return {
        ...acc,
        [dashToCamelCase(property)]:
          fillProp && property === 'fill' ? fillProp : value,
      };
    }, {});
  }
  return null;
};

export const getEnabledAttributes = enabledAttributes => ({ nodeName }) =>
  enabledAttributes.includes(dashToCamelCase(nodeName));

const COMMON_ATTS = [
  'id',
  'fill',
  'fillOpacity',
  'stroke',
  'strokeWidth',
  'strokeOpacity',
  'opacity',
  'strokeLinecap',
  'strokeLinejoin',
  'strokeDasharray',
  'strokeDashoffset',
  'x',
  'y',
  'rotate',
  'scale',
  'origin',
  'originX',
  'originY',
  'transform',
  'clipPath',
  'fillRule',
];

export const obtainComponentAtts = (
  { attributes },
  enabledAttributes,
  fill,
  fillAll,
) => {
  const styleAtts = {};
  const attributeItems = Array.from(attributes);

  if (fill && fillAll) {
    styleAtts.fill = fill;
  }

  attributeItems.forEach(({ nodeName, nodeValue }) => {
    Object.assign(
      styleAtts,
      transformStyle({
        nodeName,
        nodeValue,
        fillProp: fill,
      }),
    );
  });

  const formatToCamelAndRemovePixels = nodeItem =>
    removePixelsFromNodeValue(camelCaseNodeName(nodeItem));

  const componentAtts = attributeItems
    .map(formatToCamelAndRemovePixels)
    .filter(getEnabledAttributes(enabledAttributes.concat(COMMON_ATTS)))
    .reduce((acc, { nodeName, nodeValue }) => {
      acc[nodeName] =
        fill && nodeName === 'fill' && nodeValue !== 'none' ? fill : nodeValue;
      return acc;
    }, {});

  Object.assign(componentAtts, styleAtts);

  return componentAtts;
};
