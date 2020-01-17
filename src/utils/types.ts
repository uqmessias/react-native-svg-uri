import { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';

export interface Attribute {
  name: string;
  value: string;
}

type AttributeItems = Record<string, Attribute> & Attribute[]

export interface Attributes {
  clipPath?: string;
  cx?: string;
  cy?: string;
  d?: string;
  fill?: string;
  fillOpacity?: string;
  fillRule?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  fx?: string;
  fy?: string;
  gradientUnits?: string;
  height?: string;
  href?: string;
  id?: string;
  offset?: string;
  opacity?: string;
  origin?: string;
  originX?: string;
  originY?: string;
  points?: string;
  r?: string;
  rotate?: string;
  rx?: string;
  ry?: string;
  scale?: string;
  stopColor?: string;
  stroke?: string;
  strokeDasharray?: string;
  strokeDashoffset?: string;
  strokeLinecap?: string;
  strokeLinejoin?: string;
  strokeOpacity?: string;
  strokeWidth?: string;
  textAnchor?: string;
  transform?: string;
  viewBox?: string;
  width?: string;
  x?: string;
  x1?: string;
  x2?: string;
  y?: string;
  y1?: string;
  y2?: string;
}


export interface XmlNode {
  nodeName: string;
  nodeValue?: string;
  attributes: AttributeItems;
  childNodes?: XmlNode[]
  parentNode?: XmlNode;
}

type SourceOrXml =
  | {
    /**
     * Source path for the .svg file
     * Expects a require('path') to the file or object with uri.
     * e.g. source={require('my-path')}
     * e.g. source={{ uri: 'my-path' }}
     */
      source: ImageSourcePropType;
      svgXmlData?: null;
    }
  | {
      source?: null;
      /**
       * Direct svg code to render. Similar to inline svg
       */
      svgXmlData: string;
    };

export type Props = SourceOrXml & {
  /**
   * The height of the rendered svg View
   */
  height?: number | string;
  /**
   * The width of the rendered svg View
   */
  width?: number | string;
  /**
   * Fill color for the svg object
   */
  fill?: string;
  /**
   * Invoked when load completes successfully (only when using source prop).
   */
  onLoad?: () => void;
  /**
   * Fill the entire svg element with same color
   */
  fillAll?: boolean;
  /**
   * Style for the @typedef View container
   */
  style?: StyleProp<ViewStyle>,
};

export interface State {
  rootSvgNode: XmlNode | null;
}
