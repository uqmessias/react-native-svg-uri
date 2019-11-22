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
import { fetchSvgData, trimElementChilden } from './utils';

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

let ind = 0;

class SvgRenderer extends Component {
  constructor(props) {
    super(props);

    this.state = { fill: props.fill, svgXmlData: props.svgXmlData };

    this.isComponentMounted = false;
  }

  async componentDidMount() {
    this.isComponentMounted = true;

    if (!!this.props.source) {
      const source = resolveAssetSource(this.props.source) || {};
      await this.handleUri(source.uri);
    }
  }

  async componentDidUpdate({ fill, source, svgXmlData }) {
    if (source !== this.props.source) {
      const assetSource = resolveAssetSource(this.props.source) || {};
      const nextAssetSource = resolveAssetSource(source) || {};

      if (nextAssetSource.uri !== assetSource.uri) {
        await this.handleUri(nextAssetSource.uri);
      }
    }

    if (svgXmlData !== this.props.svgXmlData) {
      this.setState({ svgXmlData });
    }

    if (fill !== this.props.fill) {
      this.setState({ fill });
    }
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
  }

  handleUri = async uri => {
    const { data: svgXmlData, error } = await fetchSvgData(uri);

    if (!!error) {
      console.warn(
        `Ops, an error has occurred while trying to fetch a SVG from "${uri}"`,
        error,
      );
      return;
    }

    if (this.isComponentMounted) {
      this.setState({ svgXmlData }, () => {
        const { onLoad } = this.props;

        if (typeof onLoad === 'function') {
          onLoad();
        }
      });
    }
  };

  renderSvgElement = (node, unTrimmedChildren) => {
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
  };

  renderNotAllowedSvgElement = node => <View key={ind++} />;

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

      const rootSVG = utils.renderSvgElementByNodeWithItsChildNodes(
        doc.childNodes[0],
        this.renderSvgElement,
        this.renderNotAllowedSvgElement,
      );

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
