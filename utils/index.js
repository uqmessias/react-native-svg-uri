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
  if (!!node.attributes) {
    const fontSizeAttr = Object.keys(node.attributes).find(
      a => node.attributes[a].name === 'font-size',
    );

    if (!!fontSizeAttr) {
      return (
        '' +
        (parseFloat(y.toString()) -
          parseFloat(node.attributes[fontSizeAttr].value))
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
  if (!!node.attributes) {
    const attrKeys = Object.keys(node.attributes);
    const hrefAttr = attrKeys.find(key => node.attributes[key].name === 'href');
    const legacyHrefAttr = attrKeys.find(
      key => node.attributes[key].name === 'xlink:href',
    );

    return (node.attributes[hrefAttr] || node.attributes[legacyHrefAttr] || {})
      .value;
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
