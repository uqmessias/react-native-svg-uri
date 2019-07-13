import {
  transformStyle,
  camelCase,
  removePixelsFromNodeValue,
  getEnabledAttributes,
} from '../utils';

describe('transformStyle', () => {
  it('transforms style attribute', () => {
    expect(
      transformStyle({
        nodeName: 'style',
        nodeValue: 'fill:rgb(0,0,255);stroke:rgb(0,0,0)',
      }),
    ).toEqual({
      fill: 'rgb(0,0,255)',
      stroke: 'rgb(0,0,0)',
    });
  });

  it('transforms style attribute with dash-case attribute', () => {
    expect(
      transformStyle({ nodeName: 'style', nodeValue: 'stop-color:#ffffff' }),
    ).toEqual({
      stopColor: '#ffffff',
    });
  });
});

describe('removePixelsFromNodeValue', () => {
  it('removes pixels from x, y, height and width attributes', () => {
    expect(
      removePixelsFromNodeValue({ nodeName: 'x', nodeValue: '2px' }),
    ).toEqual({ nodeName: 'x', nodeValue: '2' });
    expect(
      removePixelsFromNodeValue({ nodeName: 'y', nodeValue: '4px' }),
    ).toEqual({ nodeName: 'y', nodeValue: '4' });
    expect(
      removePixelsFromNodeValue({ nodeName: 'height', nodeValue: '65px' }),
    ).toEqual({ nodeName: 'height', nodeValue: '65' });
    expect(
      removePixelsFromNodeValue({ nodeName: 'width', nodeValue: '999px' }),
    ).toEqual({ nodeName: 'width', nodeValue: '999' });
  });
});

describe('camelCase', () => {
  it('transforms two word attribute with dash', () => {
    expect(camelCase('stop-color')).toEqual('stopColor');
  });

  it('does not do anything to string that is already camel cased', () => {
    expect(camelCase('stopColor')).toEqual('stopColor');
  });
});

describe('getEnabledAttributes', () => {
  it('return true when nodeName is found', () => {
    const enabledAttributes = ['x', 'y', 'strokeOpacity'];
    const hasEnabledAttribute = getEnabledAttributes(enabledAttributes);

    expect(hasEnabledAttribute({ nodeName: 'x' })).toEqual(true);
    expect(hasEnabledAttribute({ nodeName: 'stroke-opacity' })).toEqual(true);
  });

  it('return false when nodeName is not found', () => {
    const enabledAttributes = ['width', 'height'];
    const hasEnabledAttribute = getEnabledAttributes(enabledAttributes);

    expect(hasEnabledAttribute({ nodeName: 'depth' })).toEqual(false);
  });
});
