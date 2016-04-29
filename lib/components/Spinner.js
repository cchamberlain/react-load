'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * Copyright (c) 2011-2014 Felix Gnass
                                                                                                                                                                                                                                                                   * Licensed under the MIT license
                                                                                                                                                                                                                                                                   * http://spin.js.org/
                                                                                                                                                                                                                                                                   * ES6ified by Cole Chamberlain
                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                   * Example:
                                                                                                                                                                                                                                                                      var opts = {
                                                                                                                                                                                                                                                                        lines: 12             // The number of lines to draw
                                                                                                                                                                                                                                                                      , length: 7             // The length of each line
                                                                                                                                                                                                                                                                      , width: 5              // The line thickness
                                                                                                                                                                                                                                                                      , radius: 10            // The radius of the inner circle
                                                                                                                                                                                                                                                                      , scale: 1.0            // Scales overall size of the spinner
                                                                                                                                                                                                                                                                      , corners: 1            // Roundness (0..1)
                                                                                                                                                                                                                                                                      , color: '#000'         // #rgb or #rrggbb
                                                                                                                                                                                                                                                                      , opacity: 1/4          // Opacity of the lines
                                                                                                                                                                                                                                                                      , rotate: 0             // Rotation offset
                                                                                                                                                                                                                                                                      , direction: 1          // 1: clockwise, -1: counterclockwise
                                                                                                                                                                                                                                                                      , speed: 1              // Rounds per second
                                                                                                                                                                                                                                                                      , trail: 100            // Afterglow percentage
                                                                                                                                                                                                                                                                      , fps: 20               // Frames per second when using setTimeout()
                                                                                                                                                                                                                                                                      , zIndex: 2e9           // Use a high z-index by default
                                                                                                                                                                                                                                                                      , className: 'spinner'  // CSS class to assign to the element
                                                                                                                                                                                                                                                                      , top: '50%'            // center vertically
                                                                                                                                                                                                                                                                      , left: '50%'           // center horizontally
                                                                                                                                                                                                                                                                      , shadow: false         // Whether to render a shadow
                                                                                                                                                                                                                                                                      , hwaccel: false        // Whether to use hardware acceleration (might be buggy)
                                                                                                                                                                                                                                                                      , position: 'absolute'  // Element positioning
                                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                                                      var target = document.getElementById('foo')
                                                                                                                                                                                                                                                                      var spinner = new Spinner(opts).spin(target)
                                                                                                                                                                                                                                                                   */

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Returns the line color from the given string or array.
 */
var getColor = function getColor(color, idx) {
  return typeof color == 'string' ? color : color[idx % color.length];
};

/**
 * Internal method that adjusts the opacity of a single line.
 * Will be overwritten in VML fallback mode below.
 */
var opacity = function opacity(el, i, val) {
  if (i < el.childNodes.length) el.childNodes[i].style.opacity = val;
};

/** React component for segments */
var Segment = function Segment(props) {
  var segmentStyle = props.segmentStyle;
  var fillStyle = props.fillStyle;

  var commonStyle = { position: 'absolute' };
  return _react2.default.createElement(
    'div',
    { style: _extends({}, commonStyle, segmentStyle) },
    _react2.default.createElement('div', { style: _extends({}, commonStyle, fillStyle) })
  );
};

var createSheet = function createSheet() {
  if (typeof document === 'undefined') return;
  var styleElement = document.createElement('style');
  styleElement.type = 'text/css';
  document.head.appendChild(styleElement);
  return styleElement.sheet;
};

/** React component to show during loading */

var Spinner = function (_Component) {
  _inherits(Spinner, _Component);

  // Element positioning

  function Spinner(props) {
    _classCallCheck(this, Spinner);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Spinner).call(this, props));

    _this.addAnimation = function (i) {
      var _this$props = _this.props;
      var opacity = _this$props.opacity;
      var trail = _this$props.trail;
      var lines = _this$props.lines;

      var name = ['opacity', trail, ~ ~(opacity * 100), i, lines].join('-');
      var start = 0.01 + i / lines * 100;
      var z = Math.max(1 - (1 - opacity) / trail * (100 - start), opacity);
      //, prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
      //, pre = prefix && '-' + prefix + '-' || ''
      var pre = '';

      if (!_this.sheet) console.warn('Spinner => NO SHEET EXISTS');else if (!_this.animations[name]) {
        _this.sheet.insertRule('\n  @' + pre + 'keyframes ' + name + '{\n  0%{opacity:' + z + '}\n  ' + start + '%{opacity:' + opacity + '}\n  ' + (start + 0.01) + '%{opacity:1}\n  ' + (start + trail) % 100 + '%{opacity:' + opacity + '}\n  100%{opacity:' + z + '}\n  }', _this.sheet.cssRules.length);
        _this.animations[name] = 1;
      }

      return name;
    };

    _this.animations = {};
    return _this;
  }

  _createClass(Spinner, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.sheet = createSheet();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props;
      var position = _props.position;
      var zIndex = _props.zIndex;
      var left = _props.left;
      var top = _props.top;
      var lines = _props.lines;
      var direction = _props.direction;
      var scale = _props.scale;
      var length = _props.length;
      var width = _props.width;
      var speed = _props.speed;
      var radius = _props.radius;
      var corners = _props.corners;
      var rotate = _props.rotate;
      var opacity = _props.opacity;
      var trail = _props.trail;
      var color = _props.color;
      var shadow = _props.shadow;
      var hwaccel = _props.hwaccel;


      var start = (lines - 1) * (1 - direction) / 2;

      var renderSegments = function renderSegments() {
        return [].concat(_toConsumableArray(new Array(lines).keys())).map(function (i) {
          var segmentStyle = { top: 1 + ~(scale * width / 2)
            //, transform: hwaccel ? 'translate3d(0,0,0)' : ''
            , opacity: opacity,
            animation: _this2.addAnimation(start + i * direction) + ' ' + 1 / speed + 's linear infinite'
          };
          var fillStyle = { top: shadow ? 2 : 0,
            width: scale * (length + width),
            height: scale * width,
            background: shadow ? '#000' : getColor(color, i),
            boxShadow: shadow ? '0 0 4px #000' : '0 0 1px rgba(0,0,0,.1)',
            transformOrigin: 'left',
            transform: 'rotate(' + ~ ~(360 / lines * i + rotate) + 'deg) translate(' + scale * radius + 'px,0)',
            borderRadius: corners * scale * width >> 1
          };

          console.warn('segment', i, segmentStyle, fillStyle);
          return _react2.default.createElement(Segment, { key: i, segmentStyle: segmentStyle, fillStyle: fillStyle });
        });
      };
      var containerStyle = { width: 0, position: position, zIndex: zIndex, left: left, top: top, backgroundColor: '#f00' };
      return _react2.default.createElement(
        'div',
        { style: containerStyle, role: 'progressbar' },
        renderSegments()
      );
    }

    /**
     * Creates an opacity keyframe animation rule and returns its name.
     * Since most mobile Webkits have timing issues with animation-delay,
     * we create separate rules for each line/segment.
     */

  }]);

  return Spinner;
}(_react.Component);

Spinner.defaultProps = { lines: 14 // The number of lines to draw
  , length: 12 // The length of each line
  , width: 8 // The line thickness
  , radius: 20 // The radius of the inner circle
  , scale: 1.0 // Scales overall size of the spinner
  , corners: 1 // Roundness (0..1)
  , color: '#f2c73d' // #rgb or #rrggbb
  , opacity: 1 / 4 // Opacity of the lines
  , rotate: 0 // Rotation offset
  , direction: 1 // 1: clockwise, -1: counterclockwise
  , speed: 1 // Rounds per second
  , trail: 100 // Afterglow percentage
  , fps: 20 // Frames per second when using setTimeout()
  , zIndex: 2e9 // Use a high z-index by default
  , className: 'spinner' // CSS class to assign to the element
  , top: '50%' // center vertically
  , left: '50%' // center horizontally
  , shadow: false // Whether to render a shadow
  , hwaccel: false // Whether to use hardware acceleration (might be buggy)
  , position: 'absolute' };
exports.default = Spinner;