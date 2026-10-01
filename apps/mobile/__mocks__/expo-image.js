// expo-image 는 네이티브 뷰 — 테스트에선 RN Image 로 그린다(source·onError·onLoad 만 통과).
const React = require('react');
const {Image: RNImage} = require('react-native');

function Image({source, style, onError, onLoad, accessibilityLabel}) {
  return React.createElement(RNImage, {
    source,
    style,
    onError,
    onLoad,
    accessibilityLabel,
  });
}
Image.prefetch = () => Promise.resolve(true);
Image.clearMemoryCache = () => Promise.resolve(true);
Image.clearDiskCache = () => Promise.resolve(true);

module.exports = {Image};
