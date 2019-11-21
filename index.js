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
import { getFixedYPosition, getHrefValue, trimElementChilden } from './utils';

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

// Attributes from SVG elements that are mapped directly.
const SVG_ATTS = ['viewBox', 'width', 'height'];
const G_ATTS = ['id'];

const CIRCLE_ATTS = ['cx', 'cy', 'r'];
const PATH_ATTS = ['d'];
const RECT_ATTS = ['width', 'height'];
const LINE_ATTS = ['x1', 'y1', 'x2', 'y2'];
const LINEARG_ATTS = LINE_ATTS.concat(['id', 'gradientUnits', 'fx', 'fy']);
const RADIALG_ATTS = CIRCLE_ATTS.concat(['id', 'gradientUnits', 'fx', 'fy']);
const STOP_ATTS = ['offset', 'stopColor'];
const ELLIPSE_ATTS = ['cx', 'cy', 'rx', 'ry'];

const TEXT_ATTS = ['fontFamily', 'fontSize', 'fontWeight', 'textAnchor'];

const POLYGON_ATTS = ['points'];
const POLYLINE_ATTS = ['points'];

const USE_ATTS = ['href'];

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
    const children = trimElementChilden(unTrimmedChildren);
    let componentAtts = {};
    const i = ind++;
    const { fill, fillAll } = this.state;
    const { obtainComponentAtts } = utils;

    switch (node.nodeName) {
      case 'svg':
        componentAtts = obtainComponentAtts(node, SVG_ATTS, fill, fillAll);
        if (this.props.width) {
          componentAtts.width = this.props.width;
        }
        if (this.props.height) {
          componentAtts.height = this.props.height;
        }

        return (
          <Svg key={i} {...componentAtts}>
            {children}
          </Svg>
        );
      case 'g':
        componentAtts = obtainComponentAtts(node, G_ATTS, fill, fillAll);
        return (
          <G key={i} {...componentAtts}>
            {children}
          </G>
        );
      case 'path':
        componentAtts = obtainComponentAtts(node, PATH_ATTS, fill, fillAll);
        if (this.props.fill) {
          componentAtts.fill = this.props.fill;
        }
        return (
          <Path key={i} {...componentAtts}>
            {children}
          </Path>
        );
      case 'circle':
        componentAtts = obtainComponentAtts(node, CIRCLE_ATTS, fill, fillAll);
        return (
          <Circle key={i} {...componentAtts}>
            {children}
          </Circle>
        );
      case 'rect':
        componentAtts = obtainComponentAtts(node, RECT_ATTS, fill, fillAll);
        return (
          <Rect key={i} {...componentAtts}>
            {children}
          </Rect>
        );
      case 'line':
        componentAtts = obtainComponentAtts(node, LINE_ATTS, fill, fillAll);
        return (
          <Line key={i} {...componentAtts}>
            {children}
          </Line>
        );
      case 'defs':
        return <Defs key={i}>{children}</Defs>;
      case 'use':
        componentAtts = obtainComponentAtts(node, USE_ATTS, fill, fillAll);
        componentAtts.href = getHrefValue(node);
        return <Use key={i} {...componentAtts} />;
      case 'linearGradient':
        componentAtts = obtainComponentAtts(node, LINEARG_ATTS, fill, fillAll);
        return (
          <LinearGradient key={i} {...componentAtts}>
            {children}
          </LinearGradient>
        );
      case 'radialGradient':
        componentAtts = obtainComponentAtts(node, RADIALG_ATTS, fill, fillAll);
        return (
          <RadialGradient key={i} {...componentAtts}>
            {children}
          </RadialGradient>
        );
      case 'stop':
        componentAtts = obtainComponentAtts(node, STOP_ATTS, fill, fillAll);
        return (
          <Stop key={i} {...componentAtts}>
            {children}
          </Stop>
        );
      case 'ellipse':
        componentAtts = obtainComponentAtts(node, ELLIPSE_ATTS, fill, fillAll);
        return (
          <Ellipse key={i} {...componentAtts}>
            {children}
          </Ellipse>
        );
      case 'polygon':
        componentAtts = obtainComponentAtts(node, POLYGON_ATTS, fill, fillAll);
        return (
          <Polygon key={i} {...componentAtts}>
            {children}
          </Polygon>
        );
      case 'polyline':
        componentAtts = obtainComponentAtts(node, POLYLINE_ATTS, fill, fillAll);
        return (
          <Polyline key={i} {...componentAtts}>
            {children}
          </Polyline>
        );
      case 'text':
        componentAtts = obtainComponentAtts(node, TEXT_ATTS, fill, fillAll);
        return (
          <Text key={i} {...componentAtts}>
            {children}
          </Text>
        );
      case 'tspan':
        componentAtts = obtainComponentAtts(node, TEXT_ATTS, fill, fillAll);
        if (componentAtts.y) {
          componentAtts.y = getFixedYPosition(node, componentAtts.y);
        }
        return (
          <TSpan key={i} {...componentAtts}>
            {children}
          </TSpan>
        );
      default:
        return null;
    }
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
