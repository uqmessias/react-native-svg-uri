/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Fragment, useCallback } from 'react';
import { SafeAreaView, FlatList, View, Text, StatusBar } from 'react-native';
import SVGRenderer from 'react-native-svg-renderer';

import SVGs from './assets/svgs';
import styles, { Constants } from './styles';

const App = () => {
  const renderItem = useCallback(
    ({ item: { title, xml, uri }, index }) => (
      <View
        style={[
          styles.itemContainer,
          index < SVGs.length - 1 && styles.itemSeparator,
        ]}
        key={title}
      >
        <Text style={styles.itemTitle}>{title.toUpperCase()}</Text>
        <View style={styles.svgContainer}>
          <SVGRenderer
            svgXmlData={xml}
            source={!!uri ? { uri } : undefined}
            height={Constants.cellSize}
            width={Constants.cellSize}
          />
        </View>
      </View>
    ),
    [SVGs],
  );
  const keyExtractor = useCallback(({ title }) => title, []);

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
