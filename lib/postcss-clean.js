'use strict';
/**
 * Mimic the postcss-clean plugin.
 *
 * Override due to the plugin using version 4 of clean-css which
 * has issues with PostCSS 7 and results in inconstant CSS.
 *
 * This may potentially be removed in favor of using that plugin again if
 * they change the version of PostCSS to 7 and Clean CSS to 5.
 * We've already tested using those versions and it works, just need the
 * maintainer to bump the versions.
 * Decided to use this `lib` instead of maintaining another fork.
 *
 * @link https://www.npmjs.com/package/postcss-clean
 *
 */

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var postcss = require('postcss');

var CleanCss = require('clean-css');

var initializer = function initializer() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var cleancss = new CleanCss(opts);
  return function (css, res) {
    return new Promise(function (resolve, reject) {
      cleancss.minify(css.toString(), function (err, min) {
        if (err) {
          return reject(new Error(err.join('\n')));
        }

        var _iterator = _createForOfIteratorHelper(min.warnings),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var w = _step.value;
            res.warn(w);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        res.root = postcss.parse(min.styles);
        resolve();
      });
    });
  };
};

module.exports = postcss.plugin('clean', initializer);