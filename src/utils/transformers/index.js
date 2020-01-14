import dashToCamelCase from './dashToCamelCase';
import { getFixedYPosition, getHrefValue } from '..';

export const camelCaseAttribute = attribute => ({
  ...attribute,
  name: dashToCamelCase(attribute.name),
});

export const removePixelsFromAttribute = ({ name, value }) => ({
  name,
  value: value && value.replace('px', ''),
});

export const transformStyle = ({ name, value, fillProp }) => {
  if (name === 'style' && !!value) {
    return value.split(';').reduce((acc, attribute) => {
      const [property, propertyValue] = attribute.split(':');
      if (property == '') {
        return acc;
      }

      return {
        ...acc,
        [dashToCamelCase(property)]:
          fillProp && property === 'fill' ? fillProp : propertyValue,
      };
    }, {});
  }

  return null;
};

export const getEnabledAttributes = enabledAttributes => ({ name }) =>
  enabledAttributes.some(
    enabledAttribute => enabledAttribute === dashToCamelCase(name),
  );

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

  attributeItems.forEach(attribute => {
    Object.assign(
      styleAtts,
      transformStyle({
        ...attribute,
        fillProp: fill,
      }),
    );
  });

  const formatToCamelAndRemovePixels = attribute =>
    removePixelsFromAttribute(camelCaseAttribute(attribute));

  const componentAtts = attributeItems
    .map(formatToCamelAndRemovePixels)
    .filter(getEnabledAttributes(enabledAttributes.concat(COMMON_ATTS)))
    .reduce((acc, { name, value }) => {
      acc[name] = fill && name === 'fill' && value !== 'none' ? fill : value;
      return acc;
    }, {});

  Object.assign(componentAtts, styleAtts);

  return componentAtts;
};

const ALLOWED_ATTRIBUTES = {
  circle: ['cx', 'cy', 'r'],
  defs: [],
  ellipse: ['cx', 'cy', 'rx', 'ry'],
  g: ['id'],
  line: ['x1', 'y1', 'x2', 'y2'],
  linearGradient: ['id', 'gradientUnits', 'fx', 'fy', 'x1', 'y1', 'x2', 'y2'],
  path: ['d'],
  polygon: ['points'],
  polyline: ['points'],
  radialGradient: ['id', 'gradientUnits', 'fx', 'fy', 'cx', 'cy', 'r'],
  rect: ['width', 'height'],
  stop: ['offset', 'stopColor'],
  svg: ['viewBox', 'width', 'height'],
  text: ['fontFamily', 'fontSize', 'fontWeight', 'textAnchor'],
  tspan: [],
  use: ['href'],
};

export const postProcessAttributes = (attributes, props, node) => attributes;

export const elementsMap = {
  ['circle']: {
    postProcessAttributes,
    allowedAttributes: ALLOWED_ATTRIBUTES.circle,
  },
  ['defs']: {
    allowedAttributes: [],
    postProcessAttributes: (attributes, props, node) => ({}),
  },
  ['ellipse']: {
    postProcessAttributes,
    allowedAttributes: ALLOWED_ATTRIBUTES.ellipse,
  },
  ['g']: {
    postProcessAttributes,
    allowedAttributes: ALLOWED_ATTRIBUTES.g,
  },
  ['line']: {
    postProcessAttributes,
    allowedAttributes: ALLOWED_ATTRIBUTES.line,
  },
  ['linearGradient']: {
    postProcessAttributes,
    allowedAttributes: ALLOWED_ATTRIBUTES.linearGradient,
  },
  ['path']: {
    allowedAttributes: ALLOWED_ATTRIBUTES.path,
    postProcessAttributes: (attributes, props, node) => {
      const { fill } = props || {};

      if (!fill) {
        return attributes;
      }

      return Object.assign({}, attributes, { fill });
    },
  },
  ['polygon']: {
    postProcessAttributes,
    allowedAttributes: ALLOWED_ATTRIBUTES.polygon,
  },
  ['polyline']: {
    postProcessAttributes,
    allowedAttributes: ALLOWED_ATTRIBUTES.polyline,
  },
  ['radialGradient']: {
    postProcessAttributes,
    allowedAttributes: ALLOWED_ATTRIBUTES.radialGradient,
  },
  ['rect']: {
    postProcessAttributes,
    allowedAttributes: ALLOWED_ATTRIBUTES.rect,
  },
  ['stop']: {
    postProcessAttributes,
    allowedAttributes: ALLOWED_ATTRIBUTES.stop,
  },
  ['svg']: {
    allowedAttributes: ALLOWED_ATTRIBUTES.svg,
    postProcessAttributes: (attributes, props, node) => {
      const { height, width } = props || {};

      if (!height && !width) {
        return attributes;
      }

      const attrs = Object.assign({}, attributes);

      if (height) {
        attrs.height = height;
      }

      if (width) {
        attrs.width = width;
      }

      return attrs;
    },
  },
  ['text']: {
    postProcessAttributes,
    allowedAttributes: ALLOWED_ATTRIBUTES.text,
  },
  ['tspan']: {
    allowedAttributes: ALLOWED_ATTRIBUTES.tspan,
    postProcessAttributes: (attributes, props, node) => {
      let { y: attrY } = attributes || {};

      if (!attrY) {
        return attributes;
      }

      const y = node && getFixedYPosition(node, attrY);

      return Object.assign({}, attributes, { y });
    },
  },
  ['use']: {
    allowedAttributes: ALLOWED_ATTRIBUTES.use,
    postProcessAttributes: (attributes, props, node) => {
      const href = node && getHrefValue(node);

      return Object.assign({}, attributes, { href });
    },
  },
};

export const renderSvgElementByNodeWithItsChildNodes = (
  node,
  svgElementRenderer,
  notAllowedSvgElementsRenderer,
) => {
  if (!node || typeof svgElementRenderer !== 'function') {
    return null;
  }

  // Only process accepted elements
  if (!elementsMap[node.nodeName]) {
    return typeof notAllowedSvgElementsRenderer === 'function'
      ? notAllowedSvgElementsRenderer(node)
      : null;
  }

  if (!node.childNodes || !node.childNodes.length) {
    return svgElementRenderer(node, []);
  }

  const arrayElements = [];

  // if have children process them.
  for (let i = 0; i < node.childNodes.length; i++) {
    const nodeTextValue = node.childNodes[i].nodeValue;

    if (nodeTextValue) {
      // If this is a text node, just returns the text itself
      arrayElements.push(nodeTextValue);
    } else {
      // Tries to process the next child node
      const svgElement = renderSvgElementByNodeWithItsChildNodes(
        node.childNodes[i],
        svgElementRenderer,
        notAllowedSvgElementsRenderer,
      );

      if (svgElement != null) {
        arrayElements.push(svgElement);
      }
    }
  }

  return svgElementRenderer(node, arrayElements);
};
