'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _systemjs = require('systemjs');

var _systemjs2 = _interopRequireDefault(_systemjs);

var _createSpinner = require('./components/createSpinner');

var _createSpinner2 = _interopRequireDefault(_createSpinner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.default = function (React) {
  var _class, _temp;

  var Component = React.Component;
  var PropTypes = React.PropTypes;

  var IS_BROWSER = (typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object';

  var Spinner = (0, _createSpinner2.default)(React);

  return _temp = _class = function (_Component) {
    _inherits(Load, _Component);

    function Load(props) {
      _classCallCheck(this, Load);

      // TODO: Offer redux option in future

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Load).call(this, props));

      _this.state = { Modules: null };
      return _this;
    }

    _createClass(Load, [{
      key: 'render',
      value: function render() {
        var Modules = this.state.Modules;

        if (!Modules) return React.createElement(Spinner, null);

        var _props = this.props;
        var renderFactory = _props.renderFactory;
        var moduleProps = _props.moduleProps;


        var Module = renderFactory(Modules);
        return React.createElement(Module, moduleProps);
      }
    }, {
      key: 'componentWillMount',
      value: function componentWillMount() {
        var _this2 = this;

        var _props2 = this.props;
        var transpiler = _props2.transpiler;
        var meta = _props2.meta;
        var depCache = _props2.depCache;
        var universalImports = _props2.universalImports;
        var renderFactory = _props2.renderFactory;

        _systemjs2.default.config({ transpiler: transpiler, meta: meta, depCache: depCache });

        var browserImports = IS_BROWSER ? this.props.browserImports : {};
        var serverImports = IS_BROWSER ? {} : this.props.serverImports;

        var imports = _extends({}, universalImports, serverImports, browserImports);
        //const imports = Array.from(new Set([ ...importsUniversal, ...(IS_BROWSER ? [] : importsServer), ...(IS_BROWSER ? importsBrowser : []) ]))
        console.warn('IMPORTS', imports);

        _bluebird2.default.all(Object.keys(imports).map(function (x) {
          return _systemjs2.default.import(x);
        }).then(function (Module) {
          return _defineProperty({}, x, Module);
        })).then(function (modules) {
          return _this2.setState({ Modules: modules.reduce(function (Modules, Module) {
              return _extends({}, Modules, Module);
            }, {})
          });
        });
      }
    }]);

    return Load;
  }(Component), _class.propTypes = { transpiler: PropTypes.string.isRequired,
    depCache: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    universalImports: PropTypes.object.isRequired,
    serverImports: PropTypes.object.isRequired,
    browserImports: PropTypes.object.isRequired,
    renderFactory: PropTypes.func.isRequired,
    moduleProps: PropTypes.object
  }, _class.defaultProps = { transpiler: 'plugin-babel',
    depCache: {},
    meta: { format: 'esm',
      '*.js': { babelOptions: { presets: ['react', 'es2015', 'stage-0'],
          plugins: ['babel-plugin-transform-react-jsx']
        }
      }
    },
    universalImports: {},
    serverImports: {},
    browserImports: {},
    renderFactory: function renderFactory(Modules) {
      return function (props) {
        var names = Object.keys(Modules);
        if (names.length === 0) return React.createElement(
          'div',
          { style: { color: '#f00' } },
          'No module specified to load.'
        );
        if (names.length === 1) {
          var Module = Modules[names[0]];
          return React.createElement(Module, props);
        }
        return React.createElement(
          'div',
          null,
          Modules.map(function (Module, i) {
            return React.createElement(Module, _extends({}, props, { key: i }));
          })
        );
      };
    },
    moduleProps: {}
  }, _temp;
};