"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fileSystemLoader = _interopRequireDefault(require("css-modules-loader-core/lib/file-system-loader"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/**
 * Extension of css-modules-loader-core/lib/file-system-loader which
 * fixes paths on windows.
 *
 * We replace the method in question with the working version,
 * yet leave the rest of the class and module intact.
 *
 * We specify this class via config/postcss.js so we no longer need the forked version of the module.
 *
 * @link https://github.com/lipemat/css-modules-loader-core/commit/b710b1e6a3310cb379c0a215aad9f61ce2f127a8
 *
 * @since 2.2.0
 */
var FileSystemLoader = /*#__PURE__*/function (_CSSModulesLoader) {
  _inherits(FileSystemLoader, _CSSModulesLoader);

  var _super = _createSuper(FileSystemLoader);

  function FileSystemLoader() {
    _classCallCheck(this, FileSystemLoader);

    return _super.apply(this, arguments);
  }

  _createClass(FileSystemLoader, [{
    key: "fetch",
    value: function fetch(_newPath, relativeTo, _trace) {
      var _this = this;

      var newPath = _newPath.replace(/^["']|["']$/g, ''),
          trace = _trace || String.fromCharCode(this.importNr++);

      return new Promise(function (resolve, reject) {
        // If the Drive letter was doubled up on Windows by the postcss parser.
        if (relativeTo.substring(0, 3) === relativeTo.substring(3, 6)) {
          relativeTo = relativeTo.substring(3);
        }

        var relativeDir = _path["default"].dirname(relativeTo),
            rootRelativePath = _path["default"].resolve(relativeDir, newPath),
            fileRelativePath = _path["default"].resolve(relativeDir, newPath); // if the path is not relative or absolute, try to resolve it in node_modules


        if (newPath[0] !== '.' && newPath[0] !== '/' && (newPath[1] !== ':' || newPath[2] !== '\\')) {
          try {
            fileRelativePath = require.resolve(newPath);
          } catch (e) {}
        }

        var tokens = _this.tokensByFile[fileRelativePath];

        if (tokens) {
          return resolve(tokens);
        }

        _fs["default"].readFile(fileRelativePath, 'utf-8', function (err, source) {
          if (err) {
            reject(err);
          }

          _this.core.load(source, rootRelativePath, trace, _this.fetch.bind(_this)).then(function (_ref) {
            var injectableSource = _ref.injectableSource,
                exportTokens = _ref.exportTokens;
            _this.sources[fileRelativePath] = injectableSource;
            _this.traces[trace] = fileRelativePath;
            _this.tokensByFile[fileRelativePath] = exportTokens;
            resolve(exportTokens);
          }, reject);
        });
      });
    }
  }]);

  return FileSystemLoader;
}(_fileSystemLoader["default"]);

exports["default"] = FileSystemLoader;