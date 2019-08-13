/**
 * @format
 * @flow
 */

import { Dimensions, StyleSheet } from 'react-native';
import SVGRenderer from 'react-native-svg-renderer';

import SVGs from './assets/svgs';

const { width } = Dimensions.get('window');
const padding = 24;

const colors = {
  dark: '#202020',
  light: '#dfdfdf',
  medium: '#747474',
};

export const Constants = {
  colors,
  containerHeight: width,
  cellSize: width - padding * 2,
  headerTitle: 'Here are some of the possible SVG inputs',
};

const styles = StyleSheet.create({
  header: {
    padding,
    backgroundColor: colors.dark,
    color: colors.light,
    fontSize: 24,
  },

  itemContainer: {
    padding,
    flex: 1,
    height: Constants.containerHeight,
  },
  itemSeparator: {
    borderBottomColor: colors.light,
    borderBottomWidth: 1,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.medium,
  },
  svgContainer: {
    alignItems: 'center',
  },
});

export default styles;
