import React from 'react';
import {
  Image,
  View,
  ImageResolvedAssetSource,
} from 'react-native';
import xmldom from 'xmldom';
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

import { Props, State, XmlNode } from './utils/types';

import * as utils from './utils/transformers';
import { fetchSvgData, trimElementChilden } from './utils';

const tagsMap: Record<utils.IAllowedElements, React.ComponentType> = {
  circle: Circle,
  defs: Defs,
  ellipse: Ellipse,
  g: G,
  line: Line,
  linearGradient: LinearGradient,
  path: Path,
  polygon: Polygon,
  polyline: Polyline,
  radialGradient: RadialGradient,
  rect: Rect,
  stop: Stop,
  svg: Svg,
  text: Text,
  tspan: TSpan,
  use: Use,
};

let ind = 0;

// TODO: reorganize it and add tests
const parseSvgXml = (svgXml?: string | null) => {
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

const emptyAsset = {uri: undefined} as Partial<ImageResolvedAssetSource>;

class SvgRenderer extends React.PureComponent<Props, State> {
  private isComponentMounted: boolean = false;
  state: State = { rootSvgNode: null };

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
      const source = Image.resolveAssetSource(this.props.source) || {};
      await this.handleUri(source.uri);
    }
  }

  async componentDidUpdate({ source, svgXmlData }: Props) {
    if (svgXmlData !== this.props.svgXmlData) {
      const rootSvgNode = parseSvgXml(svgXmlData);

      if (!!rootSvgNode) {
        this.setState({ rootSvgNode });

        return;
      }
    }

    if (source !== this.props.source) {

      const assetSource =
        (this.props.source && Image.resolveAssetSource(this.props.source)) ||
        emptyAsset;
      const nextAssetSource =
        (source && Image.resolveAssetSource(source)) || emptyAsset;

      if (assetSource.uri !== nextAssetSource.uri && !!nextAssetSource.uri) {
        await this.handleUri(nextAssetSource.uri);
      }
    }
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
  }

  handleUri = async (uri: string) => {
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

  renderSvgElement = (node: XmlNode, unTrimmedChildren: JSX.Element[]) => {
    const i = ind++;
    const nodeName = node.nodeName as utils.IAllowedElements;
    const ElementTag = tagsMap[nodeName];
    const element = utils.elementsMap[nodeName];

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
      <ElementTag key={`${nodeName}-${i}`} {...componentAtts}>
        {children}
      </ElementTag>
    );
  };

  renderNotAllowedSvgElement = (_: XmlNode) => <View key={ind++} />;

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

export default SvgRenderer;
