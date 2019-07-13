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
