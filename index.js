import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import xmldom from 'xmldom';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

import Svg, {
  Circle,
  Ellipse,
  G,
  LinearGradient,
  RadialGradient,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
  Text,
  TSpan,
  Defs,
  Use,
  Stop,
} from 'react-native-svg';

import * as utils from './utils/transformers';
import { trimElementChilden } from './utils';

const tagsMap = {
  ['circle']: Circle,
  ['defs']: Defs,
  ['ellipse']: Ellipse,
  ['g']: G,
  ['line']: Line,
  ['linearGradient']: LinearGradient,
  ['path']: Path,
  ['polygon']: Polygon,
  ['polyline']: Polyline,
  ['radialGradient']: RadialGradient,
  ['rect']: Rect,
  ['stop']: Stop,
  ['svg']: Svg,
  ['text']: Text,
  ['tspan']: TSpan,
  ['use']: Use,
};

const ACCEPTED_SVG_ELEMENTS = [
  'svg',
  'g',
  'circle',
  'path',
  'rect',
  'defs',
  'use',
  'line',
  'linearGradient',
  'radialGradient',
  'stop',
  'ellipse',
  'polygon',
  'polyline',
  'text',
  'tspan',
];

let ind = 0;

class SvgRenderer extends Component {
  constructor(props) {
    super(props);

    this.state = { fill: props.fill, svgXmlData: props.svgXmlData };

    this.createSVGElement = this.createSVGElement.bind(this);
    this.inspectNode = this.inspectNode.bind(this);
    this.fetchSVGData = this.fetchSVGData.bind(this);

    this.isComponentMounted = false;

    // Gets the image data from an URL or a static file
    if (props.source) {
      const source = resolveAssetSource(props.source) || {};
      this.fetchSVGData(source.uri);
    }
  }

  componentWillMount() {
    this.isComponentMounted = true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.source) {
      const source = resolveAssetSource(nextProps.source) || {};
      const oldSource = resolveAssetSource(this.props.source) || {};
      if (source.uri !== oldSource.uri) {
        this.fetchSVGData(source.uri);
      }
    }

    if (nextProps.svgXmlData !== this.props.svgXmlData) {
      this.setState({ svgXmlData: nextProps.svgXmlData });
    }

    if (nextProps.fill !== this.props.fill) {
      this.setState({ fill: nextProps.fill });
    }
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
  }

  async fetchSVGData(uri) {
    let responseXML = null,
      error = null;
    try {
      const response = await fetch(uri);
      responseXML = await response.text();
    } catch (e) {
      error = e;
      console.error('ERROR SVG', e);
    } finally {
      if (this.isComponentMounted) {
        this.setState({ svgXmlData: responseXML }, () => {
          const { onLoad } = this.props;
          if (onLoad && !error) {
            onLoad();
          }
        });
      }
    }

    return responseXML;
  }

  createSVGElement(node, unTrimmedChildren) {
    const i = ind++;
    const ElementTag = tagsMap[node.nodeName];
    const element = utils.elementsMap[node.nodeName];

    if (!ElementTag || !element) {
      return null;
    }

    const children = trimElementChilden(unTrimmedChildren);
    const { fill, fillAll } = this.state;
    const { obtainComponentAtts } = utils;
    const attrs = obtainComponentAtts(
      node,
      element.allowedAttributes,
      fill,
      fillAll,
    );
    const componentAtts = element.postProcessAttributes(
      attrs,
      this.props,
      node,
    );

    return (
      <ElementTag key={`${node.nodeName}-${i}`} {...componentAtts}>
        {children}
      </ElementTag>
    );
  }

  inspectNode(node) {
    // Only process accepted elements
    if (!ACCEPTED_SVG_ELEMENTS.includes(node.nodeName)) {
      return <View key={ind++} />;
    }

    // Process the xml node
    const arrayElements = [];

    // if have children process them.
    // Recursive function.
    if (node.childNodes && node.childNodes.length > 0) {
      for (let i = 0; i < node.childNodes.length; i++) {
        const isTextValue = node.childNodes[i].nodeValue;
        if (isTextValue) {
          arrayElements.push(node.childNodes[i].nodeValue);
        } else {
          const nodo = this.inspectNode(node.childNodes[i]);
          if (nodo != null) {
            arrayElements.push(nodo);
          }
        }
      }
    }

    return this.createSVGElement(node, arrayElements);
  }

  render() {
    try {
      if (this.state.svgXmlData == null) {
        return null;
      }

      const inputSVG = this.state.svgXmlData
        .substring(
          this.state.svgXmlData.indexOf('<svg '),
          this.state.svgXmlData.indexOf('</svg>') + 6,
        )
        .replace(/<!-(.*?)->/g, '');

      const doc = new xmldom.DOMParser().parseFromString(inputSVG);

      const rootSVG = this.inspectNode(doc.childNodes[0]);

      return <View style={this.props.style}>{rootSVG}</View>;
    } catch (e) {
      console.error('ERROR SVG', e);
      return null;
    }
  }
}

SvgRenderer.propTypes = {
  style: PropTypes.object,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  svgXmlData: PropTypes.string,
  source: PropTypes.any,
  fill: PropTypes.string,
  onLoad: PropTypes.func,
  fillAll: PropTypes.bool,
};

module.exports = SvgRenderer;
