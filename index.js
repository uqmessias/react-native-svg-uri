import React from 'react';
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

// TODO: reorganize it and add tests
const parseSvgXml = svgXml => {
  if (!svgXml) {
    return null;
  }

  try {
    const inputSVG = svgXml
      // Removing comments
      .substring(svgXml.indexOf('<svg '), svgXml.indexOf('</svg>') + 6)
      .replace(/<!-(.*?)->/g, '');

    const parser = new xmldom.DOMParser();
    const doc = parser.parseFromString(inputSVG);

    return doc.childNodes[0];
  } catch (e) {
    console.warn(
      `Ops, an error has occurred while trying to parse a SVG from "${svgXml}"`,
      e,
    );
  }

  return null;
};

class SvgRenderer extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      rootSvgNode: null,
    };

    this.isComponentMounted = false;
  }

  async componentDidMount() {
    this.isComponentMounted = true;

    if (!!this.props.svgXmlData) {
      const rootSvgNode = parseSvgXml(this.props.svgXmlData);

      if (!!rootSvgNode) {
        this.setState({ rootSvgNode });

        return;
      }
    }

    if (!!this.props.source) {
      const source = resolveAssetSource(this.props.source) || {};
      await this.handleUri(source.uri);
    }
  }

  async componentDidUpdate({ source, svgXmlData }) {
    if (svgXmlData !== this.props.svgXmlData) {
      const rootSvgNode = parseSvgXml(svgXmlData);

      if (!!rootSvgNode) {
        this.setState({ rootSvgNode });

        return;
      }
    }

    if (source !== this.props.source) {
      const assetSource =
        (this.props.source && resolveAssetSource(this.props.source)) || {};
      const nextAssetSource = (source && resolveAssetSource(source)) || {};

      if (assetSource.uri !== nextAssetSource.uri) {
        await this.handleUri(nextAssetSource.uri);
      }
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
      const rootSvgNode = parseSvgXml(svgXmlData);

      this.setState({ rootSvgNode }, () => {
        if (!rootSvgNode) {
          return;
        }

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
    const { fill, fillAll } = this.props;
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
    const { rootSvgNode } = this.state;

    if (!rootSvgNode) {
      return null;
    }

    try {
      // reset the key index
      ind = 0;
      const rootSvg = utils.renderSvgElementByNodeWithItsChildNodes(
        rootSvgNode,
        this.renderSvgElement,
        this.renderNotAllowedSvgElement,
      );

      return <View style={this.props.style}>{rootSvg}</View>;
    } catch (e) {
      console.error(
        `Ops, an error has occurred while trying to render a SVG`,
        this.props,
      );
    }

    return null;
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
