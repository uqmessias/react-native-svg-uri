/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Fragment, useCallback, useRef, useEffect } from 'react';
import {
  Animated,
  Easing,
  SafeAreaView,
  FlatList,
  View,
  Text,
  StatusBar,
} from 'react-native';
import SVGRenderer from 'react-native-svg-renderer';

import SVGs from './assets/svgs';
import styles, { Constants } from './styles';

const shouldRotateAny = SVGs.some(({ animate }) => animate === 'rotate');
const AnimatedSVG = Animated.createAnimatedComponent(SVGRenderer);

const animationDuration = 2500;
const animationEnd = 360;
const animationStart = animationEnd / animationDuration;

const App = () => {
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  console.warn({ shouldRotateAny });
  const svgRotationAnimation = shouldRotateAny
    ? {
        transform: [
          {
            rotate: rotateAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [`${animationStart}deg`, `${animationEnd}deg`],
            }),
          },
        ],
      }
    : null;
  const renderItem = useCallback(
    ({ item: { title, xml, uri, animate }, index }) => (
      <View
        style={[
          styles.itemContainer,
          index < SVGs.length - 1 && styles.itemSeparator,
        ]}
        key={title}
      >
        <Text style={styles.itemTitle}>{title.toUpperCase()}</Text>
        <View style={styles.svgContainer}>
          {!!animate ? (
            <AnimatedSVG
              style={svgRotationAnimation}
              svgXmlData={xml}
              source={!!uri ? { uri } : undefined}
              height={Constants.cellSize}
              width={Constants.cellSize}
            />
          ) : (
            <SVGRenderer
              svgXmlData={xml}
              source={!!uri ? { uri } : undefined}
              height={Constants.cellSize}
              width={Constants.cellSize}
            />
          )}
        </View>
      </View>
    ),
    [SVGs],
  );
  const keyExtractor = useCallback(({ title }) => title, []);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(rotateAnimation, {
        duration: animationDuration,
        toValue: 1,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    anim.start();
    return anim.stop.bind(anim);
  });

  return (
    <Fragment>
      <StatusBar
        barStyle='light-content'
        backgroundColor={Constants.colors.dark}
      />
      <SafeAreaView>
        <FlatList
          keyExtractor={keyExtractor}
          ListHeaderComponent={
            <Text style={styles.header}>{Constants.headerTitle}</Text>
          }
          style={styles.listContainer}
          renderItem={renderItem}
          data={SVGs}
        />
      </SafeAreaView>
    </Fragment>
  );
};

export default App;
