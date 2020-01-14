// @ts-check
/**
 * @typedef {object} XmlNode
 * @property {Array<{name: string,value: string}>} [attributes]
 * @property {XmlNode} [parentNode]
 */

/**
 * Get the fixed Y position for the node
 * @param {XmlNode} node
 * @param {number} y
 */
export const getFixedYPosition = (node, y) => {
  if (!!node.attributes.length) {
    const fontSizeAttrIndex = Object.values(node.attributes).findIndex(
      ({ name }) => name === 'font-size',
    );

    if (fontSizeAttrIndex >= 0) {
      return (
        parseFloat(y.toString()) -
        parseFloat(node.attributes[fontSizeAttrIndex].value)
      );
    }
  }

  if (!node.parentNode) {
    return y;
  }

  return getFixedYPosition(node.parentNode, y);
};

/**
 * Gets the node's "xlink:href" or "href" value if any of them exists
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use#Attributes
 * @param {XmlNode} node
 * @returns {string} The node "xlink:href" or "href" value
 */
export const getHrefValue = node => {
  if (!!node.attributes.length) {
    const attrs = Object.values(node.attributes);
    const hrefAttrIndex = attrs.findIndex(({ name }) => name === 'href');
    const legacyHrefAttrIndex = attrs.findIndex(
      ({ name }) => name === 'xlink:href',
    );

    return (
      node.attributes[hrefAttrIndex] ||
      node.attributes[legacyHrefAttrIndex] ||
      {}
    ).value;
  }

  return null;
};

/**
 * Removes string items from the children array
 * @param {Array<any|string>} children
 */
export const trimElementChilden = children =>
  children.filter(
    child => typeof child !== 'string' || child.trim().length !== 0,
  );

export const fetchSvgData = async uri => {
  let data = undefined;
  let error = undefined;

  try {
    const response = await fetch(uri);
    data = await response.text();
  } catch (e) {
    error = e;
  }

  return {
    data,
    error,
  };
};
