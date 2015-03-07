/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
	
	var Cycle = _interopRequire(__webpack_require__(5));
	
	var Model = _interopRequire(__webpack_require__(1));
	
	var View = _interopRequire(__webpack_require__(2));
	
	var Intent = _interopRequire(__webpack_require__(3));
	
	var InitialModel = _interopRequire(__webpack_require__(4));
	
	var User = Cycle.createDOMUser(document.body);
	
	User.inject(View);
	View.inject(Model);
	Model.inject(Intent, InitialModel);
	Intent.inject(User);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
	
	var Cycle = _interopRequire(__webpack_require__(5));
	
	var _ = _interopRequire(__webpack_require__(6));
	
	function calculatePurchaseOptions(model) {
	  var servingSize = model.servingSize;
	  var sortBy = model.sortBy;
	  var pizzas = _.sortBy(model.selectedMenu, "diameter").reverse();
	  var numServings = _(model.eaters).map("servings").reduce(function (sum, num) {
	    return sum + num;
	  }) || 0;
	  var totalSize = numServings * servingSize;
	
	  function updateTotal(option) {
	    option.total = _(option.pizzas).map("diameter").map(function (d) {
	      return d / 2;
	    }).map(function (r) {
	      return r * r;
	    }).map(function (r2) {
	      return r2 * Math.PI;
	    }).reduce(function (sum, area) {
	      return area + sum;
	    });
	  }
	
	  function addPizza(option, options, index) {
	    index = index || 0;
	    if (option.total > totalSize) {
	      options.push(option);
	    } else {
	      for (var i = index; i < pizzas.length; ++i) {
	        var newOp = { pizzas: _.clone(option.pizzas) };
	        newOp.pizzas.push(pizzas[i]);
	        updateTotal(newOp);
	        addPizza(newOp, options, i);
	      }
	    }
	    return options;
	  }
	
	  model.numServings = numServings;
	  model.purchaseOptions = _(addPizza({ pizzas: [], total: 0 }, [])).tap(function (options) {
	    return console.log("Found " + options.length + " options");
	  }).forEach(function (option) {
	    option.cost = _(option.pizzas).map("cost").reduce(function (sum, cost) {
	      return sum + cost;
	    });
	    option.ratio = option.cost / option.total;
	  }).sortBy("ratio").forEach(function (option, index) {
	    return option.order = index + 1;
	  }).sortBy("total").forEach(function (option, index) {
	    return option.order += index;
	  }).sortBy(sortBy).take(10).sortBy("total").tap(function (options) {
	    return options.length && (options[options.length - 1].mostPizza = true);
	  }).sortBy("ratio").tap(function (options) {
	    return options.length && (options[0].bestDeal = true);
	  }).sortBy(sortBy).value();
	}
	
	module.exports = Model = Cycle.createModel(function (Intent, Initial) {
	
	  var sortByMod$ = Intent.get("sortBy$").map(function (sortBy) {
	    return function (model) {
	      model.sortBy = sortBy;
	      return model;
	    };
	  });
	
	  var menuMod$ = Intent.get("selectMenu$").map(function (name) {
	    return function (model) {
	      model.selectedMenu = model.menus[name];
	      return model;
	    };
	  });
	
	  var eaterMod$ = Intent.get("eaterUpdate$").map(function (data) {
	    return function (model) {
	      model.eaters[data.id].servings = Math.max(data.servings, 0);
	      return model;
	    };
	  });
	
	  var eaterAdd$ = Intent.get("eaterAdd$").map(function (data) {
	    return function (model) {
	      model.eaters.push({ name: data.name, servings: data.servings });
	      return model;
	    };
	  });
	
	  var modifications$ = Rx.Observable.merge(sortByMod$, menuMod$, eaterMod$, eaterAdd$);
	
	  return {
	    model$: modifications$.merge(Initial.get("model$")).scan(function (model, modFn) {
	      return modFn(model);
	    }).tap(calculatePurchaseOptions)
	    //.combineLatest(route$, determineFilter)
	    .share()
	  };
	});

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
	
	var Cycle = _interopRequire(__webpack_require__(5));
	
	var _ = _interopRequire(__webpack_require__(6));
	
	function renderOptions(model) {
	  return [Cycle.h("h2", "Let's get one of these:"), Cycle.h("table", [Cycle.h("thead", [Cycle.h("tr", [Cycle.h("th", "Pizzas"), Cycle.h("th", {
	    attributes: { "data-order": "total" },
	    className: model.sortBy === "total" ? "active" : ""
	  }, "Servings"), Cycle.h("th", {
	    attributes: { "data-order": "cost" },
	    className: model.sortBy === "cost" ? "active" : ""
	  }, "Cost"), Cycle.h("th", {
	    attributes: { "data-order": "order" },
	    className: model.sortBy === "order" ? "active" : ""
	  }, "PizzaRank™")])]), Cycle.h("tbody", model.purchaseOptions.map(renderOption.bind(this, model.servingSize)))])];
	}
	
	function renderOption(servingSize, option) {
	  return Cycle.h("tr", [Cycle.h("td", _(option.pizzas).groupBy("name").map(function (arr, name) {
	    return "" + arr.length + " " + name;
	  }).value().join(", ")), Cycle.h("td", [option.mostPizza ? Cycle.h("span.most-pizza", { title: "Most Pizza!" }) : null, "" + Math.round(option.total / servingSize * 100) / 100]), Cycle.h("td", "" + Math.round(option.cost * 100) / 100), Cycle.h("td", [option.bestDeal ? Cycle.h("span.best-deal", { title: "Best Deal!" }) : null, "" + option.order])]);
	}
	
	function renderMenuSelection(model) {
	  return [Cycle.h("h2", "Where are we ordering " + model.numServings + " slices from?"), Cycle.h("select.menu", _.map(model.menus, function (menu, name) {
	    return Cycle.h("option", name);
	  }))];
	}
	
	function renderEaters(model) {
	  return [Cycle.h("h2", "Who's eating?"), Cycle.h("ul", [model.eaters.map(renderEater), Cycle.h("li", Cycle.h("input.new-eater"))])];
	}
	
	function renderEater(eater) {
	  return Cycle.h("li", [Cycle.h("span", "" + eater.name + ": " + eater.servings + " slice" + (eater.servings === 1 ? "" : "s"))]);
	}
	
	module.exports = View = Cycle.createView(function (Model) {
	  return {
	    vtree$: Model.get("model$").map(function (model) {
	      return Cycle.h("div", [Cycle.h("h1", "TODO: Minimum Viable Pizza"), renderEaters(model), renderMenuSelection(model), renderOptions(model)]);
	    })
	  };
	});

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
	
	var Cycle = _interopRequire(__webpack_require__(5));
	
	module.exports = Intent = Cycle.createIntent(function (User) {
	    return {
	
	        sortBy$: User.event$("th", "click").map(function (ev) {
	            return ev.target.getAttribute("data-order");
	        }).filter(function (order) {
	            return !!order;
	        }),
	
	        selectMenu$: User.event$(".menu", "change").map(function (ev) {
	            return ev.target.options[ev.target.selectedIndex].value;
	        }),
	
	        eaterAdd$: User.event$(".new-eater", "keypress").filter(function (ev) {
	            return ev.keyCode === 13;
	        }).map(function (ev) {
	            return ev.target.value.match(/(.*):\s*(\d+)/);
	        }).filter(function (match) {
	            return match;
	        }).map(function (match) {
	            return { name: match[1], servings: parseInt(match[2], 10) };
	        }),
	
	        eaterUpdate$: User.event$(".edit-servings", "keypress").filter(function (ev) {
	            return ev.keyCode === 13;
	        }).map(function (ev) {
	            return { id: ev.target.getAttribute("data-id"), servings: parseInt(ev.target.value, 10) };
	        }).filter(function (update) {
	            return !isNan(update.servings);
	        })
	
	    };
	});

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };
	
	var Cycle = _interopRequire(__webpack_require__(5));
	
	/* Monte Cellos scrape function - doesn't grab cost
	
	 $('#pizza h4')
	 .map(function(ind, e) { return e.innerText })
	 .map(function(ind, txt) {
	 var matches = txt.match(/(.+) - (\d+)"/);
	 return matches && {name: matches[1], diameter: parseInt(matches[2], 10) };
	 })
	 .filter(function(ind, match) { return !!match; });
	
	 */
	
	var menus = {
	  "Monte Cellos": [{ name: "Large", diameter: 16, cuts: 10, cost: 12.95 }, { name: "Medium", diameter: 14, cost: 9.95 }, { name: "Small", diameter: 12, cost: 8.95 }],
	  "Pizza Parma": [{ name: "XLarge", diameter: 18, cost: 13.99 }, { name: "Large", diameter: 16, cost: 12.99 }, { name: "Medium", diameter: 14, cost: 10.99 }, { name: "Small", diameter: 10, cost: 8.99 }]
	};
	
	function getDefaultServing() {
	  return Math.floor(Math.pow(menus["Monte Cellos"][0].diameter / 2, 2) * Math.PI * 100 / menus["Monte Cellos"][0].cuts) / 100;
	}
	
	module.exports = modelSource = Cycle.createDataFlowSource({
	  model$: Rx.Observable.just({
	    menus: menus,
	    eaters: [{ name: "Doug", servings: 3 }, { name: "Woolner", servings: 4 }, { name: "CMG", servings: 4 }, { name: "Gabo", servings: 3 }],
	    servingSize: getDefaultServing(),
	    selectedMenu: menus["Monte Cellos"],
	    sortBy: "order"
	  })
	});

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var VirtualDOM = __webpack_require__(15);
	var Rx = __webpack_require__(16);
	var DataFlowNode = __webpack_require__(7);
	var DataFlowSource = __webpack_require__(8);
	var DataFlowSink = __webpack_require__(9);
	var DOMUser = __webpack_require__(10);
	var PropertyHook = __webpack_require__(11);
	
	var Cycle = {
	  /**
	   * Creates a DataFlowNode based on the given `definitionFn`. The `definitionFn`
	   * function will be executed immediately on create, and the resulting DataFlowNode
	   * outputs will be synchronously available. The inputs are asynchronously injected
	   * later with the `inject()` function on the DataFlowNode.
	   *
	   * @param {Function} definitionFn a function expecting DataFlowNodes as parameters.
	   * This function should return an object containing RxJS Observables as properties.
	   * The input parameters can also be plain objects with Observables as properties.
	   * @return {DataFlowNode} a DataFlowNode, containing a `inject(inputs...)` function.
	   */
	  createDataFlowNode: function createDataFlowNode(definitionFn) {
	    return new DataFlowNode(definitionFn);
	  },
	
	  /**
	   * Creates a DataFlowSource. It receives an object as argument, and outputs that same
	   * object, annotated as a DataFlowSource. For all practical purposes, a DataFlowSource
	   * is just a regular object with RxJS Observables, but for consistency with other
	   * components in the framework such as DataFlowNode, the returned object is an instance
	   * of DataFlowSource.
	   *
	   * @param {Object} outputObject an object containing RxJS Observables.
	   * @return {DataFlowSource} a DataFlowSource equivalent to the given outputObject
	   */
	  createDataFlowSource: function createDataFlowSource(outputObject) {
	    return new DataFlowSource(outputObject);
	  },
	
	  /**
	   * Creates a DataFlowSink, given a definition function that receives injected inputs.
	   *
	   * @param {Function} definitionFn a function expecting some DataFlowNode(s) as
	   * arguments. The function should subscribe to Observables of the input DataFlowNodes
	   * and should return a `Rx.Disposable` subscription.
	   * @return {DataFlowSink} a DataFlowSink, containing a `inject(inputs...)` function.
	   */
	  createDataFlowSink: function createDataFlowSink(definitionFn) {
	    return new DataFlowSink(definitionFn);
	  },
	
	  /**
	   * Returns a DataFlowNode representing a Model, having some Intent as input.
	   *
	   * Is a specialized case of `createDataFlowNode()`, with the same API.
	   *
	   * @param {Function} definitionFn a function expecting an Intent DataFlowNode as
	   * parameter. Should return an object containing RxJS Observables as properties.
	   * @return {DataFlowNode} a DataFlowNode representing a Model, containing a
	   * `inject(intent)` function.
	   * @function createModel
	   */
	  createModel: __webpack_require__(12),
	
	  /**
	   * Returns a DataFlowNode representing a View, having some Model as input.
	   *
	   * Is a specialized case of `createDataFlowNode()`.
	   *
	   * @param {Function} definitionFn a function expecting a Model object as parameter.
	   * Should return an object containing RxJS Observables as properties. The object **must
	   * contain** property `vtree$`, an Observable emitting instances of VTree
	   * (Virtual DOM elements).
	   * @return {DataFlowNode} a DataFlowNode representing a View, containing a
	   * `inject(model)` function.
	   * @function createView
	   */
	  createView: __webpack_require__(13),
	
	  /**
	   * Returns a DataFlowNode representing an Intent, having some View as input.
	   *
	   * Is a specialized case of `createDataFlowNode()`.
	   *
	   * @param {Function} definitionFn a function expecting a View object as parameter.
	   * Should return an object containing RxJS Observables as properties.
	   * @return {DataFlowNode} a DataFlowNode representing an Intent, containing a
	   * `inject(view)` function.
	   * @function createIntent
	   */
	  createIntent: __webpack_require__(14),
	
	  /**
	   * Returns a DOMUser (a DataFlowNode) bound to a DOM container element. Contains an
	   * `inject` function that should be called with a View as argument. Events coming from
	   * this user can be listened using `domUser.event$(selector, eventName)`. Example:
	   * `domUser.event$('.mybutton', 'click').subscribe( ... )`
	   *
	   * @param {(String|HTMLElement)} container the DOM selector for the element (or the
	   * element itself) to contain the rendering of the VTrees.
	   * @return {DOMUser} a DOMUser object containing functions `inject(view)` and
	   * `event$(selector, eventName)`.
	   * @function createDOMUser
	   */
	  createDOMUser: function createDOMUser(container) {
	    return new DOMUser(container);
	  },
	
	  /**
	   * Informs Cycle to recognize the given `tagName` as a custom element implemented
	   * as `dataFlowNode` whenever `tagName` is used in VTrees in a View rendered to a
	   * DOMUser.
	   * The given `dataFlowNode` must export a `vtree$` Observable. If the `dataFlowNode`
	   * expects Observable `foo$` as input, then the custom element's attribute named `foo`
	   * will be injected automatically into `foo$`.
	   *
	   * @param {String} tagName a name for identifying the custom element.
	   * @param {Function} definitionFn the implementation for the custom element. This
	   * function takes two arguments: `User`, and `Properties`. Use `User` to inject into an
	   * Intent and to be injected a View. `Properties` is a DataFlowNode containing
	   * observables matching the custom element properties.
	   * @function registerCustomElement
	   */
	  registerCustomElement: function registerCustomElement(tagName, definitionFn) {
	    DOMUser.registerCustomElement(tagName, definitionFn);
	  },
	
	  /**
	   * Returns a hook for manipulating an element from the real DOM. This is a helper for
	   * creating VTrees in Views. Useful for calling `focus()` on the DOM element, or doing
	   * similar mutations.
	   *
	   * See https://github.com/Raynos/mercury/blob/master/docs/faq.md for more details.
	   *
	   * @param {Function} fn a function with two arguments: `element`, `property`.
	   * @return {PropertyHook} a hook
	   */
	  vdomPropHook: function vdomPropHook(fn) {
	    return new PropertyHook(fn);
	  },
	
	  /**
	   * A shortcut to the root object of [RxJS](https://github.com/Reactive-Extensions/RxJS).
	   * @name Rx
	   */
	  Rx: Rx,
	
	  /**
	   * A shortcut to [virtual-hyperscript](
	   * https://github.com/Matt-Esch/virtual-dom/tree/master/virtual-hyperscript).
	   * This is a helper for creating VTrees in Views.
	   * @name h
	   */
	  h: VirtualDOM.h
	};
	
	module.exports = Cycle;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {"";;(function(){var undefined;var VERSION="3.3.1";var BIND_FLAG=1, BIND_KEY_FLAG=2, CURRY_BOUND_FLAG=4, CURRY_FLAG=8, CURRY_RIGHT_FLAG=16, PARTIAL_FLAG=32, PARTIAL_RIGHT_FLAG=64, REARG_FLAG=128, ARY_FLAG=256;var DEFAULT_TRUNC_LENGTH=30, DEFAULT_TRUNC_OMISSION="...";var HOT_COUNT=150, HOT_SPAN=16;var LAZY_FILTER_FLAG=0, LAZY_MAP_FLAG=1, LAZY_WHILE_FLAG=2;var FUNC_ERROR_TEXT="Expected a function";var PLACEHOLDER="__lodash_placeholder__";var argsTag="[object Arguments]", arrayTag="[object Array]", boolTag="[object Boolean]", dateTag="[object Date]", errorTag="[object Error]", funcTag="[object Function]", mapTag="[object Map]", numberTag="[object Number]", objectTag="[object Object]", regexpTag="[object RegExp]", setTag="[object Set]", stringTag="[object String]", weakMapTag="[object WeakMap]";var arrayBufferTag="[object ArrayBuffer]", float32Tag="[object Float32Array]", float64Tag="[object Float64Array]", int8Tag="[object Int8Array]", int16Tag="[object Int16Array]", int32Tag="[object Int32Array]", uint8Tag="[object Uint8Array]", uint8ClampedTag="[object Uint8ClampedArray]", uint16Tag="[object Uint16Array]", uint32Tag="[object Uint32Array]";var reEmptyStringLeading=/\b__p \+= '';/g, reEmptyStringMiddle=/\b(__p \+=) '' \+/g, reEmptyStringTrailing=/(__e\(.*?\)|\b__t\)) \+\n'';/g;var reEscapedHtml=/&(?:amp|lt|gt|quot|#39|#96);/g, reUnescapedHtml=/[&<>"'`]/g, reHasEscapedHtml=RegExp(reEscapedHtml.source), reHasUnescapedHtml=RegExp(reUnescapedHtml.source);var reEscape=/<%-([\s\S]+?)%>/g, reEvaluate=/<%([\s\S]+?)%>/g, reInterpolate=/<%=([\s\S]+?)%>/g;var reEsTemplate=/\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;var reFlags=/\w*$/;var reFuncName=/^\s*function[ \n\r\t]+\w/;var reHexPrefix=/^0[xX]/;var reHostCtor=/^\[object .+?Constructor\]$/;var reLatin1=/[\xc0-\xd6\xd8-\xde\xdf-\xf6\xf8-\xff]/g;var reNoMatch=/($^)/;var reRegExpChars=/[.*+?^${}()|[\]\/\\]/g, reHasRegExpChars=RegExp(reRegExpChars.source);var reThis=/\bthis\b/;var reUnescapedString=/['\n\r\u2028\u2029\\]/g;var reWords=(function(){var upper="[A-Z\\xc0-\\xd6\\xd8-\\xde]", lower="[a-z\\xdf-\\xf6\\xf8-\\xff]+";return RegExp(upper + "{2,}(?=" + upper + lower + ")|" + upper + "?" + lower + "|" + upper + "+|[0-9]+", "g");})();var whitespace=" \t\u000b\f ﻿" + "\n\r\u2028\u2029" + " ᠎             　";var contextProps=["Array", "ArrayBuffer", "Date", "Error", "Float32Array", "Float64Array", "Function", "Int8Array", "Int16Array", "Int32Array", "Math", "Number", "Object", "RegExp", "Set", "String", "_", "clearTimeout", "document", "isFinite", "parseInt", "setTimeout", "TypeError", "Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array", "WeakMap", "window", "WinRTError"];var templateCounter=-1;var typedArrayTags={};typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;var cloneableTags={};cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[stringTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[mapTag] = cloneableTags[setTag] = cloneableTags[weakMapTag] = false;var debounceOptions={leading:false, maxWait:0, trailing:false};var deburredLetters={À:"A", Á:"A", Â:"A", Ã:"A", Ä:"A", Å:"A", à:"a", á:"a", â:"a", ã:"a", ä:"a", å:"a", Ç:"C", ç:"c", Ð:"D", ð:"d", È:"E", É:"E", Ê:"E", Ë:"E", è:"e", é:"e", ê:"e", ë:"e", Ì:"I", Í:"I", Î:"I", Ï:"I", ì:"i", í:"i", î:"i", ï:"i", Ñ:"N", ñ:"n", Ò:"O", Ó:"O", Ô:"O", Õ:"O", Ö:"O", Ø:"O", ò:"o", ó:"o", ô:"o", õ:"o", ö:"o", ø:"o", Ù:"U", Ú:"U", Û:"U", Ü:"U", ù:"u", ú:"u", û:"u", ü:"u", Ý:"Y", ý:"y", ÿ:"y", Æ:"Ae", æ:"ae", Þ:"Th", þ:"th", ß:"ss"};var htmlEscapes={"&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#39;", "`":"&#96;"};var htmlUnescapes={"&amp;":"&", "&lt;":"<", "&gt;":">", "&quot;":"\"", "&#39;":"'", "&#96;":"`"};var objectTypes={"function":true, object:true};var stringEscapes={"\\":"\\", "'":"'", "\n":"n", "\r":"r", "\u2028":"u2028", "\u2029":"u2029"};var root=objectTypes[typeof window] && window !== (this && this.window)?window:this;var freeExports=objectTypes[typeof exports] && exports && !exports.nodeType && exports;var freeModule=objectTypes[typeof module] && module && !module.nodeType && module;var freeGlobal=freeExports && freeModule && typeof global == "object" && global;if(freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)){root = freeGlobal;}var moduleExports=freeModule && freeModule.exports === freeExports && freeExports;function baseCompareAscending(value, other){if(value !== other){var valIsReflexive=value === value, othIsReflexive=other === other;if(value > other || !valIsReflexive || typeof value == "undefined" && othIsReflexive){return 1;}if(value < other || !othIsReflexive || typeof other == "undefined" && valIsReflexive){return -1;}}return 0;}function baseIndexOf(array, value, fromIndex){if(value !== value){return indexOfNaN(array, fromIndex);}var index=(fromIndex || 0) - 1, length=array.length;while(++index < length) {if(array[index] === value){return index;}}return -1;}function baseIsFunction(value){return typeof value == "function" || false;}function baseSortBy(array, comparer){var length=array.length;array.sort(comparer);while(length--) {array[length] = array[length].value;}return array;}function baseToString(value){if(typeof value == "string"){return value;}return value == null?"":value + "";}function charAtCallback(string){return string.charCodeAt(0);}function charsLeftIndex(string, chars){var index=-1, length=string.length;while(++index < length && chars.indexOf(string.charAt(index)) > -1) {}return index;}function charsRightIndex(string, chars){var index=string.length;while(index-- && chars.indexOf(string.charAt(index)) > -1) {}return index;}function compareAscending(object, other){return baseCompareAscending(object.criteria, other.criteria) || object.index - other.index;}function compareMultipleAscending(object, other){var index=-1, objCriteria=object.criteria, othCriteria=other.criteria, length=objCriteria.length;while(++index < length) {var result=baseCompareAscending(objCriteria[index], othCriteria[index]);if(result){return result;}}return object.index - other.index;}function deburrLetter(letter){return deburredLetters[letter];}function escapeHtmlChar(chr){return htmlEscapes[chr];}function escapeStringChar(chr){return "\\" + stringEscapes[chr];}function indexOfNaN(array, fromIndex, fromRight){var length=array.length, index=fromRight?fromIndex || length:(fromIndex || 0) - 1;while(fromRight?index--:++index < length) {var other=array[index];if(other !== other){return index;}}return -1;}function isObjectLike(value){return value && typeof value == "object" || false;}function isSpace(charCode){return charCode <= 160 && (charCode >= 9 && charCode <= 13) || charCode == 32 || charCode == 160 || charCode == 5760 || charCode == 6158 || charCode >= 8192 && (charCode <= 8202 || charCode == 8232 || charCode == 8233 || charCode == 8239 || charCode == 8287 || charCode == 12288 || charCode == 65279);}function replaceHolders(array, placeholder){var index=-1, length=array.length, resIndex=-1, result=[];while(++index < length) {if(array[index] === placeholder){array[index] = PLACEHOLDER;result[++resIndex] = index;}}return result;}function sortedUniq(array, iteratee){var seen, index=-1, length=array.length, resIndex=-1, result=[];while(++index < length) {var value=array[index], computed=iteratee?iteratee(value, index, array):value;if(!index || seen !== computed){seen = computed;result[++resIndex] = value;}}return result;}function trimmedLeftIndex(string){var index=-1, length=string.length;while(++index < length && isSpace(string.charCodeAt(index))) {}return index;}function trimmedRightIndex(string){var index=string.length;while(index-- && isSpace(string.charCodeAt(index))) {}return index;}function unescapeHtmlChar(chr){return htmlUnescapes[chr];}function runInContext(context){context = context?_.defaults(root.Object(), context, _.pick(root, contextProps)):root;var Array=context.Array, Date=context.Date, Error=context.Error, Function=context.Function, Math=context.Math, Number=context.Number, Object=context.Object, RegExp=context.RegExp, String=context.String, TypeError=context.TypeError;var arrayProto=Array.prototype, objectProto=Object.prototype;var document=(document = context.window) && document.document;var fnToString=Function.prototype.toString;var getLength=baseProperty("length");var hasOwnProperty=objectProto.hasOwnProperty;var idCounter=0;var objToString=objectProto.toString;var oldDash=context._;var reNative=RegExp("^" + escapeRegExp(objToString).replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");var ArrayBuffer=isNative(ArrayBuffer = context.ArrayBuffer) && ArrayBuffer, bufferSlice=isNative(bufferSlice = ArrayBuffer && new ArrayBuffer(0).slice) && bufferSlice, ceil=Math.ceil, clearTimeout=context.clearTimeout, floor=Math.floor, getPrototypeOf=isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf, push=arrayProto.push, propertyIsEnumerable=objectProto.propertyIsEnumerable, Set=isNative(Set = context.Set) && Set, setTimeout=context.setTimeout, splice=arrayProto.splice, Uint8Array=isNative(Uint8Array = context.Uint8Array) && Uint8Array, WeakMap=isNative(WeakMap = context.WeakMap) && WeakMap;var Float64Array=(function(){try{var func=isNative(func = context.Float64Array) && func, result=new func(new ArrayBuffer(10), 0, 1) && func;}catch(e) {}return result;})();var nativeIsArray=isNative(nativeIsArray = Array.isArray) && nativeIsArray, nativeCreate=isNative(nativeCreate = Object.create) && nativeCreate, nativeIsFinite=context.isFinite, nativeKeys=isNative(nativeKeys = Object.keys) && nativeKeys, nativeMax=Math.max, nativeMin=Math.min, nativeNow=isNative(nativeNow = Date.now) && nativeNow, nativeNumIsFinite=isNative(nativeNumIsFinite = Number.isFinite) && nativeNumIsFinite, nativeParseInt=context.parseInt, nativeRandom=Math.random;var NEGATIVE_INFINITY=Number.NEGATIVE_INFINITY, POSITIVE_INFINITY=Number.POSITIVE_INFINITY;var MAX_ARRAY_LENGTH=Math.pow(2, 32) - 1, MAX_ARRAY_INDEX=MAX_ARRAY_LENGTH - 1, HALF_MAX_ARRAY_LENGTH=MAX_ARRAY_LENGTH >>> 1;var FLOAT64_BYTES_PER_ELEMENT=Float64Array?Float64Array.BYTES_PER_ELEMENT:0;var MAX_SAFE_INTEGER=Math.pow(2, 53) - 1;var metaMap=WeakMap && new WeakMap();function lodash(value){if(isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)){if(value instanceof LodashWrapper){return value;}if(hasOwnProperty.call(value, "__chain__") && hasOwnProperty.call(value, "__wrapped__")){return wrapperClone(value);}}return new LodashWrapper(value);}function baseLodash(){}function LodashWrapper(value, chainAll, actions){this.__wrapped__ = value;this.__actions__ = actions || [];this.__chain__ = !!chainAll;}var support=lodash.support = {};(function(x){support.funcDecomp = !isNative(context.WinRTError) && reThis.test(runInContext);support.funcNames = typeof Function.name == "string";try{support.dom = document.createDocumentFragment().nodeType === 11;}catch(e) {support.dom = false;}try{support.nonEnumArgs = !propertyIsEnumerable.call(arguments, 1);}catch(e) {support.nonEnumArgs = true;}})(0, 0);lodash.templateSettings = {escape:reEscape, evaluate:reEvaluate, interpolate:reInterpolate, variable:"", imports:{_:lodash}};function LazyWrapper(value){this.__wrapped__ = value;this.__actions__ = null;this.__dir__ = 1;this.__dropCount__ = 0;this.__filtered__ = false;this.__iteratees__ = null;this.__takeCount__ = POSITIVE_INFINITY;this.__views__ = null;}function lazyClone(){var actions=this.__actions__, iteratees=this.__iteratees__, views=this.__views__, result=new LazyWrapper(this.__wrapped__);result.__actions__ = actions?arrayCopy(actions):null;result.__dir__ = this.__dir__;result.__dropCount__ = this.__dropCount__;result.__filtered__ = this.__filtered__;result.__iteratees__ = iteratees?arrayCopy(iteratees):null;result.__takeCount__ = this.__takeCount__;result.__views__ = views?arrayCopy(views):null;return result;}function lazyReverse(){if(this.__filtered__){var result=new LazyWrapper(this);result.__dir__ = -1;result.__filtered__ = true;}else {result = this.clone();result.__dir__ *= -1;}return result;}function lazyValue(){var array=this.__wrapped__.value();if(!isArray(array)){return baseWrapperValue(array, this.__actions__);}var dir=this.__dir__, isRight=dir < 0, view=getView(0, array.length, this.__views__), start=view.start, end=view.end, length=end - start, dropCount=this.__dropCount__, takeCount=nativeMin(length, this.__takeCount__), index=isRight?end:start - 1, iteratees=this.__iteratees__, iterLength=iteratees?iteratees.length:0, resIndex=0, result=[];outer: while(length-- && resIndex < takeCount) {index += dir;var iterIndex=-1, value=array[index];while(++iterIndex < iterLength) {var data=iteratees[iterIndex], iteratee=data.iteratee, computed=iteratee(value, index, array), type=data.type;if(type == LAZY_MAP_FLAG){value = computed;}else if(!computed){if(type == LAZY_FILTER_FLAG){continue outer;}else {break outer;}}}if(dropCount){dropCount--;}else {result[resIndex++] = value;}}return result;}function MapCache(){this.__data__ = {};}function mapDelete(key){return this.has(key) && delete this.__data__[key];}function mapGet(key){return key == "__proto__"?undefined:this.__data__[key];}function mapHas(key){return key != "__proto__" && hasOwnProperty.call(this.__data__, key);}function mapSet(key, value){if(key != "__proto__"){this.__data__[key] = value;}return this;}function SetCache(values){var length=values?values.length:0;this.data = {hash:nativeCreate(null), set:new Set()};while(length--) {this.push(values[length]);}}function cacheIndexOf(cache, value){var data=cache.data, result=typeof value == "string" || isObject(value)?data.set.has(value):data.hash[value];return result?0:-1;}function cachePush(value){var data=this.data;if(typeof value == "string" || isObject(value)){data.set.add(value);}else {data.hash[value] = true;}}function arrayCopy(source, array){var index=-1, length=source.length;array || (array = Array(length));while(++index < length) {array[index] = source[index];}return array;}function arrayEach(array, iteratee){var index=-1, length=array.length;while(++index < length) {if(iteratee(array[index], index, array) === false){break;}}return array;}function arrayEachRight(array, iteratee){var length=array.length;while(length--) {if(iteratee(array[length], length, array) === false){break;}}return array;}function arrayEvery(array, predicate){var index=-1, length=array.length;while(++index < length) {if(!predicate(array[index], index, array)){return false;}}return true;}function arrayFilter(array, predicate){var index=-1, length=array.length, resIndex=-1, result=[];while(++index < length) {var value=array[index];if(predicate(value, index, array)){result[++resIndex] = value;}}return result;}function arrayMap(array, iteratee){var index=-1, length=array.length, result=Array(length);while(++index < length) {result[index] = iteratee(array[index], index, array);}return result;}function arrayMax(array){var index=-1, length=array.length, result=NEGATIVE_INFINITY;while(++index < length) {var value=array[index];if(value > result){result = value;}}return result;}function arrayMin(array){var index=-1, length=array.length, result=POSITIVE_INFINITY;while(++index < length) {var value=array[index];if(value < result){result = value;}}return result;}function arrayReduce(array, iteratee, accumulator, initFromArray){var index=-1, length=array.length;if(initFromArray && length){accumulator = array[++index];}while(++index < length) {accumulator = iteratee(accumulator, array[index], index, array);}return accumulator;}function arrayReduceRight(array, iteratee, accumulator, initFromArray){var length=array.length;if(initFromArray && length){accumulator = array[--length];}while(length--) {accumulator = iteratee(accumulator, array[length], length, array);}return accumulator;}function arraySome(array, predicate){var index=-1, length=array.length;while(++index < length) {if(predicate(array[index], index, array)){return true;}}return false;}function assignDefaults(objectValue, sourceValue){return typeof objectValue == "undefined"?sourceValue:objectValue;}function assignOwnDefaults(objectValue, sourceValue, key, object){return typeof objectValue == "undefined" || !hasOwnProperty.call(object, key)?sourceValue:objectValue;}function baseAssign(object, source, customizer){var props=keys(source);if(!customizer){return baseCopy(source, object, props);}var index=-1, length=props.length;while(++index < length) {var key=props[index], value=object[key], result=customizer(value, source[key], key, object, source);if((result === result?result !== value:value === value) || typeof value == "undefined" && !(key in object)){object[key] = result;}}return object;}function baseAt(collection, props){var index=-1, length=collection.length, isArr=isLength(length), propsLength=props.length, result=Array(propsLength);while(++index < propsLength) {var key=props[index];if(isArr){key = parseFloat(key);result[index] = isIndex(key, length)?collection[key]:undefined;}else {result[index] = collection[key];}}return result;}function baseCopy(source, object, props){if(!props){props = object;object = {};}var index=-1, length=props.length;while(++index < length) {var key=props[index];object[key] = source[key];}return object;}function baseBindAll(object, methodNames){var index=-1, length=methodNames.length;while(++index < length) {var key=methodNames[index];object[key] = createWrapper(object[key], BIND_FLAG, object);}return object;}function baseCallback(func, thisArg, argCount){var type=typeof func;if(type == "function"){return typeof thisArg != "undefined" && isBindable(func)?bindCallback(func, thisArg, argCount):func;}if(func == null){return identity;}if(type == "object"){return baseMatches(func);}return typeof thisArg == "undefined"?baseProperty(func + ""):baseMatchesProperty(func + "", thisArg);}function baseClone(value, isDeep, customizer, key, object, stackA, stackB){var result;if(customizer){result = object?customizer(value, key, object):customizer(value);}if(typeof result != "undefined"){return result;}if(!isObject(value)){return value;}var isArr=isArray(value);if(isArr){result = initCloneArray(value);if(!isDeep){return arrayCopy(value, result);}}else {var tag=objToString.call(value), isFunc=tag == funcTag;if(tag == objectTag || tag == argsTag || isFunc && !object){result = initCloneObject(isFunc?{}:value);if(!isDeep){return baseCopy(value, result, keys(value));}}else {return cloneableTags[tag]?initCloneByTag(value, tag, isDeep):object?value:{};}}stackA || (stackA = []);stackB || (stackB = []);var length=stackA.length;while(length--) {if(stackA[length] == value){return stackB[length];}}stackA.push(value);stackB.push(result);(isArr?arrayEach:baseForOwn)(value, function(subValue, key){result[key] = baseClone(subValue, isDeep, customizer, key, value, stackA, stackB);});return result;}var baseCreate=(function(){function Object(){}return function(prototype){if(isObject(prototype)){Object.prototype = prototype;var result=new Object();Object.prototype = null;}return result || context.Object();};})();function baseDelay(func, wait, args, fromIndex){if(typeof func != "function"){throw new TypeError(FUNC_ERROR_TEXT);}return setTimeout(function(){func.apply(undefined, baseSlice(args, fromIndex));}, wait);}function baseDifference(array, values){var length=array?array.length:0, result=[];if(!length){return result;}var index=-1, indexOf=getIndexOf(), isCommon=indexOf == baseIndexOf, cache=isCommon && values.length >= 200?createCache(values):null, valuesLength=values.length;if(cache){indexOf = cacheIndexOf;isCommon = false;values = cache;}outer: while(++index < length) {var value=array[index];if(isCommon && value === value){var valuesIndex=valuesLength;while(valuesIndex--) {if(values[valuesIndex] === value){continue outer;}}result.push(value);}else if(indexOf(values, value) < 0){result.push(value);}}return result;}function baseEach(collection, iteratee){var length=collection?collection.length:0;if(!isLength(length)){return baseForOwn(collection, iteratee);}var index=-1, iterable=toObject(collection);while(++index < length) {if(iteratee(iterable[index], index, iterable) === false){break;}}return collection;}function baseEachRight(collection, iteratee){var length=collection?collection.length:0;if(!isLength(length)){return baseForOwnRight(collection, iteratee);}var iterable=toObject(collection);while(length--) {if(iteratee(iterable[length], length, iterable) === false){break;}}return collection;}function baseEvery(collection, predicate){var result=true;baseEach(collection, function(value, index, collection){result = !!predicate(value, index, collection);return result;});return result;}function baseFill(array, value, start, end){var length=array.length;start = start == null?0:+start || 0;if(start < 0){start = -start > length?0:length + start;}end = typeof end == "undefined" || end > length?length:+end || 0;if(end < 0){end += length;}length = start > end?0:end >>> 0;start >>>= 0;while(start < length) {array[start++] = value;}return array;}function baseFilter(collection, predicate){var result=[];baseEach(collection, function(value, index, collection){if(predicate(value, index, collection)){result.push(value);}});return result;}function baseFind(collection, predicate, eachFunc, retKey){var result;eachFunc(collection, function(value, key, collection){if(predicate(value, key, collection)){result = retKey?key:value;return false;}});return result;}function baseFlatten(array, isDeep, isStrict, fromIndex){var index=(fromIndex || 0) - 1, length=array.length, resIndex=-1, result=[];while(++index < length) {var value=array[index];if(isObjectLike(value) && isLength(value.length) && (isArray(value) || isArguments(value))){if(isDeep){value = baseFlatten(value, isDeep, isStrict);}var valIndex=-1, valLength=value.length;result.length += valLength;while(++valIndex < valLength) {result[++resIndex] = value[valIndex];}}else if(!isStrict){result[++resIndex] = value;}}return result;}function baseFor(object, iteratee, keysFunc){var index=-1, iterable=toObject(object), props=keysFunc(object), length=props.length;while(++index < length) {var key=props[index];if(iteratee(iterable[key], key, iterable) === false){break;}}return object;}function baseForRight(object, iteratee, keysFunc){var iterable=toObject(object), props=keysFunc(object), length=props.length;while(length--) {var key=props[length];if(iteratee(iterable[key], key, iterable) === false){break;}}return object;}function baseForIn(object, iteratee){return baseFor(object, iteratee, keysIn);}function baseForOwn(object, iteratee){return baseFor(object, iteratee, keys);}function baseForOwnRight(object, iteratee){return baseForRight(object, iteratee, keys);}function baseFunctions(object, props){var index=-1, length=props.length, resIndex=-1, result=[];while(++index < length) {var key=props[index];if(isFunction(object[key])){result[++resIndex] = key;}}return result;}function baseInvoke(collection, methodName, args){var index=-1, isFunc=typeof methodName == "function", length=collection?collection.length:0, result=isLength(length)?Array(length):[];baseEach(collection, function(value){var func=isFunc?methodName:value != null && value[methodName];result[++index] = func?func.apply(value, args):undefined;});return result;}function baseIsEqual(value, other, customizer, isWhere, stackA, stackB){if(value === other){return value !== 0 || 1 / value == 1 / other;}var valType=typeof value, othType=typeof other;if(valType != "function" && valType != "object" && othType != "function" && othType != "object" || value == null || other == null){return value !== value && other !== other;}return baseIsEqualDeep(value, other, baseIsEqual, customizer, isWhere, stackA, stackB);}function baseIsEqualDeep(object, other, equalFunc, customizer, isWhere, stackA, stackB){var objIsArr=isArray(object), othIsArr=isArray(other), objTag=arrayTag, othTag=arrayTag;if(!objIsArr){objTag = objToString.call(object);if(objTag == argsTag){objTag = objectTag;}else if(objTag != objectTag){objIsArr = isTypedArray(object);}}if(!othIsArr){othTag = objToString.call(other);if(othTag == argsTag){othTag = objectTag;}else if(othTag != objectTag){othIsArr = isTypedArray(other);}}var objIsObj=objTag == objectTag, othIsObj=othTag == objectTag, isSameTag=objTag == othTag;if(isSameTag && !(objIsArr || objIsObj)){return equalByTag(object, other, objTag);}var valWrapped=objIsObj && hasOwnProperty.call(object, "__wrapped__"), othWrapped=othIsObj && hasOwnProperty.call(other, "__wrapped__");if(valWrapped || othWrapped){return equalFunc(valWrapped?object.value():object, othWrapped?other.value():other, customizer, isWhere, stackA, stackB);}if(!isSameTag){return false;}stackA || (stackA = []);stackB || (stackB = []);var length=stackA.length;while(length--) {if(stackA[length] == object){return stackB[length] == other;}}stackA.push(object);stackB.push(other);var result=(objIsArr?equalArrays:equalObjects)(object, other, equalFunc, customizer, isWhere, stackA, stackB);stackA.pop();stackB.pop();return result;}function baseIsMatch(object, props, values, strictCompareFlags, customizer){var length=props.length;if(object == null){return !length;}var index=-1, noCustomizer=!customizer;while(++index < length) {if(noCustomizer && strictCompareFlags[index]?values[index] !== object[props[index]]:!hasOwnProperty.call(object, props[index])){return false;}}index = -1;while(++index < length) {var key=props[index];if(noCustomizer && strictCompareFlags[index]){var result=hasOwnProperty.call(object, key);}else {var objValue=object[key], srcValue=values[index];result = customizer?customizer(objValue, srcValue, key):undefined;if(typeof result == "undefined"){result = baseIsEqual(srcValue, objValue, customizer, true);}}if(!result){return false;}}return true;}function baseMap(collection, iteratee){var result=[];baseEach(collection, function(value, key, collection){result.push(iteratee(value, key, collection));});return result;}function baseMatches(source){var props=keys(source), length=props.length;if(length == 1){var key=props[0], value=source[key];if(isStrictComparable(value)){return function(object){return object != null && object[key] === value && hasOwnProperty.call(object, key);};}}var values=Array(length), strictCompareFlags=Array(length);while(length--) {value = source[props[length]];values[length] = value;strictCompareFlags[length] = isStrictComparable(value);}return function(object){return baseIsMatch(object, props, values, strictCompareFlags);};}function baseMatchesProperty(key, value){if(isStrictComparable(value)){return function(object){return object != null && object[key] === value;};}return function(object){return object != null && baseIsEqual(value, object[key], null, true);};}function baseMerge(object, source, customizer, stackA, stackB){if(!isObject(object)){return object;}var isSrcArr=isLength(source.length) && (isArray(source) || isTypedArray(source));(isSrcArr?arrayEach:baseForOwn)(source, function(srcValue, key, source){if(isObjectLike(srcValue)){stackA || (stackA = []);stackB || (stackB = []);return baseMergeDeep(object, source, key, baseMerge, customizer, stackA, stackB);}var value=object[key], result=customizer?customizer(value, srcValue, key, object, source):undefined, isCommon=typeof result == "undefined";if(isCommon){result = srcValue;}if((isSrcArr || typeof result != "undefined") && (isCommon || (result === result?result !== value:value === value))){object[key] = result;}});return object;}function baseMergeDeep(object, source, key, mergeFunc, customizer, stackA, stackB){var length=stackA.length, srcValue=source[key];while(length--) {if(stackA[length] == srcValue){object[key] = stackB[length];return;}}var value=object[key], result=customizer?customizer(value, srcValue, key, object, source):undefined, isCommon=typeof result == "undefined";if(isCommon){result = srcValue;if(isLength(srcValue.length) && (isArray(srcValue) || isTypedArray(srcValue))){result = isArray(value)?value:value?arrayCopy(value):[];}else if(isPlainObject(srcValue) || isArguments(srcValue)){result = isArguments(value)?toPlainObject(value):isPlainObject(value)?value:{};}else {isCommon = false;}}stackA.push(srcValue);stackB.push(result);if(isCommon){object[key] = mergeFunc(result, srcValue, customizer, stackA, stackB);}else if(result === result?result !== value:value === value){object[key] = result;}}function baseProperty(key){return function(object){return object == null?undefined:object[key];};}function basePullAt(array, indexes){var length=indexes.length, result=baseAt(array, indexes);indexes.sort(baseCompareAscending);while(length--) {var index=parseFloat(indexes[length]);if(index != previous && isIndex(index)){var previous=index;splice.call(array, index, 1);}}return result;}function baseRandom(min, max){return min + floor(nativeRandom() * (max - min + 1));}function baseReduce(collection, iteratee, accumulator, initFromCollection, eachFunc){eachFunc(collection, function(value, index, collection){accumulator = initFromCollection?(initFromCollection = false, value):iteratee(accumulator, value, index, collection);});return accumulator;}var baseSetData=!metaMap?identity:function(func, data){metaMap.set(func, data);return func;};function baseSlice(array, start, end){var index=-1, length=array.length;start = start == null?0:+start || 0;if(start < 0){start = -start > length?0:length + start;}end = typeof end == "undefined" || end > length?length:+end || 0;if(end < 0){end += length;}length = start > end?0:end - start >>> 0;start >>>= 0;var result=Array(length);while(++index < length) {result[index] = array[index + start];}return result;}function baseSome(collection, predicate){var result;baseEach(collection, function(value, index, collection){result = predicate(value, index, collection);return !result;});return !!result;}function baseUniq(array, iteratee){var index=-1, indexOf=getIndexOf(), length=array.length, isCommon=indexOf == baseIndexOf, isLarge=isCommon && length >= 200, seen=isLarge?createCache():null, result=[];if(seen){indexOf = cacheIndexOf;isCommon = false;}else {isLarge = false;seen = iteratee?[]:result;}outer: while(++index < length) {var value=array[index], computed=iteratee?iteratee(value, index, array):value;if(isCommon && value === value){var seenIndex=seen.length;while(seenIndex--) {if(seen[seenIndex] === computed){continue outer;}}if(iteratee){seen.push(computed);}result.push(value);}else if(indexOf(seen, computed) < 0){if(iteratee || isLarge){seen.push(computed);}result.push(value);}}return result;}function baseValues(object, props){var index=-1, length=props.length, result=Array(length);while(++index < length) {result[index] = object[props[index]];}return result;}function baseWrapperValue(value, actions){var result=value;if(result instanceof LazyWrapper){result = result.value();}var index=-1, length=actions.length;while(++index < length) {var args=[result], action=actions[index];push.apply(args, action.args);result = action.func.apply(action.thisArg, args);}return result;}function binaryIndex(array, value, retHighest){var low=0, high=array?array.length:low;if(typeof value == "number" && value === value && high <= HALF_MAX_ARRAY_LENGTH){while(low < high) {var mid=low + high >>> 1, computed=array[mid];if(retHighest?computed <= value:computed < value){low = mid + 1;}else {high = mid;}}return high;}return binaryIndexBy(array, value, identity, retHighest);}function binaryIndexBy(array, value, iteratee, retHighest){value = iteratee(value);var low=0, high=array?array.length:0, valIsNaN=value !== value, valIsUndef=typeof value == "undefined";while(low < high) {var mid=floor((low + high) / 2), computed=iteratee(array[mid]), isReflexive=computed === computed;if(valIsNaN){var setLow=isReflexive || retHighest;}else if(valIsUndef){setLow = isReflexive && (retHighest || typeof computed != "undefined");}else {setLow = retHighest?computed <= value:computed < value;}if(setLow){low = mid + 1;}else {high = mid;}}return nativeMin(high, MAX_ARRAY_INDEX);}function bindCallback(func, thisArg, argCount){if(typeof func != "function"){return identity;}if(typeof thisArg == "undefined"){return func;}switch(argCount){case 1:return function(value){return func.call(thisArg, value);};case 3:return function(value, index, collection){return func.call(thisArg, value, index, collection);};case 4:return function(accumulator, value, index, collection){return func.call(thisArg, accumulator, value, index, collection);};case 5:return function(value, other, key, object, source){return func.call(thisArg, value, other, key, object, source);};}return function(){return func.apply(thisArg, arguments);};}function bufferClone(buffer){return bufferSlice.call(buffer, 0);}if(!bufferSlice){bufferClone = !(ArrayBuffer && Uint8Array)?constant(null):function(buffer){var byteLength=buffer.byteLength, floatLength=Float64Array?floor(byteLength / FLOAT64_BYTES_PER_ELEMENT):0, offset=floatLength * FLOAT64_BYTES_PER_ELEMENT, result=new ArrayBuffer(byteLength);if(floatLength){var view=new Float64Array(result, 0, floatLength);view.set(new Float64Array(buffer, 0, floatLength));}if(byteLength != offset){view = new Uint8Array(result, offset);view.set(new Uint8Array(buffer, offset));}return result;};}function composeArgs(args, partials, holders){var holdersLength=holders.length, argsIndex=-1, argsLength=nativeMax(args.length - holdersLength, 0), leftIndex=-1, leftLength=partials.length, result=Array(argsLength + leftLength);while(++leftIndex < leftLength) {result[leftIndex] = partials[leftIndex];}while(++argsIndex < holdersLength) {result[holders[argsIndex]] = args[argsIndex];}while(argsLength--) {result[leftIndex++] = args[argsIndex++];}return result;}function composeArgsRight(args, partials, holders){var holdersIndex=-1, holdersLength=holders.length, argsIndex=-1, argsLength=nativeMax(args.length - holdersLength, 0), rightIndex=-1, rightLength=partials.length, result=Array(argsLength + rightLength);while(++argsIndex < argsLength) {result[argsIndex] = args[argsIndex];}var pad=argsIndex;while(++rightIndex < rightLength) {result[pad + rightIndex] = partials[rightIndex];}while(++holdersIndex < holdersLength) {result[pad + holders[holdersIndex]] = args[argsIndex++];}return result;}function createAggregator(setter, initializer){return function(collection, iteratee, thisArg){var result=initializer?initializer():{};iteratee = getCallback(iteratee, thisArg, 3);if(isArray(collection)){var index=-1, length=collection.length;while(++index < length) {var value=collection[index];setter(result, value, iteratee(value, index, collection), collection);}}else {baseEach(collection, function(value, key, collection){setter(result, value, iteratee(value, key, collection), collection);});}return result;};}function createAssigner(assigner){return function(){var length=arguments.length, object=arguments[0];if(length < 2 || object == null){return object;}if(length > 3 && isIterateeCall(arguments[1], arguments[2], arguments[3])){length = 2;}if(length > 3 && typeof arguments[length - 2] == "function"){var customizer=bindCallback(arguments[--length - 1], arguments[length--], 5);}else if(length > 2 && typeof arguments[length - 1] == "function"){customizer = arguments[--length];}var index=0;while(++index < length) {var source=arguments[index];if(source){assigner(object, source, customizer);}}return object;};}function createBindWrapper(func, thisArg){var Ctor=createCtorWrapper(func);function wrapper(){return (this instanceof wrapper?Ctor:func).apply(thisArg, arguments);}return wrapper;}var createCache=!(nativeCreate && Set)?constant(null):function(values){return new SetCache(values);};function createCompounder(callback){return function(string){var index=-1, array=words(deburr(string)), length=array.length, result="";while(++index < length) {result = callback(result, array[index], index);}return result;};}function createCtorWrapper(Ctor){return function(){var thisBinding=baseCreate(Ctor.prototype), result=Ctor.apply(thisBinding, arguments);return isObject(result)?result:thisBinding;};}function createExtremum(arrayFunc, isMin){return function(collection, iteratee, thisArg){if(thisArg && isIterateeCall(collection, iteratee, thisArg)){iteratee = null;}var func=getCallback(), noIteratee=iteratee == null;if(!(func === baseCallback && noIteratee)){noIteratee = false;iteratee = func(iteratee, thisArg, 3);}if(noIteratee){var isArr=isArray(collection);if(!isArr && isString(collection)){iteratee = charAtCallback;}else {return arrayFunc(isArr?collection:toIterable(collection));}}return extremumBy(collection, iteratee, isMin);};}function createHybridWrapper(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity){var isAry=bitmask & ARY_FLAG, isBind=bitmask & BIND_FLAG, isBindKey=bitmask & BIND_KEY_FLAG, isCurry=bitmask & CURRY_FLAG, isCurryBound=bitmask & CURRY_BOUND_FLAG, isCurryRight=bitmask & CURRY_RIGHT_FLAG;var Ctor=!isBindKey && createCtorWrapper(func), key=func;function wrapper(){var length=arguments.length, index=length, args=Array(length);while(index--) {args[index] = arguments[index];}if(partials){args = composeArgs(args, partials, holders);}if(partialsRight){args = composeArgsRight(args, partialsRight, holdersRight);}if(isCurry || isCurryRight){var placeholder=wrapper.placeholder, argsHolders=replaceHolders(args, placeholder);length -= argsHolders.length;if(length < arity){var newArgPos=argPos?arrayCopy(argPos):null, newArity=nativeMax(arity - length, 0), newsHolders=isCurry?argsHolders:null, newHoldersRight=isCurry?null:argsHolders, newPartials=isCurry?args:null, newPartialsRight=isCurry?null:args;bitmask |= isCurry?PARTIAL_FLAG:PARTIAL_RIGHT_FLAG;bitmask &= ~(isCurry?PARTIAL_RIGHT_FLAG:PARTIAL_FLAG);if(!isCurryBound){bitmask &= ~(BIND_FLAG | BIND_KEY_FLAG);}var result=createHybridWrapper(func, bitmask, thisArg, newPartials, newsHolders, newPartialsRight, newHoldersRight, newArgPos, ary, newArity);result.placeholder = placeholder;return result;}}var thisBinding=isBind?thisArg:this;if(isBindKey){func = thisBinding[key];}if(argPos){args = reorder(args, argPos);}if(isAry && ary < args.length){args.length = ary;}return (this instanceof wrapper?Ctor || createCtorWrapper(func):func).apply(thisBinding, args);}return wrapper;}function createPad(string, length, chars){var strLength=string.length;length = +length;if(strLength >= length || !nativeIsFinite(length)){return "";}var padLength=length - strLength;chars = chars == null?" ":chars + "";return repeat(chars, ceil(padLength / chars.length)).slice(0, padLength);}function createPartialWrapper(func, bitmask, thisArg, partials){var isBind=bitmask & BIND_FLAG, Ctor=createCtorWrapper(func);function wrapper(){var argsIndex=-1, argsLength=arguments.length, leftIndex=-1, leftLength=partials.length, args=Array(argsLength + leftLength);while(++leftIndex < leftLength) {args[leftIndex] = partials[leftIndex];}while(argsLength--) {args[leftIndex++] = arguments[++argsIndex];}return (this instanceof wrapper?Ctor:func).apply(isBind?thisArg:this, args);}return wrapper;}function createWrapper(func, bitmask, thisArg, partials, holders, argPos, ary, arity){var isBindKey=bitmask & BIND_KEY_FLAG;if(!isBindKey && typeof func != "function"){throw new TypeError(FUNC_ERROR_TEXT);}var length=partials?partials.length:0;if(!length){bitmask &= ~(PARTIAL_FLAG | PARTIAL_RIGHT_FLAG);partials = holders = null;}length -= holders?holders.length:0;if(bitmask & PARTIAL_RIGHT_FLAG){var partialsRight=partials, holdersRight=holders;partials = holders = null;}var data=!isBindKey && getData(func), newData=[func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity];if(data && data !== true){mergeData(newData, data);bitmask = newData[1];arity = newData[9];}newData[9] = arity == null?isBindKey?0:func.length:nativeMax(arity - length, 0) || 0;if(bitmask == BIND_FLAG){var result=createBindWrapper(newData[0], newData[2]);}else if((bitmask == PARTIAL_FLAG || bitmask == (BIND_FLAG | PARTIAL_FLAG)) && !newData[4].length){result = createPartialWrapper.apply(undefined, newData);}else {result = createHybridWrapper.apply(undefined, newData);}var setter=data?baseSetData:setData;return setter(result, newData);}function equalArrays(array, other, equalFunc, customizer, isWhere, stackA, stackB){var index=-1, arrLength=array.length, othLength=other.length, result=true;if(arrLength != othLength && !(isWhere && othLength > arrLength)){return false;}while(result && ++index < arrLength) {var arrValue=array[index], othValue=other[index];result = undefined;if(customizer){result = isWhere?customizer(othValue, arrValue, index):customizer(arrValue, othValue, index);}if(typeof result == "undefined"){if(isWhere){var othIndex=othLength;while(othIndex--) {othValue = other[othIndex];result = arrValue && arrValue === othValue || equalFunc(arrValue, othValue, customizer, isWhere, stackA, stackB);if(result){break;}}}else {result = arrValue && arrValue === othValue || equalFunc(arrValue, othValue, customizer, isWhere, stackA, stackB);}}}return !!result;}function equalByTag(object, other, tag){switch(tag){case boolTag:case dateTag:return +object == +other;case errorTag:return object.name == other.name && object.message == other.message;case numberTag:return object != +object?other != +other:object == 0?1 / object == 1 / other:object == +other;case regexpTag:case stringTag:return object == other + "";}return false;}function equalObjects(object, other, equalFunc, customizer, isWhere, stackA, stackB){var objProps=keys(object), objLength=objProps.length, othProps=keys(other), othLength=othProps.length;if(objLength != othLength && !isWhere){return false;}var hasCtor, index=-1;while(++index < objLength) {var key=objProps[index], result=hasOwnProperty.call(other, key);if(result){var objValue=object[key], othValue=other[key];result = undefined;if(customizer){result = isWhere?customizer(othValue, objValue, key):customizer(objValue, othValue, key);}if(typeof result == "undefined"){result = objValue && objValue === othValue || equalFunc(objValue, othValue, customizer, isWhere, stackA, stackB);}}if(!result){return false;}hasCtor || (hasCtor = key == "constructor");}if(!hasCtor){var objCtor=object.constructor, othCtor=other.constructor;if(objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)){return false;}}return true;}function extremumBy(collection, iteratee, isMin){var exValue=isMin?POSITIVE_INFINITY:NEGATIVE_INFINITY, computed=exValue, result=computed;baseEach(collection, function(value, index, collection){var current=iteratee(value, index, collection);if((isMin?current < computed:current > computed) || current === exValue && current === result){computed = current;result = value;}});return result;}function getCallback(func, thisArg, argCount){var result=lodash.callback || callback;result = result === callback?baseCallback:result;return argCount?result(func, thisArg, argCount):result;}var getData=!metaMap?noop:function(func){return metaMap.get(func);};function getIndexOf(collection, target, fromIndex){var result=lodash.indexOf || indexOf;result = result === indexOf?baseIndexOf:result;return collection?result(collection, target, fromIndex):result;}function getView(start, end, transforms){var index=-1, length=transforms?transforms.length:0;while(++index < length) {var data=transforms[index], size=data.size;switch(data.type){case "drop":start += size;break;case "dropRight":end -= size;break;case "take":end = nativeMin(end, start + size);break;case "takeRight":start = nativeMax(start, end - size);break;}}return {start:start, end:end};}function initCloneArray(array){var length=array.length, result=new array.constructor(length);if(length && typeof array[0] == "string" && hasOwnProperty.call(array, "index")){result.index = array.index;result.input = array.input;}return result;}function initCloneObject(object){var Ctor=object.constructor;if(!(typeof Ctor == "function" && Ctor instanceof Ctor)){Ctor = Object;}return new Ctor();}function initCloneByTag(object, tag, isDeep){var Ctor=object.constructor;switch(tag){case arrayBufferTag:return bufferClone(object);case boolTag:case dateTag:return new Ctor(+object);case float32Tag:case float64Tag:case int8Tag:case int16Tag:case int32Tag:case uint8Tag:case uint8ClampedTag:case uint16Tag:case uint32Tag:var buffer=object.buffer;return new Ctor(isDeep?bufferClone(buffer):buffer, object.byteOffset, object.length);case numberTag:case stringTag:return new Ctor(object);case regexpTag:var result=new Ctor(object.source, reFlags.exec(object));result.lastIndex = object.lastIndex;}return result;}function isBindable(func){var support=lodash.support, result=!(support.funcNames?func.name:support.funcDecomp);if(!result){var source=fnToString.call(func);if(!support.funcNames){result = !reFuncName.test(source);}if(!result){result = reThis.test(source) || isNative(func);baseSetData(func, result);}}return result;}function isIndex(value, length){value = +value;length = length == null?MAX_SAFE_INTEGER:length;return value > -1 && value % 1 == 0 && value < length;}function isIterateeCall(value, index, object){if(!isObject(object)){return false;}var type=typeof index;if(type == "number"){var length=object.length, prereq=isLength(length) && isIndex(index, length);}else {prereq = type == "string" && index in object;}if(prereq){var other=object[index];return value === value?value === other:other !== other;}return false;}function isLength(value){return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;}function isStrictComparable(value){return value === value && (value === 0?1 / value > 0:!isObject(value));}function mergeData(data, source){var bitmask=data[1], srcBitmask=source[1], newBitmask=bitmask | srcBitmask;var arityFlags=ARY_FLAG | REARG_FLAG, bindFlags=BIND_FLAG | BIND_KEY_FLAG, comboFlags=arityFlags | bindFlags | CURRY_BOUND_FLAG | CURRY_RIGHT_FLAG;var isAry=bitmask & ARY_FLAG && !(srcBitmask & ARY_FLAG), isRearg=bitmask & REARG_FLAG && !(srcBitmask & REARG_FLAG), argPos=(isRearg?data:source)[7], ary=(isAry?data:source)[8];var isCommon=!(bitmask >= REARG_FLAG && srcBitmask > bindFlags) && !(bitmask > bindFlags && srcBitmask >= REARG_FLAG);var isCombo=newBitmask >= arityFlags && newBitmask <= comboFlags && (bitmask < REARG_FLAG || (isRearg || isAry) && argPos.length <= ary);if(!(isCommon || isCombo)){return data;}if(srcBitmask & BIND_FLAG){data[2] = source[2];newBitmask |= bitmask & BIND_FLAG?0:CURRY_BOUND_FLAG;}var value=source[3];if(value){var partials=data[3];data[3] = partials?composeArgs(partials, value, source[4]):arrayCopy(value);data[4] = partials?replaceHolders(data[3], PLACEHOLDER):arrayCopy(source[4]);}value = source[5];if(value){partials = data[5];data[5] = partials?composeArgsRight(partials, value, source[6]):arrayCopy(value);data[6] = partials?replaceHolders(data[5], PLACEHOLDER):arrayCopy(source[6]);}value = source[7];if(value){data[7] = arrayCopy(value);}if(srcBitmask & ARY_FLAG){data[8] = data[8] == null?source[8]:nativeMin(data[8], source[8]);}if(data[9] == null){data[9] = source[9];}data[0] = source[0];data[1] = newBitmask;return data;}function pickByArray(object, props){object = toObject(object);var index=-1, length=props.length, result={};while(++index < length) {var key=props[index];if(key in object){result[key] = object[key];}}return result;}function pickByCallback(object, predicate){var result={};baseForIn(object, function(value, key, object){if(predicate(value, key, object)){result[key] = value;}});return result;}function reorder(array, indexes){var arrLength=array.length, length=nativeMin(indexes.length, arrLength), oldArray=arrayCopy(array);while(length--) {var index=indexes[length];array[length] = isIndex(index, arrLength)?oldArray[index]:undefined;}return array;}var setData=(function(){var count=0, lastCalled=0;return function(key, value){var stamp=now(), remaining=HOT_SPAN - (stamp - lastCalled);lastCalled = stamp;if(remaining > 0){if(++count >= HOT_COUNT){return key;}}else {count = 0;}return baseSetData(key, value);};})();function shimIsPlainObject(value){var Ctor, support=lodash.support;if(!(isObjectLike(value) && objToString.call(value) == objectTag) || !hasOwnProperty.call(value, "constructor") && (Ctor = value.constructor, typeof Ctor == "function" && !(Ctor instanceof Ctor))){return false;}var result;baseForIn(value, function(subValue, key){result = key;});return typeof result == "undefined" || hasOwnProperty.call(value, result);}function shimKeys(object){var props=keysIn(object), propsLength=props.length, length=propsLength && object.length, support=lodash.support;var allowIndexes=length && isLength(length) && (isArray(object) || support.nonEnumArgs && isArguments(object));var index=-1, result=[];while(++index < propsLength) {var key=props[index];if(allowIndexes && isIndex(key, length) || hasOwnProperty.call(object, key)){result.push(key);}}return result;}function toIterable(value){if(value == null){return [];}if(!isLength(value.length)){return values(value);}return isObject(value)?value:Object(value);}function toObject(value){return isObject(value)?value:Object(value);}function wrapperClone(wrapper){return wrapper instanceof LazyWrapper?wrapper.clone():new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__, arrayCopy(wrapper.__actions__));}function chunk(array, size, guard){if(guard?isIterateeCall(array, size, guard):size == null){size = 1;}else {size = nativeMax(+size || 1, 1);}var index=0, length=array?array.length:0, resIndex=-1, result=Array(ceil(length / size));while(index < length) {result[++resIndex] = baseSlice(array, index, index += size);}return result;}function compact(array){var index=-1, length=array?array.length:0, resIndex=-1, result=[];while(++index < length) {var value=array[index];if(value){result[++resIndex] = value;}}return result;}function difference(){var index=-1, length=arguments.length;while(++index < length) {var value=arguments[index];if(isArray(value) || isArguments(value)){break;}}return baseDifference(value, baseFlatten(arguments, false, true, ++index));}function drop(array, n, guard){var length=array?array.length:0;if(!length){return [];}if(guard?isIterateeCall(array, n, guard):n == null){n = 1;}return baseSlice(array, n < 0?0:n);}function dropRight(array, n, guard){var length=array?array.length:0;if(!length){return [];}if(guard?isIterateeCall(array, n, guard):n == null){n = 1;}n = length - (+n || 0);return baseSlice(array, 0, n < 0?0:n);}function dropRightWhile(array, predicate, thisArg){var length=array?array.length:0;if(!length){return [];}predicate = getCallback(predicate, thisArg, 3);while(length-- && predicate(array[length], length, array)) {}return baseSlice(array, 0, length + 1);}function dropWhile(array, predicate, thisArg){var length=array?array.length:0;if(!length){return [];}var index=-1;predicate = getCallback(predicate, thisArg, 3);while(++index < length && predicate(array[index], index, array)) {}return baseSlice(array, index);}function fill(array, value, start, end){var length=array?array.length:0;if(!length){return [];}if(start && typeof start != "number" && isIterateeCall(array, value, start)){start = 0;end = length;}return baseFill(array, value, start, end);}function findIndex(array, predicate, thisArg){var index=-1, length=array?array.length:0;predicate = getCallback(predicate, thisArg, 3);while(++index < length) {if(predicate(array[index], index, array)){return index;}}return -1;}function findLastIndex(array, predicate, thisArg){var length=array?array.length:0;predicate = getCallback(predicate, thisArg, 3);while(length--) {if(predicate(array[length], length, array)){return length;}}return -1;}function first(array){return array?array[0]:undefined;}function flatten(array, isDeep, guard){var length=array?array.length:0;if(guard && isIterateeCall(array, isDeep, guard)){isDeep = false;}return length?baseFlatten(array, isDeep):[];}function flattenDeep(array){var length=array?array.length:0;return length?baseFlatten(array, true):[];}function indexOf(array, value, fromIndex){var length=array?array.length:0;if(!length){return -1;}if(typeof fromIndex == "number"){fromIndex = fromIndex < 0?nativeMax(length + fromIndex, 0):fromIndex || 0;}else if(fromIndex){var index=binaryIndex(array, value), other=array[index];return (value === value?value === other:other !== other)?index:-1;}return baseIndexOf(array, value, fromIndex);}function initial(array){return dropRight(array, 1);}function intersection(){var args=[], argsIndex=-1, argsLength=arguments.length, caches=[], indexOf=getIndexOf(), isCommon=indexOf == baseIndexOf;while(++argsIndex < argsLength) {var value=arguments[argsIndex];if(isArray(value) || isArguments(value)){args.push(value);caches.push(isCommon && value.length >= 120?createCache(argsIndex && value):null);}}argsLength = args.length;var array=args[0], index=-1, length=array?array.length:0, result=[], seen=caches[0];outer: while(++index < length) {value = array[index];if((seen?cacheIndexOf(seen, value):indexOf(result, value)) < 0){argsIndex = argsLength;while(--argsIndex) {var cache=caches[argsIndex];if((cache?cacheIndexOf(cache, value):indexOf(args[argsIndex], value)) < 0){continue outer;}}if(seen){seen.push(value);}result.push(value);}}return result;}function last(array){var length=array?array.length:0;return length?array[length - 1]:undefined;}function lastIndexOf(array, value, fromIndex){var length=array?array.length:0;if(!length){return -1;}var index=length;if(typeof fromIndex == "number"){index = (fromIndex < 0?nativeMax(length + fromIndex, 0):nativeMin(fromIndex || 0, length - 1)) + 1;}else if(fromIndex){index = binaryIndex(array, value, true) - 1;var other=array[index];return (value === value?value === other:other !== other)?index:-1;}if(value !== value){return indexOfNaN(array, index, true);}while(index--) {if(array[index] === value){return index;}}return -1;}function pull(){var array=arguments[0];if(!(array && array.length)){return array;}var index=0, indexOf=getIndexOf(), length=arguments.length;while(++index < length) {var fromIndex=0, value=arguments[index];while((fromIndex = indexOf(array, value, fromIndex)) > -1) {splice.call(array, fromIndex, 1);}}return array;}function pullAt(array){return basePullAt(array || [], baseFlatten(arguments, false, false, 1));}function remove(array, predicate, thisArg){var index=-1, length=array?array.length:0, result=[];predicate = getCallback(predicate, thisArg, 3);while(++index < length) {var value=array[index];if(predicate(value, index, array)){result.push(value);splice.call(array, index--, 1);length--;}}return result;}function rest(array){return drop(array, 1);}function slice(array, start, end){var length=array?array.length:0;if(!length){return [];}if(end && typeof end != "number" && isIterateeCall(array, start, end)){start = 0;end = length;}return baseSlice(array, start, end);}function sortedIndex(array, value, iteratee, thisArg){var func=getCallback(iteratee);return func === baseCallback && iteratee == null?binaryIndex(array, value):binaryIndexBy(array, value, func(iteratee, thisArg, 1));}function sortedLastIndex(array, value, iteratee, thisArg){var func=getCallback(iteratee);return func === baseCallback && iteratee == null?binaryIndex(array, value, true):binaryIndexBy(array, value, func(iteratee, thisArg, 1), true);}function take(array, n, guard){var length=array?array.length:0;if(!length){return [];}if(guard?isIterateeCall(array, n, guard):n == null){n = 1;}return baseSlice(array, 0, n < 0?0:n);}function takeRight(array, n, guard){var length=array?array.length:0;if(!length){return [];}if(guard?isIterateeCall(array, n, guard):n == null){n = 1;}n = length - (+n || 0);return baseSlice(array, n < 0?0:n);}function takeRightWhile(array, predicate, thisArg){var length=array?array.length:0;if(!length){return [];}predicate = getCallback(predicate, thisArg, 3);while(length-- && predicate(array[length], length, array)) {}return baseSlice(array, length + 1);}function takeWhile(array, predicate, thisArg){var length=array?array.length:0;if(!length){return [];}var index=-1;predicate = getCallback(predicate, thisArg, 3);while(++index < length && predicate(array[index], index, array)) {}return baseSlice(array, 0, index);}function union(){return baseUniq(baseFlatten(arguments, false, true));}function uniq(array, isSorted, iteratee, thisArg){var length=array?array.length:0;if(!length){return [];}if(isSorted != null && typeof isSorted != "boolean"){thisArg = iteratee;iteratee = isIterateeCall(array, isSorted, thisArg)?null:isSorted;isSorted = false;}var func=getCallback();if(!(func === baseCallback && iteratee == null)){iteratee = func(iteratee, thisArg, 3);}return isSorted && getIndexOf() == baseIndexOf?sortedUniq(array, iteratee):baseUniq(array, iteratee);}function unzip(array){var index=-1, length=(array && array.length && arrayMax(arrayMap(array, getLength))) >>> 0, result=Array(length);while(++index < length) {result[index] = arrayMap(array, baseProperty(index));}return result;}function without(array){return baseDifference(array, baseSlice(arguments, 1));}function xor(){var index=-1, length=arguments.length;while(++index < length) {var array=arguments[index];if(isArray(array) || isArguments(array)){var result=result?baseDifference(result, array).concat(baseDifference(array, result)):array;}}return result?baseUniq(result):[];}function zip(){var length=arguments.length, array=Array(length);while(length--) {array[length] = arguments[length];}return unzip(array);}function zipObject(props, values){var index=-1, length=props?props.length:0, result={};if(length && !values && !isArray(props[0])){values = [];}while(++index < length) {var key=props[index];if(values){result[key] = values[index];}else if(key){result[key[0]] = key[1];}}return result;}function chain(value){var result=lodash(value);result.__chain__ = true;return result;}function tap(value, interceptor, thisArg){interceptor.call(thisArg, value);return value;}function thru(value, interceptor, thisArg){return interceptor.call(thisArg, value);}function wrapperChain(){return chain(this);}function wrapperCommit(){return new LodashWrapper(this.value(), this.__chain__);}function wrapperPlant(value){var result, parent=this;while(parent instanceof baseLodash) {var clone=wrapperClone(parent);if(result){previous.__wrapped__ = clone;}else {result = clone;}var previous=clone;parent = parent.__wrapped__;}previous.__wrapped__ = value;return result;}function wrapperReverse(){var value=this.__wrapped__;if(value instanceof LazyWrapper){if(this.__actions__.length){value = new LazyWrapper(this);}return new LodashWrapper(value.reverse(), this.__chain__);}return this.thru(function(value){return value.reverse();});}function wrapperToString(){return this.value() + "";}function wrapperValue(){return baseWrapperValue(this.__wrapped__, this.__actions__);}function at(collection){var length=collection?collection.length:0;if(isLength(length)){collection = toIterable(collection);}return baseAt(collection, baseFlatten(arguments, false, false, 1));}var countBy=createAggregator(function(result, value, key){hasOwnProperty.call(result, key)?++result[key]:result[key] = 1;});function every(collection, predicate, thisArg){var func=isArray(collection)?arrayEvery:baseEvery;if(typeof predicate != "function" || typeof thisArg != "undefined"){predicate = getCallback(predicate, thisArg, 3);}return func(collection, predicate);}function filter(collection, predicate, thisArg){var func=isArray(collection)?arrayFilter:baseFilter;predicate = getCallback(predicate, thisArg, 3);return func(collection, predicate);}function find(collection, predicate, thisArg){if(isArray(collection)){var index=findIndex(collection, predicate, thisArg);return index > -1?collection[index]:undefined;}predicate = getCallback(predicate, thisArg, 3);return baseFind(collection, predicate, baseEach);}function findLast(collection, predicate, thisArg){predicate = getCallback(predicate, thisArg, 3);return baseFind(collection, predicate, baseEachRight);}function findWhere(collection, source){return find(collection, baseMatches(source));}function forEach(collection, iteratee, thisArg){return typeof iteratee == "function" && typeof thisArg == "undefined" && isArray(collection)?arrayEach(collection, iteratee):baseEach(collection, bindCallback(iteratee, thisArg, 3));}function forEachRight(collection, iteratee, thisArg){return typeof iteratee == "function" && typeof thisArg == "undefined" && isArray(collection)?arrayEachRight(collection, iteratee):baseEachRight(collection, bindCallback(iteratee, thisArg, 3));}var groupBy=createAggregator(function(result, value, key){if(hasOwnProperty.call(result, key)){result[key].push(value);}else {result[key] = [value];}});function includes(collection, target, fromIndex){var length=collection?collection.length:0;if(!isLength(length)){collection = values(collection);length = collection.length;}if(!length){return false;}if(typeof fromIndex == "number"){fromIndex = fromIndex < 0?nativeMax(length + fromIndex, 0):fromIndex || 0;}else {fromIndex = 0;}return typeof collection == "string" || !isArray(collection) && isString(collection)?fromIndex < length && collection.indexOf(target, fromIndex) > -1:getIndexOf(collection, target, fromIndex) > -1;}var indexBy=createAggregator(function(result, value, key){result[key] = value;});function invoke(collection, methodName){return baseInvoke(collection, methodName, baseSlice(arguments, 2));}function map(collection, iteratee, thisArg){var func=isArray(collection)?arrayMap:baseMap;iteratee = getCallback(iteratee, thisArg, 3);return func(collection, iteratee);}var max=createExtremum(arrayMax);var min=createExtremum(arrayMin, true);var partition=createAggregator(function(result, value, key){result[key?0:1].push(value);}, function(){return [[], []];});function pluck(collection, key){return map(collection, baseProperty(key));}function reduce(collection, iteratee, accumulator, thisArg){var func=isArray(collection)?arrayReduce:baseReduce;return func(collection, getCallback(iteratee, thisArg, 4), accumulator, arguments.length < 3, baseEach);}function reduceRight(collection, iteratee, accumulator, thisArg){var func=isArray(collection)?arrayReduceRight:baseReduce;return func(collection, getCallback(iteratee, thisArg, 4), accumulator, arguments.length < 3, baseEachRight);}function reject(collection, predicate, thisArg){var func=isArray(collection)?arrayFilter:baseFilter;predicate = getCallback(predicate, thisArg, 3);return func(collection, function(value, index, collection){return !predicate(value, index, collection);});}function sample(collection, n, guard){if(guard?isIterateeCall(collection, n, guard):n == null){collection = toIterable(collection);var length=collection.length;return length > 0?collection[baseRandom(0, length - 1)]:undefined;}var result=shuffle(collection);result.length = nativeMin(n < 0?0:+n || 0, result.length);return result;}function shuffle(collection){collection = toIterable(collection);var index=-1, length=collection.length, result=Array(length);while(++index < length) {var rand=baseRandom(0, index);if(index != rand){result[index] = result[rand];}result[rand] = collection[index];}return result;}function size(collection){var length=collection?collection.length:0;return isLength(length)?length:keys(collection).length;}function some(collection, predicate, thisArg){var func=isArray(collection)?arraySome:baseSome;if(typeof predicate != "function" || typeof thisArg != "undefined"){predicate = getCallback(predicate, thisArg, 3);}return func(collection, predicate);}function sortBy(collection, iteratee, thisArg){var index=-1, length=collection?collection.length:0, result=isLength(length)?Array(length):[];if(thisArg && isIterateeCall(collection, iteratee, thisArg)){iteratee = null;}iteratee = getCallback(iteratee, thisArg, 3);baseEach(collection, function(value, key, collection){result[++index] = {criteria:iteratee(value, key, collection), index:index, value:value};});return baseSortBy(result, compareAscending);}function sortByAll(collection){var args=arguments;if(args.length > 3 && isIterateeCall(args[1], args[2], args[3])){args = [collection, args[1]];}var index=-1, length=collection?collection.length:0, props=baseFlatten(args, false, false, 1), result=isLength(length)?Array(length):[];baseEach(collection, function(value){var length=props.length, criteria=Array(length);while(length--) {criteria[length] = value == null?undefined:value[props[length]];}result[++index] = {criteria:criteria, index:index, value:value};});return baseSortBy(result, compareMultipleAscending);}function where(collection, source){return filter(collection, baseMatches(source));}var now=nativeNow || function(){return new Date().getTime();};function after(n, func){if(typeof func != "function"){if(typeof n == "function"){var temp=n;n = func;func = temp;}else {throw new TypeError(FUNC_ERROR_TEXT);}}n = nativeIsFinite(n = +n)?n:0;return function(){if(--n < 1){return func.apply(this, arguments);}};}function ary(func, n, guard){if(guard && isIterateeCall(func, n, guard)){n = null;}n = func && n == null?func.length:nativeMax(+n || 0, 0);return createWrapper(func, ARY_FLAG, null, null, null, null, n);}function before(n, func){var result;if(typeof func != "function"){if(typeof n == "function"){var temp=n;n = func;func = temp;}else {throw new TypeError(FUNC_ERROR_TEXT);}}return function(){if(--n > 0){result = func.apply(this, arguments);}else {func = null;}return result;};}function bind(func, thisArg){var bitmask=BIND_FLAG;if(arguments.length > 2){var partials=baseSlice(arguments, 2), holders=replaceHolders(partials, bind.placeholder);bitmask |= PARTIAL_FLAG;}return createWrapper(func, bitmask, thisArg, partials, holders);}function bindAll(object){return baseBindAll(object, arguments.length > 1?baseFlatten(arguments, false, false, 1):functions(object));}function bindKey(object, key){var bitmask=BIND_FLAG | BIND_KEY_FLAG;if(arguments.length > 2){var partials=baseSlice(arguments, 2), holders=replaceHolders(partials, bindKey.placeholder);bitmask |= PARTIAL_FLAG;}return createWrapper(key, bitmask, object, partials, holders);}function curry(func, arity, guard){if(guard && isIterateeCall(func, arity, guard)){arity = null;}var result=createWrapper(func, CURRY_FLAG, null, null, null, null, null, arity);result.placeholder = curry.placeholder;return result;}function curryRight(func, arity, guard){if(guard && isIterateeCall(func, arity, guard)){arity = null;}var result=createWrapper(func, CURRY_RIGHT_FLAG, null, null, null, null, null, arity);result.placeholder = curryRight.placeholder;return result;}function debounce(func, wait, options){var args, maxTimeoutId, result, stamp, thisArg, timeoutId, trailingCall, lastCalled=0, maxWait=false, trailing=true;if(typeof func != "function"){throw new TypeError(FUNC_ERROR_TEXT);}wait = wait < 0?0:+wait || 0;if(options === true){var leading=true;trailing = false;}else if(isObject(options)){leading = options.leading;maxWait = "maxWait" in options && nativeMax(+options.maxWait || 0, wait);trailing = "trailing" in options?options.trailing:trailing;}function cancel(){if(timeoutId){clearTimeout(timeoutId);}if(maxTimeoutId){clearTimeout(maxTimeoutId);}maxTimeoutId = timeoutId = trailingCall = undefined;}function delayed(){var remaining=wait - (now() - stamp);if(remaining <= 0 || remaining > wait){if(maxTimeoutId){clearTimeout(maxTimeoutId);}var isCalled=trailingCall;maxTimeoutId = timeoutId = trailingCall = undefined;if(isCalled){lastCalled = now();result = func.apply(thisArg, args);if(!timeoutId && !maxTimeoutId){args = thisArg = null;}}}else {timeoutId = setTimeout(delayed, remaining);}}function maxDelayed(){if(timeoutId){clearTimeout(timeoutId);}maxTimeoutId = timeoutId = trailingCall = undefined;if(trailing || maxWait !== wait){lastCalled = now();result = func.apply(thisArg, args);if(!timeoutId && !maxTimeoutId){args = thisArg = null;}}}function debounced(){args = arguments;stamp = now();thisArg = this;trailingCall = trailing && (timeoutId || !leading);if(maxWait === false){var leadingCall=leading && !timeoutId;}else {if(!maxTimeoutId && !leading){lastCalled = stamp;}var remaining=maxWait - (stamp - lastCalled), isCalled=remaining <= 0 || remaining > maxWait;if(isCalled){if(maxTimeoutId){maxTimeoutId = clearTimeout(maxTimeoutId);}lastCalled = stamp;result = func.apply(thisArg, args);}else if(!maxTimeoutId){maxTimeoutId = setTimeout(maxDelayed, remaining);}}if(isCalled && timeoutId){timeoutId = clearTimeout(timeoutId);}else if(!timeoutId && wait !== maxWait){timeoutId = setTimeout(delayed, wait);}if(leadingCall){isCalled = true;result = func.apply(thisArg, args);}if(isCalled && !timeoutId && !maxTimeoutId){args = thisArg = null;}return result;}debounced.cancel = cancel;return debounced;}function defer(func){return baseDelay(func, 1, arguments, 1);}function delay(func, wait){return baseDelay(func, wait, arguments, 2);}function flow(){var funcs=arguments, length=funcs.length;if(!length){return function(){return arguments[0];};}if(!arrayEvery(funcs, baseIsFunction)){throw new TypeError(FUNC_ERROR_TEXT);}return function(){var index=0, result=funcs[index].apply(this, arguments);while(++index < length) {result = funcs[index].call(this, result);}return result;};}function flowRight(){var funcs=arguments, fromIndex=funcs.length - 1;if(fromIndex < 0){return function(){return arguments[0];};}if(!arrayEvery(funcs, baseIsFunction)){throw new TypeError(FUNC_ERROR_TEXT);}return function(){var index=fromIndex, result=funcs[index].apply(this, arguments);while(index--) {result = funcs[index].call(this, result);}return result;};}function memoize(func, resolver){if(typeof func != "function" || resolver && typeof resolver != "function"){throw new TypeError(FUNC_ERROR_TEXT);}var memoized=(function(_memoized){var _memoizedWrapper=function memoized(){return _memoized.apply(this, arguments);};_memoizedWrapper.toString = function(){return _memoized.toString();};return _memoizedWrapper;})(function(){var cache=memoized.cache, key=resolver?resolver.apply(this, arguments):arguments[0];if(cache.has(key)){return cache.get(key);}var result=func.apply(this, arguments);cache.set(key, result);return result;});memoized.cache = new memoize.Cache();return memoized;}function negate(predicate){if(typeof predicate != "function"){throw new TypeError(FUNC_ERROR_TEXT);}return function(){return !predicate.apply(this, arguments);};}function once(func){return before(func, 2);}function partial(func){var partials=baseSlice(arguments, 1), holders=replaceHolders(partials, partial.placeholder);return createWrapper(func, PARTIAL_FLAG, null, partials, holders);}function partialRight(func){var partials=baseSlice(arguments, 1), holders=replaceHolders(partials, partialRight.placeholder);return createWrapper(func, PARTIAL_RIGHT_FLAG, null, partials, holders);}function rearg(func){var indexes=baseFlatten(arguments, false, false, 1);return createWrapper(func, REARG_FLAG, null, null, null, indexes);}function spread(func){if(typeof func != "function"){throw new TypeError(FUNC_ERROR_TEXT);}return function(array){return func.apply(this, array);};}function throttle(func, wait, options){var leading=true, trailing=true;if(typeof func != "function"){throw new TypeError(FUNC_ERROR_TEXT);}if(options === false){leading = false;}else if(isObject(options)){leading = "leading" in options?!!options.leading:leading;trailing = "trailing" in options?!!options.trailing:trailing;}debounceOptions.leading = leading;debounceOptions.maxWait = +wait;debounceOptions.trailing = trailing;return debounce(func, wait, debounceOptions);}function wrap(value, wrapper){wrapper = wrapper == null?identity:wrapper;return createWrapper(wrapper, PARTIAL_FLAG, null, [value], []);}function clone(value, isDeep, customizer, thisArg){if(isDeep && typeof isDeep != "boolean" && isIterateeCall(value, isDeep, customizer)){isDeep = false;}else if(typeof isDeep == "function"){thisArg = customizer;customizer = isDeep;isDeep = false;}customizer = typeof customizer == "function" && bindCallback(customizer, thisArg, 1);return baseClone(value, isDeep, customizer);}function cloneDeep(value, customizer, thisArg){customizer = typeof customizer == "function" && bindCallback(customizer, thisArg, 1);return baseClone(value, true, customizer);}function isArguments(value){var length=isObjectLike(value)?value.length:undefined;return isLength(length) && objToString.call(value) == argsTag || false;}var isArray=nativeIsArray || function(value){return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag || false;};function isBoolean(value){return value === true || value === false || isObjectLike(value) && objToString.call(value) == boolTag || false;}function isDate(value){return isObjectLike(value) && objToString.call(value) == dateTag || false;}function isElement(value){return value && value.nodeType === 1 && isObjectLike(value) && objToString.call(value).indexOf("Element") > -1 || false;}if(!support.dom){isElement = function(value){return value && value.nodeType === 1 && isObjectLike(value) && !isPlainObject(value) || false;};}function isEmpty(value){if(value == null){return true;}var length=value.length;if(isLength(length) && (isArray(value) || isString(value) || isArguments(value) || isObjectLike(value) && isFunction(value.splice))){return !length;}return !keys(value).length;}function isEqual(value, other, customizer, thisArg){customizer = typeof customizer == "function" && bindCallback(customizer, thisArg, 3);if(!customizer && isStrictComparable(value) && isStrictComparable(other)){return value === other;}var result=customizer?customizer(value, other):undefined;return typeof result == "undefined"?baseIsEqual(value, other, customizer):!!result;}function isError(value){return isObjectLike(value) && typeof value.message == "string" && objToString.call(value) == errorTag || false;}var isFinite=nativeNumIsFinite || function(value){return typeof value == "number" && nativeIsFinite(value);};var isFunction=!(baseIsFunction(/x/) || Uint8Array && !baseIsFunction(Uint8Array))?baseIsFunction:function(value){return objToString.call(value) == funcTag;};function isObject(value){var type=typeof value;return type == "function" || value && type == "object" || false;}function isMatch(object, source, customizer, thisArg){var props=keys(source), length=props.length;customizer = typeof customizer == "function" && bindCallback(customizer, thisArg, 3);if(!customizer && length == 1){var key=props[0], value=source[key];if(isStrictComparable(value)){return object != null && value === object[key] && hasOwnProperty.call(object, key);}}var values=Array(length), strictCompareFlags=Array(length);while(length--) {value = values[length] = source[props[length]];strictCompareFlags[length] = isStrictComparable(value);}return baseIsMatch(object, props, values, strictCompareFlags, customizer);}function isNaN(value){return isNumber(value) && value != +value;}function isNative(value){if(value == null){return false;}if(objToString.call(value) == funcTag){return reNative.test(fnToString.call(value));}return isObjectLike(value) && reHostCtor.test(value) || false;}function isNull(value){return value === null;}function isNumber(value){return typeof value == "number" || isObjectLike(value) && objToString.call(value) == numberTag || false;}var isPlainObject=!getPrototypeOf?shimIsPlainObject:function(value){if(!(value && objToString.call(value) == objectTag)){return false;}var valueOf=value.valueOf, objProto=isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);return objProto?value == objProto || getPrototypeOf(value) == objProto:shimIsPlainObject(value);};function isRegExp(value){return isObjectLike(value) && objToString.call(value) == regexpTag || false;}function isString(value){return typeof value == "string" || isObjectLike(value) && objToString.call(value) == stringTag || false;}function isTypedArray(value){return isObjectLike(value) && isLength(value.length) && typedArrayTags[objToString.call(value)] || false;}function isUndefined(value){return typeof value == "undefined";}function toArray(value){var length=value?value.length:0;if(!isLength(length)){return values(value);}if(!length){return [];}return arrayCopy(value);}function toPlainObject(value){return baseCopy(value, keysIn(value));}var assign=createAssigner(baseAssign);function create(prototype, properties, guard){var result=baseCreate(prototype);if(guard && isIterateeCall(prototype, properties, guard)){properties = null;}return properties?baseCopy(properties, result, keys(properties)):result;}function defaults(object){if(object == null){return object;}var args=arrayCopy(arguments);args.push(assignDefaults);return assign.apply(undefined, args);}function findKey(object, predicate, thisArg){predicate = getCallback(predicate, thisArg, 3);return baseFind(object, predicate, baseForOwn, true);}function findLastKey(object, predicate, thisArg){predicate = getCallback(predicate, thisArg, 3);return baseFind(object, predicate, baseForOwnRight, true);}function forIn(object, iteratee, thisArg){if(typeof iteratee != "function" || typeof thisArg != "undefined"){iteratee = bindCallback(iteratee, thisArg, 3);}return baseFor(object, iteratee, keysIn);}function forInRight(object, iteratee, thisArg){iteratee = bindCallback(iteratee, thisArg, 3);return baseForRight(object, iteratee, keysIn);}function forOwn(object, iteratee, thisArg){if(typeof iteratee != "function" || typeof thisArg != "undefined"){iteratee = bindCallback(iteratee, thisArg, 3);}return baseForOwn(object, iteratee);}function forOwnRight(object, iteratee, thisArg){iteratee = bindCallback(iteratee, thisArg, 3);return baseForRight(object, iteratee, keys);}function functions(object){return baseFunctions(object, keysIn(object));}function has(object, key){return object?hasOwnProperty.call(object, key):false;}function invert(object, multiValue, guard){if(guard && isIterateeCall(object, multiValue, guard)){multiValue = null;}var index=-1, props=keys(object), length=props.length, result={};while(++index < length) {var key=props[index], value=object[key];if(multiValue){if(hasOwnProperty.call(result, value)){result[value].push(key);}else {result[value] = [key];}}else {result[value] = key;}}return result;}var keys=!nativeKeys?shimKeys:function(object){if(object){var Ctor=object.constructor, length=object.length;}if(typeof Ctor == "function" && Ctor.prototype === object || typeof object != "function" && (length && isLength(length))){return shimKeys(object);}return isObject(object)?nativeKeys(object):[];};function keysIn(object){if(object == null){return [];}if(!isObject(object)){object = Object(object);}var length=object.length;length = length && isLength(length) && (isArray(object) || support.nonEnumArgs && isArguments(object)) && length || 0;var Ctor=object.constructor, index=-1, isProto=typeof Ctor == "function" && Ctor.prototype === object, result=Array(length), skipIndexes=length > 0;while(++index < length) {result[index] = index + "";}for(var key in object) {if(!(skipIndexes && isIndex(key, length)) && !(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))){result.push(key);}}return result;}function mapValues(object, iteratee, thisArg){var result={};iteratee = getCallback(iteratee, thisArg, 3);baseForOwn(object, function(value, key, object){result[key] = iteratee(value, key, object);});return result;}var merge=createAssigner(baseMerge);function omit(object, predicate, thisArg){if(object == null){return {};}if(typeof predicate != "function"){var props=arrayMap(baseFlatten(arguments, false, false, 1), String);return pickByArray(object, baseDifference(keysIn(object), props));}predicate = bindCallback(predicate, thisArg, 3);return pickByCallback(object, function(value, key, object){return !predicate(value, key, object);});}function pairs(object){var index=-1, props=keys(object), length=props.length, result=Array(length);while(++index < length) {var key=props[index];result[index] = [key, object[key]];}return result;}function pick(object, predicate, thisArg){if(object == null){return {};}return typeof predicate == "function"?pickByCallback(object, bindCallback(predicate, thisArg, 3)):pickByArray(object, baseFlatten(arguments, false, false, 1));}function result(object, key, defaultValue){var value=object == null?undefined:object[key];if(typeof value == "undefined"){value = defaultValue;}return isFunction(value)?value.call(object):value;}function transform(object, iteratee, accumulator, thisArg){var isArr=isArray(object) || isTypedArray(object);iteratee = getCallback(iteratee, thisArg, 4);if(accumulator == null){if(isArr || isObject(object)){var Ctor=object.constructor;if(isArr){accumulator = isArray(object)?new Ctor():[];}else {accumulator = baseCreate(isFunction(Ctor) && Ctor.prototype);}}else {accumulator = {};}}(isArr?arrayEach:baseForOwn)(object, function(value, index, object){return iteratee(accumulator, value, index, object);});return accumulator;}function values(object){return baseValues(object, keys(object));}function valuesIn(object){return baseValues(object, keysIn(object));}function inRange(value, start, end){start = +start || 0;if(typeof end === "undefined"){end = start;start = 0;}else {end = +end || 0;}return value >= start && value < end;}function random(min, max, floating){if(floating && isIterateeCall(min, max, floating)){max = floating = null;}var noMin=min == null, noMax=max == null;if(floating == null){if(noMax && typeof min == "boolean"){floating = min;min = 1;}else if(typeof max == "boolean"){floating = max;noMax = true;}}if(noMin && noMax){max = 1;noMax = false;}min = +min || 0;if(noMax){max = min;min = 0;}else {max = +max || 0;}if(floating || min % 1 || max % 1){var rand=nativeRandom();return nativeMin(min + rand * (max - min + parseFloat("1e-" + ((rand + "").length - 1))), max);}return baseRandom(min, max);}var camelCase=createCompounder(function(result, word, index){word = word.toLowerCase();return result + (index?word.charAt(0).toUpperCase() + word.slice(1):word);});function capitalize(string){string = baseToString(string);return string && string.charAt(0).toUpperCase() + string.slice(1);}function deburr(string){string = baseToString(string);return string && string.replace(reLatin1, deburrLetter);}function endsWith(string, target, position){string = baseToString(string);target = target + "";var length=string.length;position = (typeof position == "undefined"?length:nativeMin(position < 0?0:+position || 0, length)) - target.length;return position >= 0 && string.indexOf(target, position) == position;}function escape(string){string = baseToString(string);return string && reHasUnescapedHtml.test(string)?string.replace(reUnescapedHtml, escapeHtmlChar):string;}function escapeRegExp(string){string = baseToString(string);return string && reHasRegExpChars.test(string)?string.replace(reRegExpChars, "\\$&"):string;}var kebabCase=createCompounder(function(result, word, index){return result + (index?"-":"") + word.toLowerCase();});function pad(string, length, chars){string = baseToString(string);length = +length;var strLength=string.length;if(strLength >= length || !nativeIsFinite(length)){return string;}var mid=(length - strLength) / 2, leftLength=floor(mid), rightLength=ceil(mid);chars = createPad("", rightLength, chars);return chars.slice(0, leftLength) + string + chars;}function padLeft(string, length, chars){string = baseToString(string);return string && createPad(string, length, chars) + string;}function padRight(string, length, chars){string = baseToString(string);return string && string + createPad(string, length, chars);}function parseInt(string, radix, guard){if(guard && isIterateeCall(string, radix, guard)){radix = 0;}return nativeParseInt(string, radix);}if(nativeParseInt(whitespace + "08") != 8){parseInt = function(string, radix, guard){if(guard?isIterateeCall(string, radix, guard):radix == null){radix = 0;}else if(radix){radix = +radix;}string = trim(string);return nativeParseInt(string, radix || (reHexPrefix.test(string)?16:10));};}function repeat(string, n){var result="";string = baseToString(string);n = +n;if(n < 1 || !string || !nativeIsFinite(n)){return result;}do{if(n % 2){result += string;}n = floor(n / 2);string += string;}while(n);return result;}var snakeCase=createCompounder(function(result, word, index){return result + (index?"_":"") + word.toLowerCase();});var startCase=createCompounder(function(result, word, index){return result + (index?" ":"") + (word.charAt(0).toUpperCase() + word.slice(1));});function startsWith(string, target, position){string = baseToString(string);position = position == null?0:nativeMin(position < 0?0:+position || 0, string.length);return string.lastIndexOf(target, position) == position;}function template(string, options, otherOptions){var settings=lodash.templateSettings;if(otherOptions && isIterateeCall(string, options, otherOptions)){options = otherOptions = null;}string = baseToString(string);options = baseAssign(baseAssign({}, otherOptions || options), settings, assignOwnDefaults);var imports=baseAssign(baseAssign({}, options.imports), settings.imports, assignOwnDefaults), importsKeys=keys(imports), importsValues=baseValues(imports, importsKeys);var isEscaping, isEvaluating, index=0, interpolate=options.interpolate || reNoMatch, source="__p += '";var reDelimiters=RegExp((options.escape || reNoMatch).source + "|" + interpolate.source + "|" + (interpolate === reInterpolate?reEsTemplate:reNoMatch).source + "|" + (options.evaluate || reNoMatch).source + "|$", "g");var sourceURL="//# sourceURL=" + ("sourceURL" in options?options.sourceURL:"lodash.templateSources[" + ++templateCounter + "]") + "\n";string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset){interpolateValue || (interpolateValue = esTemplateValue);source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);if(escapeValue){isEscaping = true;source += "' +\n__e(" + escapeValue + ") +\n'";}if(evaluateValue){isEvaluating = true;source += "';\n" + evaluateValue + ";\n__p += '";}if(interpolateValue){source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";}index = offset + match.length;return match;});source += "';\n";var variable=options.variable;if(!variable){source = "with (obj) {\n" + source + "\n}\n";}source = (isEvaluating?source.replace(reEmptyStringLeading, ""):source).replace(reEmptyStringMiddle, "$1").replace(reEmptyStringTrailing, "$1;");source = "function(" + (variable || "obj") + ") {\n" + (variable?"":"obj || (obj = {});\n") + "var __t, __p = ''" + (isEscaping?", __e = _.escape":"") + (isEvaluating?", __j = Array.prototype.join;\n" + "function print() { __p += __j.call(arguments, '') }\n":";\n") + source + "return __p\n}";var result=attempt(function(){return Function(importsKeys, sourceURL + "return " + source).apply(undefined, importsValues);});result.source = source;if(isError(result)){throw result;}return result;}function trim(string, chars, guard){var value=string;string = baseToString(string);if(!string){return string;}if(guard?isIterateeCall(value, chars, guard):chars == null){return string.slice(trimmedLeftIndex(string), trimmedRightIndex(string) + 1);}chars = chars + "";return string.slice(charsLeftIndex(string, chars), charsRightIndex(string, chars) + 1);}function trimLeft(string, chars, guard){var value=string;string = baseToString(string);if(!string){return string;}if(guard?isIterateeCall(value, chars, guard):chars == null){return string.slice(trimmedLeftIndex(string));}return string.slice(charsLeftIndex(string, chars + ""));}function trimRight(string, chars, guard){var value=string;string = baseToString(string);if(!string){return string;}if(guard?isIterateeCall(value, chars, guard):chars == null){return string.slice(0, trimmedRightIndex(string) + 1);}return string.slice(0, charsRightIndex(string, chars + "") + 1);}function trunc(string, options, guard){if(guard && isIterateeCall(string, options, guard)){options = null;}var length=DEFAULT_TRUNC_LENGTH, omission=DEFAULT_TRUNC_OMISSION;if(options != null){if(isObject(options)){var separator="separator" in options?options.separator:separator;length = "length" in options?+options.length || 0:length;omission = "omission" in options?baseToString(options.omission):omission;}else {length = +options || 0;}}string = baseToString(string);if(length >= string.length){return string;}var end=length - omission.length;if(end < 1){return omission;}var result=string.slice(0, end);if(separator == null){return result + omission;}if(isRegExp(separator)){if(string.slice(end).search(separator)){var match, newEnd, substring=string.slice(0, end);if(!separator.global){separator = RegExp(separator.source, (reFlags.exec(separator) || "") + "g");}separator.lastIndex = 0;while(match = separator.exec(substring)) {newEnd = match.index;}result = result.slice(0, newEnd == null?end:newEnd);}}else if(string.indexOf(separator, end) != end){var index=result.lastIndexOf(separator);if(index > -1){result = result.slice(0, index);}}return result + omission;}function unescape(string){string = baseToString(string);return string && reHasEscapedHtml.test(string)?string.replace(reEscapedHtml, unescapeHtmlChar):string;}function words(string, pattern, guard){if(guard && isIterateeCall(string, pattern, guard)){pattern = null;}string = baseToString(string);return string.match(pattern || reWords) || [];}function attempt(){var length=arguments.length, func=arguments[0];try{var args=Array(length?length - 1:0);while(--length > 0) {args[length - 1] = arguments[length];}return func.apply(undefined, args);}catch(e) {return isError(e)?e:new Error(e);}}function callback(func, thisArg, guard){if(guard && isIterateeCall(func, thisArg, guard)){thisArg = null;}return isObjectLike(func)?matches(func):baseCallback(func, thisArg);}function constant(value){return function(){return value;};}function identity(value){return value;}function matches(source){return baseMatches(baseClone(source, true));}function matchesProperty(key, value){return baseMatchesProperty(key + "", baseClone(value, true));}function mixin(object, source, options){if(options == null){var isObj=isObject(source), props=isObj && keys(source), methodNames=props && props.length && baseFunctions(source, props);if(!(methodNames?methodNames.length:isObj)){methodNames = false;options = source;source = object;object = this;}}if(!methodNames){methodNames = baseFunctions(source, keys(source));}var chain=true, index=-1, isFunc=isFunction(object), length=methodNames.length;if(options === false){chain = false;}else if(isObject(options) && "chain" in options){chain = options.chain;}while(++index < length) {var methodName=methodNames[index], func=source[methodName];object[methodName] = func;if(isFunc){object.prototype[methodName] = (function(func){return function(){var chainAll=this.__chain__;if(chain || chainAll){var result=object(this.__wrapped__);(result.__actions__ = arrayCopy(this.__actions__)).push({func:func, args:arguments, thisArg:object});result.__chain__ = chainAll;return result;}var args=[this.value()];push.apply(args, arguments);return func.apply(object, args);};})(func);}}return object;}function noConflict(){context._ = oldDash;return this;}function noop(){}function property(key){return baseProperty(key + "");}function propertyOf(object){return function(key){return object == null?undefined:object[key];};}function range(start, end, step){if(step && isIterateeCall(start, end, step)){end = step = null;}start = +start || 0;step = step == null?1:+step || 0;if(end == null){end = start;start = 0;}else {end = +end || 0;}var index=-1, length=nativeMax(ceil((end - start) / (step || 1)), 0), result=Array(length);while(++index < length) {result[index] = start;start += step;}return result;}function times(n, iteratee, thisArg){n = +n;if(n < 1 || !nativeIsFinite(n)){return [];}var index=-1, result=Array(nativeMin(n, MAX_ARRAY_LENGTH));iteratee = bindCallback(iteratee, thisArg, 1);while(++index < n) {if(index < MAX_ARRAY_LENGTH){result[index] = iteratee(index);}else {iteratee(index);}}return result;}function uniqueId(prefix){var id=++idCounter;return baseToString(prefix) + id;}lodash.prototype = baseLodash.prototype;LodashWrapper.prototype = baseCreate(baseLodash.prototype);LodashWrapper.prototype.constructor = LodashWrapper;LazyWrapper.prototype = baseCreate(baseLodash.prototype);LazyWrapper.prototype.constructor = LazyWrapper;MapCache.prototype["delete"] = mapDelete;MapCache.prototype.get = mapGet;MapCache.prototype.has = mapHas;MapCache.prototype.set = mapSet;SetCache.prototype.push = cachePush;memoize.Cache = MapCache;lodash.after = after;lodash.ary = ary;lodash.assign = assign;lodash.at = at;lodash.before = before;lodash.bind = bind;lodash.bindAll = bindAll;lodash.bindKey = bindKey;lodash.callback = callback;lodash.chain = chain;lodash.chunk = chunk;lodash.compact = compact;lodash.constant = constant;lodash.countBy = countBy;lodash.create = create;lodash.curry = curry;lodash.curryRight = curryRight;lodash.debounce = debounce;lodash.defaults = defaults;lodash.defer = defer;lodash.delay = delay;lodash.difference = difference;lodash.drop = drop;lodash.dropRight = dropRight;lodash.dropRightWhile = dropRightWhile;lodash.dropWhile = dropWhile;lodash.fill = fill;lodash.filter = filter;lodash.flatten = flatten;lodash.flattenDeep = flattenDeep;lodash.flow = flow;lodash.flowRight = flowRight;lodash.forEach = forEach;lodash.forEachRight = forEachRight;lodash.forIn = forIn;lodash.forInRight = forInRight;lodash.forOwn = forOwn;lodash.forOwnRight = forOwnRight;lodash.functions = functions;lodash.groupBy = groupBy;lodash.indexBy = indexBy;lodash.initial = initial;lodash.intersection = intersection;lodash.invert = invert;lodash.invoke = invoke;lodash.keys = keys;lodash.keysIn = keysIn;lodash.map = map;lodash.mapValues = mapValues;lodash.matches = matches;lodash.matchesProperty = matchesProperty;lodash.memoize = memoize;lodash.merge = merge;lodash.mixin = mixin;lodash.negate = negate;lodash.omit = omit;lodash.once = once;lodash.pairs = pairs;lodash.partial = partial;lodash.partialRight = partialRight;lodash.partition = partition;lodash.pick = pick;lodash.pluck = pluck;lodash.property = property;lodash.propertyOf = propertyOf;lodash.pull = pull;lodash.pullAt = pullAt;lodash.range = range;lodash.rearg = rearg;lodash.reject = reject;lodash.remove = remove;lodash.rest = rest;lodash.shuffle = shuffle;lodash.slice = slice;lodash.sortBy = sortBy;lodash.sortByAll = sortByAll;lodash.spread = spread;lodash.take = take;lodash.takeRight = takeRight;lodash.takeRightWhile = takeRightWhile;lodash.takeWhile = takeWhile;lodash.tap = tap;lodash.throttle = throttle;lodash.thru = thru;lodash.times = times;lodash.toArray = toArray;lodash.toPlainObject = toPlainObject;lodash.transform = transform;lodash.union = union;lodash.uniq = uniq;lodash.unzip = unzip;lodash.values = values;lodash.valuesIn = valuesIn;lodash.where = where;lodash.without = without;lodash.wrap = wrap;lodash.xor = xor;lodash.zip = zip;lodash.zipObject = zipObject;lodash.backflow = flowRight;lodash.collect = map;lodash.compose = flowRight;lodash.each = forEach;lodash.eachRight = forEachRight;lodash.extend = assign;lodash.iteratee = callback;lodash.methods = functions;lodash.object = zipObject;lodash.select = filter;lodash.tail = rest;lodash.unique = uniq;mixin(lodash, lodash);lodash.attempt = attempt;lodash.camelCase = camelCase;lodash.capitalize = capitalize;lodash.clone = clone;lodash.cloneDeep = cloneDeep;lodash.deburr = deburr;lodash.endsWith = endsWith;lodash.escape = escape;lodash.escapeRegExp = escapeRegExp;lodash.every = every;lodash.find = find;lodash.findIndex = findIndex;lodash.findKey = findKey;lodash.findLast = findLast;lodash.findLastIndex = findLastIndex;lodash.findLastKey = findLastKey;lodash.findWhere = findWhere;lodash.first = first;lodash.has = has;lodash.identity = identity;lodash.includes = includes;lodash.indexOf = indexOf;lodash.inRange = inRange;lodash.isArguments = isArguments;lodash.isArray = isArray;lodash.isBoolean = isBoolean;lodash.isDate = isDate;lodash.isElement = isElement;lodash.isEmpty = isEmpty;lodash.isEqual = isEqual;lodash.isError = isError;lodash.isFinite = isFinite;lodash.isFunction = isFunction;lodash.isMatch = isMatch;lodash.isNaN = isNaN;lodash.isNative = isNative;lodash.isNull = isNull;lodash.isNumber = isNumber;lodash.isObject = isObject;lodash.isPlainObject = isPlainObject;lodash.isRegExp = isRegExp;lodash.isString = isString;lodash.isTypedArray = isTypedArray;lodash.isUndefined = isUndefined;lodash.kebabCase = kebabCase;lodash.last = last;lodash.lastIndexOf = lastIndexOf;lodash.max = max;lodash.min = min;lodash.noConflict = noConflict;lodash.noop = noop;lodash.now = now;lodash.pad = pad;lodash.padLeft = padLeft;lodash.padRight = padRight;lodash.parseInt = parseInt;lodash.random = random;lodash.reduce = reduce;lodash.reduceRight = reduceRight;lodash.repeat = repeat;lodash.result = result;lodash.runInContext = runInContext;lodash.size = size;lodash.snakeCase = snakeCase;lodash.some = some;lodash.sortedIndex = sortedIndex;lodash.sortedLastIndex = sortedLastIndex;lodash.startCase = startCase;lodash.startsWith = startsWith;lodash.template = template;lodash.trim = trim;lodash.trimLeft = trimLeft;lodash.trimRight = trimRight;lodash.trunc = trunc;lodash.unescape = unescape;lodash.uniqueId = uniqueId;lodash.words = words;lodash.all = every;lodash.any = some;lodash.contains = includes;lodash.detect = find;lodash.foldl = reduce;lodash.foldr = reduceRight;lodash.head = first;lodash.include = includes;lodash.inject = reduce;mixin(lodash, (function(){var source={};baseForOwn(lodash, function(func, methodName){if(!lodash.prototype[methodName]){source[methodName] = func;}});return source;})(), false);lodash.sample = sample;lodash.prototype.sample = function(n){if(!this.__chain__ && n == null){return sample(this.value());}return this.thru(function(value){return sample(value, n);});};lodash.VERSION = VERSION;arrayEach(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(methodName){lodash[methodName].placeholder = lodash;});arrayEach(["filter", "map", "takeWhile"], function(methodName, index){var isFilter=index == LAZY_FILTER_FLAG || index == LAZY_WHILE_FLAG;LazyWrapper.prototype[methodName] = function(iteratee, thisArg){var result=this.clone(), iteratees=result.__iteratees__ || (result.__iteratees__ = []);result.__filtered__ = result.__filtered__ || isFilter;iteratees.push({iteratee:getCallback(iteratee, thisArg, 3), type:index});return result;};});arrayEach(["drop", "take"], function(methodName, index){var countName="__" + methodName + "Count__", whileName=methodName + "While";LazyWrapper.prototype[methodName] = function(n){n = n == null?1:nativeMax(floor(n) || 0, 0);var result=this.clone();if(result.__filtered__){var value=result[countName];result[countName] = index?nativeMin(value, n):value + n;}else {var views=result.__views__ || (result.__views__ = []);views.push({size:n, type:methodName + (result.__dir__ < 0?"Right":"")});}return result;};LazyWrapper.prototype[methodName + "Right"] = function(n){return this.reverse()[methodName](n).reverse();};LazyWrapper.prototype[methodName + "RightWhile"] = function(predicate, thisArg){return this.reverse()[whileName](predicate, thisArg).reverse();};});arrayEach(["first", "last"], function(methodName, index){var takeName="take" + (index?"Right":"");LazyWrapper.prototype[methodName] = function(){return this[takeName](1).value()[0];};});arrayEach(["initial", "rest"], function(methodName, index){var dropName="drop" + (index?"":"Right");LazyWrapper.prototype[methodName] = function(){return this[dropName](1);};});arrayEach(["pluck", "where"], function(methodName, index){var operationName=index?"filter":"map", createCallback=index?baseMatches:baseProperty;LazyWrapper.prototype[methodName] = function(value){return this[operationName](createCallback(value));};});LazyWrapper.prototype.compact = function(){return this.filter(identity);};LazyWrapper.prototype.dropWhile = function(predicate, thisArg){var done, lastIndex, isRight=this.__dir__ < 0;predicate = getCallback(predicate, thisArg, 3);return this.filter(function(value, index, array){done = done && (isRight?index < lastIndex:index > lastIndex);lastIndex = index;return done || (done = !predicate(value, index, array));});};LazyWrapper.prototype.reject = function(predicate, thisArg){predicate = getCallback(predicate, thisArg, 3);return this.filter(function(value, index, array){return !predicate(value, index, array);});};LazyWrapper.prototype.slice = function(start, end){start = start == null?0:+start || 0;var result=start < 0?this.takeRight(-start):this.drop(start);if(typeof end != "undefined"){end = +end || 0;result = end < 0?result.dropRight(-end):result.take(end - start);}return result;};LazyWrapper.prototype.toArray = function(){return this.drop(0);};baseForOwn(LazyWrapper.prototype, function(func, methodName){var lodashFunc=lodash[methodName], retUnwrapped=/^(?:first|last)$/.test(methodName);lodash.prototype[methodName] = function(){var value=this.__wrapped__, args=arguments, chainAll=this.__chain__, isHybrid=!!this.__actions__.length, isLazy=value instanceof LazyWrapper, onlyLazy=isLazy && !isHybrid;if(retUnwrapped && !chainAll){return onlyLazy?func.call(value):lodashFunc.call(lodash, this.value());}var interceptor=function interceptor(value){var otherArgs=[value];push.apply(otherArgs, args);return lodashFunc.apply(lodash, otherArgs);};if(isLazy || isArray(value)){var wrapper=onlyLazy?value:new LazyWrapper(this), result=func.apply(wrapper, args);if(!retUnwrapped && (isHybrid || result.__actions__)){var actions=result.__actions__ || (result.__actions__ = []);actions.push({func:thru, args:[interceptor], thisArg:lodash});}return new LodashWrapper(result, chainAll);}return this.thru(interceptor);};});arrayEach(["concat", "join", "pop", "push", "shift", "sort", "splice", "unshift"], function(methodName){var func=arrayProto[methodName], chainName=/^(?:push|sort|unshift)$/.test(methodName)?"tap":"thru", retUnwrapped=/^(?:join|pop|shift)$/.test(methodName);lodash.prototype[methodName] = function(){var args=arguments;if(retUnwrapped && !this.__chain__){return func.apply(this.value(), args);}return this[chainName](function(value){return func.apply(value, args);});};});LazyWrapper.prototype.clone = lazyClone;LazyWrapper.prototype.reverse = lazyReverse;LazyWrapper.prototype.value = lazyValue;lodash.prototype.chain = wrapperChain;lodash.prototype.commit = wrapperCommit;lodash.prototype.plant = wrapperPlant;lodash.prototype.reverse = wrapperReverse;lodash.prototype.toString = wrapperToString;lodash.prototype.run = lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;lodash.prototype.collect = lodash.prototype.map;lodash.prototype.head = lodash.prototype.first;lodash.prototype.select = lodash.prototype.filter;lodash.prototype.tail = lodash.prototype.rest;return lodash;}var _=runInContext();if(true){root._ = _;!(__WEBPACK_AMD_DEFINE_RESULT__ = function(){return _;}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));}else if(freeExports && freeModule){if(moduleExports){(freeModule.exports = _)._ = _;}else {freeExports._ = _;}}else {root._ = _;}}).call(undefined);
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(25)(module), (function() { return this; }())))

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var Rx = __webpack_require__(16);
	var errors = __webpack_require__(17);
	var InputProxy = __webpack_require__(18);
	var Utils = __webpack_require__(19);
	var CycleInterfaceError = errors.CycleInterfaceError;
	
	function replicate(source, subject) {
	  if (typeof source === "undefined") {
	    throw new Error("Cannot replicate() if source is undefined.");
	  }
	  return source.subscribe(function replicationOnNext(x) {
	    subject.onNext(x);
	  }, function replicationOnError(err) {
	    subject.onError(err);
	    console.error(err);
	  });
	}
	
	function checkOutputObject(output) {
	  if (typeof output !== "object") {
	    throw new Error("A DataFlowNode should always return an object.");
	  }
	}
	
	function createStreamNamesArray(output) {
	  var array = [];
	  for (var streamName in output) {
	    if (output.hasOwnProperty(streamName)) {
	      if (Utils.endsWithDollarSign(streamName)) {
	        array.push(streamName);
	      }
	    }
	  }
	  return array;
	}
	
	var replicateAll;
	
	function DataFlowNode(definitionFn) {
	  if (arguments.length !== 1 || typeof definitionFn !== "function") {
	    throw new Error("DataFlowNode expects the definitionFn as the only argument.");
	  }
	  var proxies = [];
	  for (var i = 0; i < definitionFn.length; i++) {
	    proxies[i] = new InputProxy();
	  }
	  var wasInjected = false;
	  var output = definitionFn.apply(this, proxies);
	  checkOutputObject(output);
	  this.outputStreams = createStreamNamesArray(output);
	  this.get = function get(streamName) {
	    return output[streamName] || null;
	  };
	  this.clone = function clone() {
	    return new DataFlowNode(definitionFn);
	  };
	  this.inject = function inject() {
	    if (wasInjected) {
	      console.warn("DataFlowNode has already been injected an input.");
	    }
	    if (definitionFn.length !== arguments.length) {
	      console.warn("The call to inject() should provide the inputs that this " + "DataFlowNode expects according to its definition function.");
	    }
	    for (var i = 0; i < definitionFn.length; i++) {
	      replicateAll(arguments[i], proxies[i]);
	    }
	    wasInjected = true;
	    if (arguments.length === 1) {
	      return arguments[0];
	    } else if (arguments.length > 1) {
	      return Array.prototype.slice.call(arguments);
	    } else {
	      return null;
	    }
	  };
	  return this;
	}
	
	function replicateAllEvent$(input, selector, proxyObj) {
	  for (var eventName in proxyObj) {
	    if (proxyObj.hasOwnProperty(eventName)) {
	      if (eventName !== "_hasEvent$") {
	        var event$ = input.event$(selector, eventName);
	        if (event$ !== null) {
	          replicate(event$, proxyObj[eventName]);
	        }
	      }
	    }
	  }
	}
	
	replicateAll = function replicateAll(input, proxy) {
	  if (!input || !proxy) {
	    return;
	  }
	
	  for (var key in proxy.proxiedProps) {
	    if (proxy.proxiedProps.hasOwnProperty(key)) {
	      var proxiedProperty = proxy.proxiedProps[key];
	      if (typeof input.event$ === "function" && proxiedProperty._hasEvent$) {
	        replicateAllEvent$(input, key, proxiedProperty);
	      } else if (!input.hasOwnProperty(key) && input instanceof InputProxy) {
	        replicate(input.get(key), proxiedProperty);
	      } else if (typeof input.get === "function" && input.get(key) !== null) {
	        replicate(input.get(key), proxiedProperty);
	      } else if (typeof input === "object" && input.hasOwnProperty(key)) {
	        if (!input[key]) {
	          input[key] = new Rx.Subject();
	        }
	        replicate(input[key], proxiedProperty);
	      } else {
	        throw new CycleInterfaceError("Input should have the required property " + key, String(key));
	      }
	    }
	  }
	};
	
	module.exports = DataFlowNode;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	function DataFlowSource(outputObject) {
	  if (arguments.length !== 1) {
	    throw new Error("DataFlowSource expects only one argument: the output object.");
	  }
	  if (typeof outputObject !== "object") {
	    throw new Error("DataFlowSource expects the constructor argument to be the " + "output object.");
	  }
	
	  for (var key in outputObject) {
	    if (outputObject.hasOwnProperty(key)) {
	      this[key] = outputObject[key];
	    }
	  }
	  this.inject = function injectDataFlowSource() {
	    throw new Error("A DataFlowSource cannot be injected. Use a DataFlowNode instead.");
	  };
	  return this;
	}
	
	module.exports = DataFlowSource;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	function makeLightweightInputProxies(args) {
	  return Array.prototype.slice.call(args).map(function (arg) {
	    return {
	      get: function get(streamName) {
	        if (typeof arg.get === "function") {
	          return arg.get(streamName);
	        } else {
	          return arg[streamName] || null;
	        }
	      }
	    };
	  });
	}
	
	function DataFlowSink(definitionFn) {
	  if (arguments.length !== 1) {
	    throw new Error("DataFlowSink expects only one argument: the definition function.");
	  }
	  if (typeof definitionFn !== "function") {
	    throw new Error("DataFlowSink expects the argument to be the definition function.");
	  }
	  definitionFn.displayName += "(DataFlowSink defFn)";
	  this.inject = function injectIntoDataFlowSink() {
	    var proxies = makeLightweightInputProxies(arguments);
	    return definitionFn.apply({}, proxies);
	  };
	  return this;
	}
	
	module.exports = DataFlowSink;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var VDOM = {
	  h: __webpack_require__(15).h,
	  diff: __webpack_require__(20),
	  patch: __webpack_require__(21)
	};
	var Rx = __webpack_require__(16);
	var DataFlowNode = __webpack_require__(7);
	var CustomElements = __webpack_require__(22);
	
	function isElement(o) {
	  return typeof HTMLElement === "object" ? o instanceof HTMLElement || o instanceof DocumentFragment : //DOM2
	  o && typeof o === "object" && o !== null && (o.nodeType === 1 || o.nodeType === 11) && typeof o.nodeName === "string";
	}
	
	function getArrayOfAllWidgetRootElemStreams(vtree) {
	  if (vtree.type === "Widget" && vtree._rootElem$) {
	    return [vtree._rootElem$];
	  }
	  // Or replace children recursively
	  var array = [];
	  if (Array.isArray(vtree.children)) {
	    for (var i = vtree.children.length - 1; i >= 0; i--) {
	      array = array.concat(getArrayOfAllWidgetRootElemStreams(vtree.children[i]));
	    }
	  }
	  return array;
	}
	
	function defineRootElemStream(user) {
	  // Create rootElem stream and automatic className correction
	  var originalClasses = (user._domContainer.className || "").trim().split(/\s+/);
	  user._rawRootElem$ = new Rx.Subject();
	  user._rootElem$ = user._rawRootElem$.map(function fixRootElemClassName(rootElem) {
	    var previousClasses = rootElem.className.trim().split(/\s+/);
	    var missingClasses = originalClasses.filter(function (clss) {
	      return previousClasses.indexOf(clss) < 0;
	    });
	    rootElem.className = previousClasses.concat(missingClasses).join(" ");
	    return rootElem;
	  }).shareReplay(1);
	}
	
	function DOMUser(container) {
	  // Find and prepare the container
	  this._domContainer = typeof container === "string" ? document.querySelector(container) : container;
	  // Check pre-conditions
	  if (typeof container === "string" && this._domContainer === null) {
	    throw new Error("Cannot render into unknown element '" + container + "'");
	  } else if (!isElement(this._domContainer)) {
	    throw new Error("Given container is not a DOM element neither a selector string.");
	  }
	  defineRootElemStream(this);
	  // Create DataFlowNode with rendering logic
	  var self = this;
	  DataFlowNode.call(this, function injectIntoDOMUser(view) {
	    return self._renderEvery(view.get("vtree$"));
	  });
	}
	
	DOMUser.prototype = Object.create(DataFlowNode.prototype);
	
	DOMUser.prototype._renderEvery = function renderEvery(vtree$) {
	  var self = this;
	  // Select the correct rootElem
	  var rootElem;
	  if (self._domContainer.cycleCustomElementProperties) {
	    rootElem = self._domContainer;
	  } else {
	    rootElem = document.createElement("div");
	    self._domContainer.innerHTML = "";
	    self._domContainer.appendChild(rootElem);
	  }
	  // TODO Refactor/rework. Unclear why, but setTimeout this is necessary.
	  setTimeout(function () {
	    self._rawRootElem$.onNext(rootElem);
	  }, 0);
	  // Reactively render the vtree$ into the rootElem
	  return vtree$.startWith(VDOM.h()).map(function renderingPreprocessing(vtree) {
	    return self._replaceCustomElements(vtree);
	  }).pairwise().subscribe(function renderDiffAndPatch(pair) {
	    var oldVTree = pair[0];
	    var newVTree = pair[1];
	    if (typeof newVTree === "undefined") {
	      return;
	    }
	
	    var arrayOfAll = getArrayOfAllWidgetRootElemStreams(newVTree);
	    if (arrayOfAll.length > 0) {
	      Rx.Observable.combineLatest(arrayOfAll, function () {
	        return 0;
	      }).first().subscribe(function () {
	        self._rawRootElem$.onNext(rootElem);
	      });
	    }
	    var cycleCustomElementProperties = rootElem.cycleCustomElementProperties;
	    try {
	      rootElem = VDOM.patch(rootElem, VDOM.diff(oldVTree, newVTree));
	    } catch (err) {
	      console.error(err);
	    }
	    rootElem.cycleCustomElementProperties = cycleCustomElementProperties;
	    if (arrayOfAll.length === 0) {
	      self._rawRootElem$.onNext(rootElem);
	    }
	  });
	};
	
	DOMUser.prototype._replaceCustomElements = function replaceCustomElements(vtree) {
	  // Silently ignore corner cases
	  if (!vtree || !DOMUser._customElements || vtree.type === "VirtualText") {
	    return vtree;
	  }
	  var tagName = (vtree.tagName || "").toUpperCase();
	  // Replace vtree itself
	  if (tagName && DOMUser._customElements.hasOwnProperty(tagName)) {
	    return new DOMUser._customElements[tagName](vtree);
	  }
	  // Or replace children recursively
	  if (Array.isArray(vtree.children)) {
	    for (var i = vtree.children.length - 1; i >= 0; i--) {
	      vtree.children[i] = this._replaceCustomElements(vtree.children[i]);
	    }
	  }
	  return vtree;
	};
	
	DOMUser.prototype.event$ = function event$(selector, eventName) {
	  if (typeof selector !== "string") {
	    throw new Error("DOMUser.event$ expects first argument to be a string as a " + "CSS selector");
	  }
	  if (typeof eventName !== "string") {
	    throw new Error("DOMUser.event$ expects second argument to be a string " + "representing the event type to listen for.");
	  }
	
	  return this._rootElem$.flatMapLatest(function flatMapDOMUserEventStream(rootElem) {
	    if (!rootElem) {
	      return Rx.Observable.empty();
	    }
	    var klass = selector.replace(".", "");
	    if (rootElem.className.search(new RegExp("\\b" + klass + "\\b")) >= 0) {
	      return Rx.Observable.fromEvent(rootElem, eventName);
	    }
	    var targetElements = rootElem.querySelectorAll(selector);
	    if (targetElements && targetElements.length > 0) {
	      return Rx.Observable.fromEvent(targetElements, eventName);
	    } else {
	      return Rx.Observable.empty();
	    }
	  });
	};
	
	DOMUser.registerCustomElement = function registerCustomElement(tagName, definitionFn) {
	  if (typeof tagName !== "string" || typeof definitionFn !== "function") {
	    throw new Error("registerCustomElement requires parameters `tagName` and " + "`definitionFn`.");
	  }
	  tagName = tagName.toUpperCase();
	  if (DOMUser._customElements && DOMUser._customElements.hasOwnProperty(tagName)) {
	    throw new Error("Cannot register custom element `" + tagName + "` " + "for the DOMUser because that tagName is already registered.");
	  }
	
	  var WidgetClass = CustomElements.makeConstructor();
	  WidgetClass.prototype.init = CustomElements.makeInit(tagName, definitionFn);
	  WidgetClass.prototype.update = CustomElements.makeUpdate();
	  DOMUser._customElements = DOMUser._customElements || {};
	  DOMUser._customElements[tagName] = WidgetClass;
	};
	
	module.exports = DOMUser;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	function PropertyHook(fn) {
	  this.fn = fn;
	}
	PropertyHook.prototype.hook = function () {
	  this.fn.apply(this, arguments);
	};
	
	module.exports = PropertyHook;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var DataFlowNode = __webpack_require__(7);
	var errors = __webpack_require__(17);
	
	function createModel(definitionFn) {
	  var model = new DataFlowNode(definitionFn);
	  model = errors.customInterfaceErrorMessageInInject(model, "Model expects Intent to have the required property ");
	  model.clone = function cloneModel() {
	    return createModel(definitionFn);
	  };
	  return model;
	}
	
	module.exports = createModel;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var Rx = __webpack_require__(16);
	var DataFlowNode = __webpack_require__(7);
	var errors = __webpack_require__(17);
	
	function checkVTree$(view) {
	  if (view.get("vtree$") === null || typeof view.get("vtree$").subscribe !== "function") {
	    throw new Error("View must define `vtree$` Observable emitting virtual DOM elements");
	  }
	}
	
	function throwErrorIfNotVTree(vtree) {
	  if (vtree.type !== "VirtualNode" || vtree.tagName === "undefined") {
	    throw new Error("View `vtree$` must emit only VirtualNode instances. " + "Hint: create them with Cycle.h()");
	  }
	}
	
	function getCorrectedVtree$(view) {
	  var newVtree$ = view.get("vtree$").map(function (vtree) {
	    if (vtree.type === "Widget") {
	      return vtree;
	    }
	    throwErrorIfNotVTree(vtree);
	    return vtree;
	  }).replay(null, 1);
	  newVtree$.connect();
	  return newVtree$;
	}
	
	function overrideGet(view) {
	  var oldGet = view.get;
	  var newVtree$ = getCorrectedVtree$(view); // Is here because has connect() side effect
	  view.get = function get(streamName) {
	    if (streamName === "vtree$") {
	      // Override get('vtree$')
	      return newVtree$;
	    } else if (view[streamName]) {
	      return view[streamName];
	    } else {
	      var result = oldGet.call(this, streamName);
	      if (!result) {
	        view[streamName] = new Rx.Subject();
	        return view[streamName];
	      } else {
	        return result;
	      }
	    }
	  };
	}
	
	function createView(definitionFn) {
	  var view = new DataFlowNode(definitionFn);
	  view = errors.customInterfaceErrorMessageInInject(view, "View expects Model to have the required property ");
	  checkVTree$(view);
	  overrideGet(view);
	  view.clone = function cloneView() {
	    return createView(definitionFn);
	  };
	  return view;
	}
	
	module.exports = createView;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var DataFlowNode = __webpack_require__(7);
	var errors = __webpack_require__(17);
	
	function createIntent(definitionFn) {
	  var intent = new DataFlowNode(definitionFn);
	  intent = errors.customInterfaceErrorMessageInInject(intent, "Intent expects View to have the required property ");
	  intent.clone = function cloneIntent() {
	    return createIntent(definitionFn);
	  };
	  return intent;
	}
	
	module.exports = createIntent;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var diff = __webpack_require__(20);
	var patch = __webpack_require__(21);
	var h = __webpack_require__(23);
	var create = __webpack_require__(24);
	
	module.exports = {
	    diff: diff,
	    patch: patch,
	    h: h,
	    create: create
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global, process) {"";;(function(undefined){var objectTypes={boolean:false, "function":true, object:true, number:false, string:false, undefined:false};var root=objectTypes[typeof window] && window || this, freeExports=objectTypes[typeof exports] && exports && !exports.nodeType && exports, freeModule=objectTypes[typeof module] && module && !module.nodeType && module, moduleExports=freeModule && freeModule.exports === freeExports && freeExports, freeGlobal=objectTypes[typeof global] && global;if(freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)){root = freeGlobal;}var Rx={internals:{}, config:{Promise:root.Promise}, helpers:{}};var noop=Rx.helpers.noop = function(){}, notDefined=Rx.helpers.notDefined = function(x){return typeof x === "undefined";}, isScheduler=Rx.helpers.isScheduler = function(x){return x instanceof Rx.Scheduler;}, identity=Rx.helpers.identity = function(x){return x;}, pluck=Rx.helpers.pluck = function(property){return function(x){return x[property];};}, just=Rx.helpers.just = function(value){return function(){return value;};}, defaultNow=Rx.helpers.defaultNow = Date.now, defaultComparer=Rx.helpers.defaultComparer = function(x, y){return isEqual(x, y);}, defaultSubComparer=Rx.helpers.defaultSubComparer = function(x, y){return x > y?1:x < y?-1:0;}, defaultKeySerializer=Rx.helpers.defaultKeySerializer = function(x){return x.toString();}, defaultError=Rx.helpers.defaultError = function(err){throw err;}, isPromise=Rx.helpers.isPromise = function(p){return !!p && typeof p.then === "function";}, asArray=Rx.helpers.asArray = function(){return Array.prototype.slice.call(arguments);}, not=Rx.helpers.not = function(a){return !a;}, isFunction=Rx.helpers.isFunction = (function(){var isFn=function isFn(value){return typeof value == "function" || false;};if(isFn(/x/)){isFn = function(value){return typeof value == "function" && toString.call(value) == "[object Function]";};}return isFn;})();var sequenceContainsNoElements="Sequence contains no elements.";var argumentOutOfRange="Argument out of range";var objectDisposed="Object has been disposed";function checkDisposed(){if(this.isDisposed){throw new Error(objectDisposed);}}Rx.config.longStackSupport = false;var hasStacks=false;try{throw new Error();}catch(e) {hasStacks = !!e.stack;}var rStartingLine=captureLine(), rFileName;var STACK_JUMP_SEPARATOR="From previous event:";function makeStackTraceLong(error, observable){if(hasStacks && observable.stack && typeof error === "object" && error !== null && error.stack && error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1){var stacks=[];for(var o=observable; !!o; o = o.source) {if(o.stack){stacks.unshift(o.stack);}}stacks.unshift(error.stack);var concatedStacks=stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");error.stack = filterStackString(concatedStacks);}}function filterStackString(stackString){var lines=stackString.split("\n"), desiredLines=[];for(var i=0, len=lines.length; i < len; i++) {var line=lines[i];if(!isInternalFrame(line) && !isNodeFrame(line) && line){desiredLines.push(line);}}return desiredLines.join("\n");}function isInternalFrame(stackLine){var fileNameAndLineNumber=getFileNameAndLineNumber(stackLine);if(!fileNameAndLineNumber){return false;}var fileName=fileNameAndLineNumber[0], lineNumber=fileNameAndLineNumber[1];return fileName === rFileName && lineNumber >= rStartingLine && lineNumber <= rEndingLine;}function isNodeFrame(stackLine){return stackLine.indexOf("(module.js:") !== -1 || stackLine.indexOf("(node.js:") !== -1;}function captureLine(){if(!hasStacks){return;}try{throw new Error();}catch(e) {var lines=e.stack.split("\n");var firstLine=lines[0].indexOf("@") > 0?lines[1]:lines[2];var fileNameAndLineNumber=getFileNameAndLineNumber(firstLine);if(!fileNameAndLineNumber){return;}rFileName = fileNameAndLineNumber[0];return fileNameAndLineNumber[1];}}function getFileNameAndLineNumber(stackLine){var attempt1=/at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);if(attempt1){return [attempt1[1], Number(attempt1[2])];}var attempt2=/at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);if(attempt2){return [attempt2[1], Number(attempt2[2])];}var attempt3=/.*@(.+):(\d+)$/.exec(stackLine);if(attempt3){return [attempt3[1], Number(attempt3[2])];}}var $iterator$=typeof Symbol === "function" && Symbol.iterator || "_es6shim_iterator_";if(root.Set && typeof new root.Set()["@@iterator"] === "function"){$iterator$ = "@@iterator";}var doneEnumerator=Rx.doneEnumerator = {done:true, value:undefined};var isIterable=Rx.helpers.isIterable = function(o){return o[$iterator$] !== undefined;};var isArrayLike=Rx.helpers.isArrayLike = function(o){return o && o.length !== undefined;};Rx.helpers.iterator = $iterator$;var bindCallback=Rx.internals.bindCallback = function(func, thisArg, argCount){if(typeof thisArg === "undefined"){return func;}switch(argCount){case 0:return function(){return func.call(thisArg);};case 1:return function(arg){return func.call(thisArg, arg);};case 2:return function(value, index){return func.call(thisArg, value, index);};case 3:return function(value, index, collection){return func.call(thisArg, value, index, collection);};}return function(){return func.apply(thisArg, arguments);};};var dontEnums=["toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor"], dontEnumsLength=dontEnums.length;var argsClass="[object Arguments]", arrayClass="[object Array]", boolClass="[object Boolean]", dateClass="[object Date]", errorClass="[object Error]", funcClass="[object Function]", numberClass="[object Number]", objectClass="[object Object]", regexpClass="[object RegExp]", stringClass="[object String]";var toString=Object.prototype.toString, hasOwnProperty=Object.prototype.hasOwnProperty, supportsArgsClass=toString.call(arguments) == argsClass, supportNodeClass, errorProto=Error.prototype, objectProto=Object.prototype, stringProto=String.prototype, propertyIsEnumerable=objectProto.propertyIsEnumerable;try{supportNodeClass = !(toString.call(document) == objectClass && !({toString:0} + ""));}catch(e) {supportNodeClass = true;}var nonEnumProps={};nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = {constructor:true, toLocaleString:true, toString:true, valueOf:true};nonEnumProps[boolClass] = nonEnumProps[stringClass] = {constructor:true, toString:true, valueOf:true};nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = {constructor:true, toString:true};nonEnumProps[objectClass] = {constructor:true};var support={};(function(){var ctor=function ctor(){this.x = 1;}, props=[];ctor.prototype = {valueOf:1, y:1};for(var key in new ctor()) {props.push(key);}for(key in arguments) {}support.enumErrorProps = propertyIsEnumerable.call(errorProto, "message") || propertyIsEnumerable.call(errorProto, "name");support.enumPrototypes = propertyIsEnumerable.call(ctor, "prototype");support.nonEnumArgs = key != 0;support.nonEnumShadows = !/valueOf/.test(props);})(1);var isObject=Rx.internals.isObject = function(value){var type=typeof value;return value && (type == "function" || type == "object") || false;};function keysIn(object){var result=[];if(!isObject(object)){return result;}if(support.nonEnumArgs && object.length && isArguments(object)){object = slice.call(object);}var skipProto=support.enumPrototypes && typeof object == "function", skipErrorProps=support.enumErrorProps && (object === errorProto || object instanceof Error);for(var key in object) {if(!(skipProto && key == "prototype") && !(skipErrorProps && (key == "message" || key == "name"))){result.push(key);}}if(support.nonEnumShadows && object !== objectProto){var ctor=object.constructor, index=-1, length=dontEnumsLength;if(object === (ctor && ctor.prototype)){var className=object === stringProto?stringClass:object === errorProto?errorClass:toString.call(object), nonEnum=nonEnumProps[className];}while(++index < length) {key = dontEnums[index];if(!(nonEnum && nonEnum[key]) && hasOwnProperty.call(object, key)){result.push(key);}}}return result;}function internalFor(object, callback, keysFunc){var index=-1, props=keysFunc(object), length=props.length;while(++index < length) {var key=props[index];if(callback(object[key], key, object) === false){break;}}return object;}function internalForIn(object, callback){return internalFor(object, callback, keysIn);}function isNode(value){return typeof value.toString != "function" && typeof (value + "") == "string";}var isArguments=function isArguments(value){return value && typeof value == "object"?toString.call(value) == argsClass:false;};if(!supportsArgsClass){isArguments = function(value){return value && typeof value == "object"?hasOwnProperty.call(value, "callee"):false;};}var isEqual=Rx.internals.isEqual = function(x, y){return deepEquals(x, y, [], []);};function deepEquals(a, b, stackA, stackB){if(a === b){return a !== 0 || 1 / a == 1 / b;}var type=typeof a, otherType=typeof b;if(a === a && (a == null || b == null || type != "function" && type != "object" && otherType != "function" && otherType != "object")){return false;}var className=toString.call(a), otherClass=toString.call(b);if(className == argsClass){className = objectClass;}if(otherClass == argsClass){otherClass = objectClass;}if(className != otherClass){return false;}switch(className){case boolClass:case dateClass:return +a == +b;case numberClass:return a != +a?b != +b:a == 0?1 / a == 1 / b:a == +b;case regexpClass:case stringClass:return a == String(b);}var isArr=className == arrayClass;if(!isArr){if(className != objectClass || !support.nodeClass && (isNode(a) || isNode(b))){return false;}var ctorA=!support.argsObject && isArguments(a)?Object:a.constructor, ctorB=!support.argsObject && isArguments(b)?Object:b.constructor;if(ctorA != ctorB && !(hasOwnProperty.call(a, "constructor") && hasOwnProperty.call(b, "constructor")) && !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) && ("constructor" in a && "constructor" in b)){return false;}}var initedStack=!stackA;stackA || (stackA = []);stackB || (stackB = []);var length=stackA.length;while(length--) {if(stackA[length] == a){return stackB[length] == b;}}var size=0;var result=true;stackA.push(a);stackB.push(b);if(isArr){length = a.length;size = b.length;result = size == length;if(result){while(size--) {var index=length, value=b[size];if(!(result = deepEquals(a[size], value, stackA, stackB))){break;}}}}else {internalForIn(b, function(value, key, b){if(hasOwnProperty.call(b, key)){size++;return result = hasOwnProperty.call(a, key) && deepEquals(a[key], value, stackA, stackB);}});if(result){internalForIn(a, function(value, key, a){if(hasOwnProperty.call(a, key)){return result = --size > -1;}});}}stackA.pop();stackB.pop();return result;}var slice=Array.prototype.slice;function argsOrArray(args, idx){return args.length === 1 && Array.isArray(args[idx])?args[idx]:slice.call(args);}var hasProp=({}).hasOwnProperty;var inherits=this.inherits = Rx.internals.inherits = function(child, parent){function __(){this.constructor = child;}__.prototype = parent.prototype;child.prototype = new __();};var addProperties=Rx.internals.addProperties = function(obj){var sources=slice.call(arguments, 1);for(var i=0, len=sources.length; i < len; i++) {var source=sources[i];for(var prop in source) {obj[prop] = source[prop];}}};var addRef=Rx.internals.addRef = function(xs, r){return new AnonymousObservable(function(observer){return new CompositeDisposable(r.getDisposable(), xs.subscribe(observer));});};function arrayInitialize(count, factory){var a=new Array(count);for(var i=0; i < count; i++) {a[i] = factory();}return a;}function IndexedItem(id, value){this.id = id;this.value = value;}IndexedItem.prototype.compareTo = function(other){var c=this.value.compareTo(other.value);c === 0 && (c = this.id - other.id);return c;};var PriorityQueue=Rx.internals.PriorityQueue = function(capacity){this.items = new Array(capacity);this.length = 0;};var priorityProto=PriorityQueue.prototype;priorityProto.isHigherPriority = function(left, right){return this.items[left].compareTo(this.items[right]) < 0;};priorityProto.percolate = function(index){if(index >= this.length || index < 0){return;}var parent=index - 1 >> 1;if(parent < 0 || parent === index){return;}if(this.isHigherPriority(index, parent)){var temp=this.items[index];this.items[index] = this.items[parent];this.items[parent] = temp;this.percolate(parent);}};priorityProto.heapify = function(index){+index || (index = 0);if(index >= this.length || index < 0){return;}var left=2 * index + 1, right=2 * index + 2, first=index;if(left < this.length && this.isHigherPriority(left, first)){first = left;}if(right < this.length && this.isHigherPriority(right, first)){first = right;}if(first !== index){var temp=this.items[index];this.items[index] = this.items[first];this.items[first] = temp;this.heapify(first);}};priorityProto.peek = function(){return this.items[0].value;};priorityProto.removeAt = function(index){this.items[index] = this.items[--this.length];delete this.items[this.length];this.heapify();};priorityProto.dequeue = function(){var result=this.peek();this.removeAt(0);return result;};priorityProto.enqueue = function(item){var index=this.length++;this.items[index] = new IndexedItem(PriorityQueue.count++, item);this.percolate(index);};priorityProto.remove = function(item){for(var i=0; i < this.length; i++) {if(this.items[i].value === item){this.removeAt(i);return true;}}return false;};PriorityQueue.count = 0;var CompositeDisposable=Rx.CompositeDisposable = function(){this.disposables = argsOrArray(arguments, 0);this.isDisposed = false;this.length = this.disposables.length;};var CompositeDisposablePrototype=CompositeDisposable.prototype;CompositeDisposablePrototype.add = function(item){if(this.isDisposed){item.dispose();}else {this.disposables.push(item);this.length++;}};CompositeDisposablePrototype.remove = function(item){var shouldDispose=false;if(!this.isDisposed){var idx=this.disposables.indexOf(item);if(idx !== -1){shouldDispose = true;this.disposables.splice(idx, 1);this.length--;item.dispose();}}return shouldDispose;};CompositeDisposablePrototype.dispose = function(){if(!this.isDisposed){this.isDisposed = true;var currentDisposables=this.disposables.slice(0);this.disposables = [];this.length = 0;for(var i=0, len=currentDisposables.length; i < len; i++) {currentDisposables[i].dispose();}}};CompositeDisposablePrototype.toArray = function(){return this.disposables.slice(0);};var Disposable=Rx.Disposable = function(action){this.isDisposed = false;this.action = action || noop;};Disposable.prototype.dispose = function(){if(!this.isDisposed){this.action();this.isDisposed = true;}};var disposableCreate=Disposable.create = function(action){return new Disposable(action);};var disposableEmpty=Disposable.empty = {dispose:noop};var SingleAssignmentDisposable=Rx.SingleAssignmentDisposable = (function(){function BooleanDisposable(){this.isDisposed = false;this.current = null;}var booleanDisposablePrototype=BooleanDisposable.prototype;booleanDisposablePrototype.getDisposable = function(){return this.current;};booleanDisposablePrototype.setDisposable = function(value){var shouldDispose=this.isDisposed, old;if(!shouldDispose){old = this.current;this.current = value;}old && old.dispose();shouldDispose && value && value.dispose();};booleanDisposablePrototype.dispose = function(){var old;if(!this.isDisposed){this.isDisposed = true;old = this.current;this.current = null;}old && old.dispose();};return BooleanDisposable;})();var SerialDisposable=Rx.SerialDisposable = SingleAssignmentDisposable;var RefCountDisposable=Rx.RefCountDisposable = (function(){function InnerDisposable(disposable){this.disposable = disposable;this.disposable.count++;this.isInnerDisposed = false;}InnerDisposable.prototype.dispose = function(){if(!this.disposable.isDisposed){if(!this.isInnerDisposed){this.isInnerDisposed = true;this.disposable.count--;if(this.disposable.count === 0 && this.disposable.isPrimaryDisposed){this.disposable.isDisposed = true;this.disposable.underlyingDisposable.dispose();}}}};function RefCountDisposable(disposable){this.underlyingDisposable = disposable;this.isDisposed = false;this.isPrimaryDisposed = false;this.count = 0;}RefCountDisposable.prototype.dispose = function(){if(!this.isDisposed){if(!this.isPrimaryDisposed){this.isPrimaryDisposed = true;if(this.count === 0){this.isDisposed = true;this.underlyingDisposable.dispose();}}}};RefCountDisposable.prototype.getDisposable = function(){return this.isDisposed?disposableEmpty:new InnerDisposable(this);};return RefCountDisposable;})();function ScheduledDisposable(scheduler, disposable){this.scheduler = scheduler;this.disposable = disposable;this.isDisposed = false;}ScheduledDisposable.prototype.dispose = function(){var parent=this;this.scheduler.schedule(function(){if(!parent.isDisposed){parent.isDisposed = true;parent.disposable.dispose();}});};var ScheduledItem=Rx.internals.ScheduledItem = function(scheduler, state, action, dueTime, comparer){this.scheduler = scheduler;this.state = state;this.action = action;this.dueTime = dueTime;this.comparer = comparer || defaultSubComparer;this.disposable = new SingleAssignmentDisposable();};ScheduledItem.prototype.invoke = function(){this.disposable.setDisposable(this.invokeCore());};ScheduledItem.prototype.compareTo = function(other){return this.comparer(this.dueTime, other.dueTime);};ScheduledItem.prototype.isCancelled = function(){return this.disposable.isDisposed;};ScheduledItem.prototype.invokeCore = function(){return this.action(this.scheduler, this.state);};var Scheduler=Rx.Scheduler = (function(){function Scheduler(now, schedule, scheduleRelative, scheduleAbsolute){this.now = now;this._schedule = schedule;this._scheduleRelative = scheduleRelative;this._scheduleAbsolute = scheduleAbsolute;}function invokeAction(scheduler, action){action();return disposableEmpty;}var schedulerProto=Scheduler.prototype;schedulerProto.schedule = function(action){return this._schedule(action, invokeAction);};schedulerProto.scheduleWithState = function(state, action){return this._schedule(state, action);};schedulerProto.scheduleWithRelative = function(dueTime, action){return this._scheduleRelative(action, dueTime, invokeAction);};schedulerProto.scheduleWithRelativeAndState = function(state, dueTime, action){return this._scheduleRelative(state, dueTime, action);};schedulerProto.scheduleWithAbsolute = function(dueTime, action){return this._scheduleAbsolute(action, dueTime, invokeAction);};schedulerProto.scheduleWithAbsoluteAndState = function(state, dueTime, action){return this._scheduleAbsolute(state, dueTime, action);};Scheduler.now = defaultNow;Scheduler.normalize = function(timeSpan){timeSpan < 0 && (timeSpan = 0);return timeSpan;};return Scheduler;})();var normalizeTime=Scheduler.normalize;(function(schedulerProto){function invokeRecImmediate(scheduler, pair){var state=pair.first, action=pair.second, group=new CompositeDisposable(), recursiveAction=(function(_recursiveAction){var _recursiveActionWrapper=function recursiveAction(_x){return _recursiveAction.apply(this, arguments);};_recursiveActionWrapper.toString = function(){return _recursiveAction.toString();};return _recursiveActionWrapper;})(function(state1){action(state1, function(state2){var isAdded=false, isDone=false, d=scheduler.scheduleWithState(state2, function(scheduler1, state3){if(isAdded){group.remove(d);}else {isDone = true;}recursiveAction(state3);return disposableEmpty;});if(!isDone){group.add(d);isAdded = true;}});});recursiveAction(state);return group;}function invokeRecDate(scheduler, pair, method){var state=pair.first, action=pair.second, group=new CompositeDisposable(), recursiveAction=(function(_recursiveAction){var _recursiveActionWrapper=function recursiveAction(_x){return _recursiveAction.apply(this, arguments);};_recursiveActionWrapper.toString = function(){return _recursiveAction.toString();};return _recursiveActionWrapper;})(function(state1){action(state1, function(state2, dueTime1){var isAdded=false, isDone=false, d=scheduler[method].call(scheduler, state2, dueTime1, function(scheduler1, state3){if(isAdded){group.remove(d);}else {isDone = true;}recursiveAction(state3);return disposableEmpty;});if(!isDone){group.add(d);isAdded = true;}});});recursiveAction(state);return group;}function scheduleInnerRecursive(action, self){action(function(dt){self(action, dt);});}schedulerProto.scheduleRecursive = function(action){return this.scheduleRecursiveWithState(action, function(_action, self){_action(function(){self(_action);});});};schedulerProto.scheduleRecursiveWithState = function(state, action){return this.scheduleWithState({first:state, second:action}, invokeRecImmediate);};schedulerProto.scheduleRecursiveWithRelative = function(dueTime, action){return this.scheduleRecursiveWithRelativeAndState(action, dueTime, scheduleInnerRecursive);};schedulerProto.scheduleRecursiveWithRelativeAndState = function(state, dueTime, action){return this._scheduleRelative({first:state, second:action}, dueTime, function(s, p){return invokeRecDate(s, p, "scheduleWithRelativeAndState");});};schedulerProto.scheduleRecursiveWithAbsolute = function(dueTime, action){return this.scheduleRecursiveWithAbsoluteAndState(action, dueTime, scheduleInnerRecursive);};schedulerProto.scheduleRecursiveWithAbsoluteAndState = function(state, dueTime, action){return this._scheduleAbsolute({first:state, second:action}, dueTime, function(s, p){return invokeRecDate(s, p, "scheduleWithAbsoluteAndState");});};})(Scheduler.prototype);(function(schedulerProto){Scheduler.prototype.schedulePeriodic = function(period, action){return this.schedulePeriodicWithState(null, period, action);};Scheduler.prototype.schedulePeriodicWithState = function(state, period, action){if(typeof root.setInterval === "undefined"){throw new Error("Periodic scheduling not supported.");}var s=state;var id=root.setInterval(function(){s = action(s);}, period);return disposableCreate(function(){root.clearInterval(id);});};})(Scheduler.prototype);(function(schedulerProto){schedulerProto.catchError = schedulerProto["catch"] = function(handler){return new CatchScheduler(this, handler);};})(Scheduler.prototype);var SchedulePeriodicRecursive=Rx.internals.SchedulePeriodicRecursive = (function(){function tick(command, recurse){recurse(0, this._period);try{this._state = this._action(this._state);}catch(e) {this._cancel.dispose();throw e;}}function SchedulePeriodicRecursive(scheduler, state, period, action){this._scheduler = scheduler;this._state = state;this._period = period;this._action = action;}SchedulePeriodicRecursive.prototype.start = function(){var d=new SingleAssignmentDisposable();this._cancel = d;d.setDisposable(this._scheduler.scheduleRecursiveWithRelativeAndState(0, this._period, tick.bind(this)));return d;};return SchedulePeriodicRecursive;})();var immediateScheduler=Scheduler.immediate = (function(){function scheduleNow(state, action){return action(this, state);}function scheduleRelative(state, dueTime, action){var dt=this.now() + normalizeTime(dueTime);while(dt - this.now() > 0) {}return action(this, state);}function scheduleAbsolute(state, dueTime, action){return this.scheduleWithRelativeAndState(state, dueTime - this.now(), action);}return new Scheduler(defaultNow, scheduleNow, scheduleRelative, scheduleAbsolute);})();var currentThreadScheduler=Scheduler.currentThread = (function(){var queue;function runTrampoline(q){var item;while(q.length > 0) {item = q.dequeue();if(!item.isCancelled()){while(item.dueTime - Scheduler.now() > 0) {}if(!item.isCancelled()){item.invoke();}}}}function scheduleNow(state, action){return this.scheduleWithRelativeAndState(state, 0, action);}function scheduleRelative(state, dueTime, action){var dt=this.now() + Scheduler.normalize(dueTime), si=new ScheduledItem(this, state, action, dt);if(!queue){queue = new PriorityQueue(4);queue.enqueue(si);try{runTrampoline(queue);}catch(e) {throw e;}finally {queue = null;}}else {queue.enqueue(si);}return si.disposable;}function scheduleAbsolute(state, dueTime, action){return this.scheduleWithRelativeAndState(state, dueTime - this.now(), action);}var currentScheduler=new Scheduler(defaultNow, scheduleNow, scheduleRelative, scheduleAbsolute);currentScheduler.scheduleRequired = function(){return !queue;};currentScheduler.ensureTrampoline = function(action){if(!queue){this.schedule(action);}else {action();}};return currentScheduler;})();var scheduleMethod, clearMethod=noop;var localTimer=(function(){var localSetTimeout, localClearTimeout=noop;if("WScript" in this){localSetTimeout = function(fn, time){WScript.Sleep(time);fn();};}else if(!!root.setTimeout){localSetTimeout = root.setTimeout;localClearTimeout = root.clearTimeout;}else {throw new Error("No concurrency detected!");}return {setTimeout:localSetTimeout, clearTimeout:localClearTimeout};})();var localSetTimeout=localTimer.setTimeout, localClearTimeout=localTimer.clearTimeout;(function(){var reNative=RegExp("^" + String(toString).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/toString| for [^\]]+/g, ".*?") + "$");var setImmediate=typeof (setImmediate = freeGlobal && moduleExports && freeGlobal.setImmediate) == "function" && !reNative.test(setImmediate) && setImmediate, clearImmediate=typeof (clearImmediate = freeGlobal && moduleExports && freeGlobal.clearImmediate) == "function" && !reNative.test(clearImmediate) && clearImmediate;function postMessageSupported(){if(!root.postMessage || root.importScripts){return false;}var isAsync=false, oldHandler=root.onmessage;root.onmessage = function(){isAsync = true;};root.postMessage("", "*");root.onmessage = oldHandler;return isAsync;}if(typeof setImmediate === "function"){scheduleMethod = setImmediate;clearMethod = clearImmediate;}else if(typeof process !== "undefined" && ({}).toString.call(process) === "[object process]"){scheduleMethod = process.nextTick;}else if(postMessageSupported()){var MSG_PREFIX="ms.rx.schedule" + Math.random(), tasks={}, taskId=0;var onGlobalPostMessage=function onGlobalPostMessage(event){if(typeof event.data === "string" && event.data.substring(0, MSG_PREFIX.length) === MSG_PREFIX){var handleId=event.data.substring(MSG_PREFIX.length), action=tasks[handleId];action();delete tasks[handleId];}};if(root.addEventListener){root.addEventListener("message", onGlobalPostMessage, false);}else {root.attachEvent("onmessage", onGlobalPostMessage, false);}scheduleMethod = function(action){var currentId=taskId++;tasks[currentId] = action;root.postMessage(MSG_PREFIX + currentId, "*");};}else if(!!root.MessageChannel){var channel=new root.MessageChannel(), channelTasks={}, channelTaskId=0;channel.port1.onmessage = function(event){var id=event.data, action=channelTasks[id];action();delete channelTasks[id];};scheduleMethod = function(action){var id=channelTaskId++;channelTasks[id] = action;channel.port2.postMessage(id);};}else if("document" in root && "onreadystatechange" in root.document.createElement("script")){scheduleMethod = function(action){var scriptElement=root.document.createElement("script");scriptElement.onreadystatechange = function(){action();scriptElement.onreadystatechange = null;scriptElement.parentNode.removeChild(scriptElement);scriptElement = null;};root.document.documentElement.appendChild(scriptElement);};}else {scheduleMethod = function(action){return localSetTimeout(action, 0);};clearMethod = localClearTimeout;}})();var timeoutScheduler=Scheduler.timeout = (function(){function scheduleNow(state, action){var scheduler=this, disposable=new SingleAssignmentDisposable();var id=scheduleMethod(function(){if(!disposable.isDisposed){disposable.setDisposable(action(scheduler, state));}});return new CompositeDisposable(disposable, disposableCreate(function(){clearMethod(id);}));}function scheduleRelative(state, dueTime, action){var scheduler=this, dt=Scheduler.normalize(dueTime);if(dt === 0){return scheduler.scheduleWithState(state, action);}var disposable=new SingleAssignmentDisposable();var id=localSetTimeout(function(){if(!disposable.isDisposed){disposable.setDisposable(action(scheduler, state));}}, dt);return new CompositeDisposable(disposable, disposableCreate(function(){localClearTimeout(id);}));}function scheduleAbsolute(state, dueTime, action){return this.scheduleWithRelativeAndState(state, dueTime - this.now(), action);}return new Scheduler(defaultNow, scheduleNow, scheduleRelative, scheduleAbsolute);})();var CatchScheduler=(function(__super__){function scheduleNow(state, action){return this._scheduler.scheduleWithState(state, this._wrap(action));}function scheduleRelative(state, dueTime, action){return this._scheduler.scheduleWithRelativeAndState(state, dueTime, this._wrap(action));}function scheduleAbsolute(state, dueTime, action){return this._scheduler.scheduleWithAbsoluteAndState(state, dueTime, this._wrap(action));}inherits(CatchScheduler, __super__);function CatchScheduler(scheduler, handler){this._scheduler = scheduler;this._handler = handler;this._recursiveOriginal = null;this._recursiveWrapper = null;__super__.call(this, this._scheduler.now.bind(this._scheduler), scheduleNow, scheduleRelative, scheduleAbsolute);}CatchScheduler.prototype._clone = function(scheduler){return new CatchScheduler(scheduler, this._handler);};CatchScheduler.prototype._wrap = function(action){var parent=this;return function(self, state){try{return action(parent._getRecursiveWrapper(self), state);}catch(e) {if(!parent._handler(e)){throw e;}return disposableEmpty;}};};CatchScheduler.prototype._getRecursiveWrapper = function(scheduler){if(this._recursiveOriginal !== scheduler){this._recursiveOriginal = scheduler;var wrapper=this._clone(scheduler);wrapper._recursiveOriginal = scheduler;wrapper._recursiveWrapper = wrapper;this._recursiveWrapper = wrapper;}return this._recursiveWrapper;};CatchScheduler.prototype.schedulePeriodicWithState = function(state, period, action){var self=this, failed=false, d=new SingleAssignmentDisposable();d.setDisposable(this._scheduler.schedulePeriodicWithState(state, period, function(state1){if(failed){return null;}try{return action(state1);}catch(e) {failed = true;if(!self._handler(e)){throw e;}d.dispose();return null;}}));return d;};return CatchScheduler;})(Scheduler);var Notification=Rx.Notification = (function(){function Notification(kind, hasValue){this.hasValue = hasValue == null?false:hasValue;this.kind = kind;}Notification.prototype.accept = function(observerOrOnNext, onError, onCompleted){return observerOrOnNext && typeof observerOrOnNext === "object"?this._acceptObservable(observerOrOnNext):this._accept(observerOrOnNext, onError, onCompleted);};Notification.prototype.toObservable = function(scheduler){var notification=this;isScheduler(scheduler) || (scheduler = immediateScheduler);return new AnonymousObservable(function(observer){return scheduler.schedule(function(){notification._acceptObservable(observer);notification.kind === "N" && observer.onCompleted();});});};return Notification;})();var notificationCreateOnNext=Notification.createOnNext = (function(){function _accept(onNext){return onNext(this.value);}function _acceptObservable(observer){return observer.onNext(this.value);}function toString(){return "OnNext(" + this.value + ")";}return function(value){var notification=new Notification("N", true);notification.value = value;notification._accept = _accept;notification._acceptObservable = _acceptObservable;notification.toString = toString;return notification;};})();var notificationCreateOnError=Notification.createOnError = (function(){function _accept(onNext, onError){return onError(this.exception);}function _acceptObservable(observer){return observer.onError(this.exception);}function toString(){return "OnError(" + this.exception + ")";}return function(e){var notification=new Notification("E");notification.exception = e;notification._accept = _accept;notification._acceptObservable = _acceptObservable;notification.toString = toString;return notification;};})();var notificationCreateOnCompleted=Notification.createOnCompleted = (function(){function _accept(onNext, onError, onCompleted){return onCompleted();}function _acceptObservable(observer){return observer.onCompleted();}function toString(){return "OnCompleted()";}return function(){var notification=new Notification("C");notification._accept = _accept;notification._acceptObservable = _acceptObservable;notification.toString = toString;return notification;};})();var Enumerator=Rx.internals.Enumerator = function(next){this._next = next;};Enumerator.prototype.next = function(){return this._next();};Enumerator.prototype[$iterator$] = function(){return this;};var Enumerable=Rx.internals.Enumerable = function(iterator){this._iterator = iterator;};Enumerable.prototype[$iterator$] = function(){return this._iterator();};Enumerable.prototype.concat = function(){var sources=this;return new AnonymousObservable(function(observer){var e;try{e = sources[$iterator$]();}catch(err) {observer.onError(err);return;}var isDisposed, subscription=new SerialDisposable();var cancelable=immediateScheduler.scheduleRecursive(function(self){var currentItem;if(isDisposed){return;}try{currentItem = e.next();}catch(ex) {observer.onError(ex);return;}if(currentItem.done){observer.onCompleted();return;}var currentValue=currentItem.value;isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));var d=new SingleAssignmentDisposable();subscription.setDisposable(d);d.setDisposable(currentValue.subscribe(observer.onNext.bind(observer), observer.onError.bind(observer), function(){self();}));});return new CompositeDisposable(subscription, cancelable, disposableCreate(function(){isDisposed = true;}));});};Enumerable.prototype.catchError = function(){var sources=this;return new AnonymousObservable(function(observer){var e;try{e = sources[$iterator$]();}catch(err) {observer.onError(err);return;}var isDisposed, lastException, subscription=new SerialDisposable();var cancelable=immediateScheduler.scheduleRecursive(function(self){if(isDisposed){return;}var currentItem;try{currentItem = e.next();}catch(ex) {observer.onError(ex);return;}if(currentItem.done){if(lastException){observer.onError(lastException);}else {observer.onCompleted();}return;}var currentValue=currentItem.value;isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));var d=new SingleAssignmentDisposable();subscription.setDisposable(d);d.setDisposable(currentValue.subscribe(observer.onNext.bind(observer), function(exn){lastException = exn;self();}, observer.onCompleted.bind(observer)));});return new CompositeDisposable(subscription, cancelable, disposableCreate(function(){isDisposed = true;}));});};Enumerable.prototype.catchErrorWhen = function(notificationHandler){var sources=this;return new AnonymousObservable(function(observer){var e;var exceptions=new Subject();var handled=notificationHandler(exceptions);var notifier=new Subject();var notificationDisposable=handled.subscribe(notifier);try{e = sources[$iterator$]();}catch(err) {observer.onError(err);return;}var isDisposed, lastException, subscription=new SerialDisposable();var cancelable=immediateScheduler.scheduleRecursive(function(self){if(isDisposed){return;}var currentItem;try{currentItem = e.next();}catch(ex) {observer.onError(ex);return;}if(currentItem.done){if(lastException){observer.onError(lastException);}else {observer.onCompleted();}return;}var currentValue=currentItem.value;isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));var outer=new SingleAssignmentDisposable();var inner=new SingleAssignmentDisposable();subscription.setDisposable(new CompositeDisposable(inner, outer));outer.setDisposable(currentValue.subscribe(observer.onNext.bind(observer), function(exn){inner.setDisposable(notifier.subscribe(function(){self();}, function(ex){observer.onError(ex);}, function(){observer.onCompleted();}));exceptions.onNext(exn);}, observer.onCompleted.bind(observer)));});return new CompositeDisposable(notificationDisposable, subscription, cancelable, disposableCreate(function(){isDisposed = true;}));});};var enumerableRepeat=Enumerable.repeat = function(value, repeatCount){if(repeatCount == null){repeatCount = -1;}return new Enumerable(function(){var left=repeatCount;return new Enumerator(function(){if(left === 0){return doneEnumerator;}if(left > 0){left--;}return {done:false, value:value};});});};var enumerableOf=Enumerable.of = function(source, selector, thisArg){selector || (selector = identity);return new Enumerable(function(){var index=-1;return new Enumerator(function(){return ++index < source.length?{done:false, value:selector.call(thisArg, source[index], index, source)}:doneEnumerator;});});};var Observer=Rx.Observer = function(){};Observer.prototype.toNotifier = function(){var observer=this;return function(n){return n.accept(observer);};};Observer.prototype.asObserver = function(){return new AnonymousObserver(this.onNext.bind(this), this.onError.bind(this), this.onCompleted.bind(this));};Observer.prototype.checked = function(){return new CheckedObserver(this);};var observerCreate=Observer.create = function(onNext, onError, onCompleted){onNext || (onNext = noop);onError || (onError = defaultError);onCompleted || (onCompleted = noop);return new AnonymousObserver(onNext, onError, onCompleted);};Observer.fromNotifier = function(handler, thisArg){return new AnonymousObserver(function(x){return handler.call(thisArg, notificationCreateOnNext(x));}, function(e){return handler.call(thisArg, notificationCreateOnError(e));}, function(){return handler.call(thisArg, notificationCreateOnCompleted());});};Observer.prototype.notifyOn = function(scheduler){return new ObserveOnObserver(scheduler, this);};var AbstractObserver=Rx.internals.AbstractObserver = (function(__super__){inherits(AbstractObserver, __super__);function AbstractObserver(){this.isStopped = false;__super__.call(this);}AbstractObserver.prototype.onNext = function(value){if(!this.isStopped){this.next(value);}};AbstractObserver.prototype.onError = function(error){if(!this.isStopped){this.isStopped = true;this.error(error);}};AbstractObserver.prototype.onCompleted = function(){if(!this.isStopped){this.isStopped = true;this.completed();}};AbstractObserver.prototype.dispose = function(){this.isStopped = true;};AbstractObserver.prototype.fail = function(e){if(!this.isStopped){this.isStopped = true;this.error(e);return true;}return false;};return AbstractObserver;})(Observer);var AnonymousObserver=Rx.AnonymousObserver = (function(__super__){inherits(AnonymousObserver, __super__);function AnonymousObserver(onNext, onError, onCompleted){__super__.call(this);this._onNext = onNext;this._onError = onError;this._onCompleted = onCompleted;}AnonymousObserver.prototype.next = function(value){this._onNext(value);};AnonymousObserver.prototype.error = function(error){this._onError(error);};AnonymousObserver.prototype.completed = function(){this._onCompleted();};return AnonymousObserver;})(AbstractObserver);var CheckedObserver=(function(_super){inherits(CheckedObserver, _super);function CheckedObserver(observer){_super.call(this);this._observer = observer;this._state = 0;}var CheckedObserverPrototype=CheckedObserver.prototype;CheckedObserverPrototype.onNext = function(value){this.checkAccess();try{this._observer.onNext(value);}catch(e) {throw e;}finally {this._state = 0;}};CheckedObserverPrototype.onError = function(err){this.checkAccess();try{this._observer.onError(err);}catch(e) {throw e;}finally {this._state = 2;}};CheckedObserverPrototype.onCompleted = function(){this.checkAccess();try{this._observer.onCompleted();}catch(e) {throw e;}finally {this._state = 2;}};CheckedObserverPrototype.checkAccess = function(){if(this._state === 1){throw new Error("Re-entrancy detected");}if(this._state === 2){throw new Error("Observer completed");}if(this._state === 0){this._state = 1;}};return CheckedObserver;})(Observer);var ScheduledObserver=Rx.internals.ScheduledObserver = (function(__super__){inherits(ScheduledObserver, __super__);function ScheduledObserver(scheduler, observer){__super__.call(this);this.scheduler = scheduler;this.observer = observer;this.isAcquired = false;this.hasFaulted = false;this.queue = [];this.disposable = new SerialDisposable();}ScheduledObserver.prototype.next = function(value){var self=this;this.queue.push(function(){self.observer.onNext(value);});};ScheduledObserver.prototype.error = function(e){var self=this;this.queue.push(function(){self.observer.onError(e);});};ScheduledObserver.prototype.completed = function(){var self=this;this.queue.push(function(){self.observer.onCompleted();});};ScheduledObserver.prototype.ensureActive = function(){var isOwner=false, parent=this;if(!this.hasFaulted && this.queue.length > 0){isOwner = !this.isAcquired;this.isAcquired = true;}if(isOwner){this.disposable.setDisposable(this.scheduler.scheduleRecursive(function(self){var work;if(parent.queue.length > 0){work = parent.queue.shift();}else {parent.isAcquired = false;return;}try{work();}catch(ex) {parent.queue = [];parent.hasFaulted = true;throw ex;}self();}));}};ScheduledObserver.prototype.dispose = function(){__super__.prototype.dispose.call(this);this.disposable.dispose();};return ScheduledObserver;})(AbstractObserver);var ObserveOnObserver=(function(__super__){inherits(ObserveOnObserver, __super__);function ObserveOnObserver(scheduler, observer, cancel){__super__.call(this, scheduler, observer);this._cancel = cancel;}ObserveOnObserver.prototype.next = function(value){__super__.prototype.next.call(this, value);this.ensureActive();};ObserveOnObserver.prototype.error = function(e){__super__.prototype.error.call(this, e);this.ensureActive();};ObserveOnObserver.prototype.completed = function(){__super__.prototype.completed.call(this);this.ensureActive();};ObserveOnObserver.prototype.dispose = function(){__super__.prototype.dispose.call(this);this._cancel && this._cancel.dispose();this._cancel = null;};return ObserveOnObserver;})(ScheduledObserver);var observableProto;var Observable=Rx.Observable = (function(){function Observable(subscribe){if(Rx.config.longStackSupport && hasStacks){try{throw new Error();}catch(e) {this.stack = e.stack.substring(e.stack.indexOf("\n") + 1);}var self=this;this._subscribe = function(observer){var oldOnError=observer.onError.bind(observer);observer.onError = function(err){makeStackTraceLong(err, self);oldOnError(err);};return subscribe.call(self, observer);};}else {this._subscribe = subscribe;}}observableProto = Observable.prototype;observableProto.subscribe = observableProto.forEach = function(observerOrOnNext, onError, onCompleted){return this._subscribe(typeof observerOrOnNext === "object"?observerOrOnNext:observerCreate(observerOrOnNext, onError, onCompleted));};observableProto.subscribeOnNext = function(onNext, thisArg){return this._subscribe(observerCreate(arguments.length === 2?function(x){onNext.call(thisArg, x);}:onNext));};observableProto.subscribeOnError = function(onError, thisArg){return this._subscribe(observerCreate(null, arguments.length === 2?function(e){onError.call(thisArg, e);}:onError));};observableProto.subscribeOnCompleted = function(onCompleted, thisArg){return this._subscribe(observerCreate(null, null, arguments.length === 2?function(){onCompleted.call(thisArg);}:onCompleted));};return Observable;})();observableProto.observeOn = function(scheduler){var source=this;return new AnonymousObservable(function(observer){return source.subscribe(new ObserveOnObserver(scheduler, observer));}, source);};observableProto.subscribeOn = function(scheduler){var source=this;return new AnonymousObservable(function(observer){var m=new SingleAssignmentDisposable(), d=new SerialDisposable();d.setDisposable(m);m.setDisposable(scheduler.schedule(function(){d.setDisposable(new ScheduledDisposable(scheduler, source.subscribe(observer)));}));return d;}, source);};var observableFromPromise=Observable.fromPromise = function(promise){return observableDefer(function(){var subject=new Rx.AsyncSubject();promise.then(function(value){subject.onNext(value);subject.onCompleted();}, subject.onError.bind(subject));return subject;});};observableProto.toPromise = function(promiseCtor){promiseCtor || (promiseCtor = Rx.config.Promise);if(!promiseCtor){throw new TypeError("Promise type not provided nor in Rx.config.Promise");}var source=this;return new promiseCtor(function(resolve, reject){var value, hasValue=false;source.subscribe(function(v){value = v;hasValue = true;}, reject, function(){hasValue && resolve(value);});});};observableProto.toArray = function(){var source=this;return new AnonymousObservable(function(observer){var arr=[];return source.subscribe(function(x){arr.push(x);}, function(e){observer.onError(e);}, function(){observer.onNext(arr);observer.onCompleted();});}, source);};Observable.create = Observable.createWithDisposable = function(subscribe, parent){return new AnonymousObservable(subscribe, parent);};var observableDefer=Observable.defer = function(observableFactory){return new AnonymousObservable(function(observer){var result;try{result = observableFactory();}catch(e) {return observableThrow(e).subscribe(observer);}isPromise(result) && (result = observableFromPromise(result));return result.subscribe(observer);});};var observableEmpty=Observable.empty = function(scheduler){isScheduler(scheduler) || (scheduler = immediateScheduler);return new AnonymousObservable(function(observer){return scheduler.schedule(function(){observer.onCompleted();});});};var maxSafeInteger=Math.pow(2, 53) - 1;function StringIterable(str){this._s = s;}StringIterable.prototype[$iterator$] = function(){return new StringIterator(this._s);};function StringIterator(str){this._s = s;this._l = s.length;this._i = 0;}StringIterator.prototype[$iterator$] = function(){return this;};StringIterator.prototype.next = function(){if(this._i < this._l){var val=this._s.charAt(this._i++);return {done:false, value:val};}else {return doneEnumerator;}};function ArrayIterable(a){this._a = a;}ArrayIterable.prototype[$iterator$] = function(){return new ArrayIterator(this._a);};function ArrayIterator(a){this._a = a;this._l = toLength(a);this._i = 0;}ArrayIterator.prototype[$iterator$] = function(){return this;};ArrayIterator.prototype.next = function(){if(this._i < this._l){var val=this._a[this._i++];return {done:false, value:val};}else {return doneEnumerator;}};function numberIsFinite(value){return typeof value === "number" && root.isFinite(value);}function isNan(n){return n !== n;}function getIterable(o){var i=o[$iterator$], it;if(!i && typeof o === "string"){it = new StringIterable(o);return it[$iterator$]();}if(!i && o.length !== undefined){it = new ArrayIterable(o);return it[$iterator$]();}if(!i){throw new TypeError("Object is not iterable");}return o[$iterator$]();}function sign(value){var number=+value;if(number === 0){return number;}if(isNaN(number)){return number;}return number < 0?-1:1;}function toLength(o){var len=+o.length;if(isNaN(len)){return 0;}if(len === 0 || !numberIsFinite(len)){return len;}len = sign(len) * Math.floor(Math.abs(len));if(len <= 0){return 0;}if(len > maxSafeInteger){return maxSafeInteger;}return len;}var observableFrom=Observable.from = function(iterable, mapFn, thisArg, scheduler){if(iterable == null){throw new Error("iterable cannot be null.");}if(mapFn && !isFunction(mapFn)){throw new Error("mapFn when provided must be a function");}if(mapFn){var mapper=bindCallback(mapFn, thisArg, 2);}isScheduler(scheduler) || (scheduler = currentThreadScheduler);var list=Object(iterable), it=getIterable(list);return new AnonymousObservable(function(observer){var i=0;return scheduler.scheduleRecursive(function(self){var next;try{next = it.next();}catch(e) {observer.onError(e);return;}if(next.done){observer.onCompleted();return;}var result=next.value;if(mapper){try{result = mapper(result, i);}catch(e) {observer.onError(e);return;}}observer.onNext(result);i++;self();});});};var observableFromArray=Observable.fromArray = function(array, scheduler){isScheduler(scheduler) || (scheduler = currentThreadScheduler);return new AnonymousObservable(function(observer){var count=0, len=array.length;return scheduler.scheduleRecursive(function(self){if(count < len){observer.onNext(array[count++]);self();}else {observer.onCompleted();}});});};Observable.generate = function(initialState, condition, iterate, resultSelector, scheduler){isScheduler(scheduler) || (scheduler = currentThreadScheduler);return new AnonymousObservable(function(observer){var first=true, state=initialState;return scheduler.scheduleRecursive(function(self){var hasResult, result;try{if(first){first = false;}else {state = iterate(state);}hasResult = condition(state);if(hasResult){result = resultSelector(state);}}catch(exception) {observer.onError(exception);return;}if(hasResult){observer.onNext(result);self();}else {observer.onCompleted();}});});};function observableOf(scheduler, array){isScheduler(scheduler) || (scheduler = currentThreadScheduler);return new AnonymousObservable(function(observer){var count=0, len=array.length;return scheduler.scheduleRecursive(function(self){if(count < len){observer.onNext(array[count++]);self();}else {observer.onCompleted();}});});}Observable.of = function(){return observableOf(null, arguments);};Observable.ofWithScheduler = function(scheduler){return observableOf(scheduler, slice.call(arguments, 1));};var observableNever=Observable.never = function(){return new AnonymousObservable(function(){return disposableEmpty;});};Observable.pairs = function(obj, scheduler){scheduler || (scheduler = Rx.Scheduler.currentThread);return new AnonymousObservable(function(observer){var idx=0, keys=Object.keys(obj), len=keys.length;return scheduler.scheduleRecursive(function(self){if(idx < len){var key=keys[idx++];observer.onNext([key, obj[key]]);self();}else {observer.onCompleted();}});});};Observable.range = function(start, count, scheduler){isScheduler(scheduler) || (scheduler = currentThreadScheduler);return new AnonymousObservable(function(observer){return scheduler.scheduleRecursiveWithState(0, function(i, self){if(i < count){observer.onNext(start + i);self(i + 1);}else {observer.onCompleted();}});});};Observable.repeat = function(value, repeatCount, scheduler){isScheduler(scheduler) || (scheduler = currentThreadScheduler);return observableReturn(value, scheduler).repeat(repeatCount == null?-1:repeatCount);};var observableReturn=Observable["return"] = Observable.just = function(value, scheduler){isScheduler(scheduler) || (scheduler = immediateScheduler);return new AnonymousObservable(function(observer){return scheduler.schedule(function(){observer.onNext(value);observer.onCompleted();});});};Observable.returnValue = function(){return observableReturn.apply(null, arguments);};var observableThrow=Observable["throw"] = Observable.throwError = function(error, scheduler){isScheduler(scheduler) || (scheduler = immediateScheduler);return new AnonymousObservable(function(observer){return scheduler.schedule(function(){observer.onError(error);});});};Observable.throwException = function(){return Observable.throwError.apply(null, arguments);};Observable.using = function(resourceFactory, observableFactory){return new AnonymousObservable(function(observer){var disposable=disposableEmpty, resource, source;try{resource = resourceFactory();resource && (disposable = resource);source = observableFactory(resource);}catch(exception) {return new CompositeDisposable(observableThrow(exception).subscribe(observer), disposable);}return new CompositeDisposable(source.subscribe(observer), disposable);});};observableProto.amb = function(rightSource){var leftSource=this;return new AnonymousObservable(function(observer){var choice, leftChoice="L", rightChoice="R", leftSubscription=new SingleAssignmentDisposable(), rightSubscription=new SingleAssignmentDisposable();isPromise(rightSource) && (rightSource = observableFromPromise(rightSource));function choiceL(){if(!choice){choice = leftChoice;rightSubscription.dispose();}}function choiceR(){if(!choice){choice = rightChoice;leftSubscription.dispose();}}leftSubscription.setDisposable(leftSource.subscribe(function(left){choiceL();if(choice === leftChoice){observer.onNext(left);}}, function(err){choiceL();if(choice === leftChoice){observer.onError(err);}}, function(){choiceL();if(choice === leftChoice){observer.onCompleted();}}));rightSubscription.setDisposable(rightSource.subscribe(function(right){choiceR();if(choice === rightChoice){observer.onNext(right);}}, function(err){choiceR();if(choice === rightChoice){observer.onError(err);}}, function(){choiceR();if(choice === rightChoice){observer.onCompleted();}}));return new CompositeDisposable(leftSubscription, rightSubscription);});};Observable.amb = function(){var acc=observableNever(), items=argsOrArray(arguments, 0);function func(previous, current){return previous.amb(current);}for(var i=0, len=items.length; i < len; i++) {acc = func(acc, items[i]);}return acc;};function observableCatchHandler(source, handler){return new AnonymousObservable(function(observer){var d1=new SingleAssignmentDisposable(), subscription=new SerialDisposable();subscription.setDisposable(d1);d1.setDisposable(source.subscribe(observer.onNext.bind(observer), function(exception){var d, result;try{result = handler(exception);}catch(ex) {observer.onError(ex);return;}isPromise(result) && (result = observableFromPromise(result));d = new SingleAssignmentDisposable();subscription.setDisposable(d);d.setDisposable(result.subscribe(observer));}, observer.onCompleted.bind(observer)));return subscription;}, source);}observableProto["catch"] = observableProto.catchError = function(handlerOrSecond){return typeof handlerOrSecond === "function"?observableCatchHandler(this, handlerOrSecond):observableCatch([this, handlerOrSecond]);};observableProto.catchException = function(handlerOrSecond){return this.catchError(handlerOrSecond);};var observableCatch=Observable.catchError = Observable["catch"] = function(){return enumerableOf(argsOrArray(arguments, 0)).catchError();};Observable.catchException = function(){return observableCatch.apply(null, arguments);};observableProto.combineLatest = function(){var args=slice.call(arguments);if(Array.isArray(args[0])){args[0].unshift(this);}else {args.unshift(this);}return combineLatest.apply(this, args);};var combineLatest=Observable.combineLatest = function(){var args=slice.call(arguments), resultSelector=args.pop();if(Array.isArray(args[0])){args = args[0];}return new AnonymousObservable(function(observer){var falseFactory=function falseFactory(){return false;}, n=args.length, hasValue=arrayInitialize(n, falseFactory), hasValueAll=false, isDone=arrayInitialize(n, falseFactory), values=new Array(n);function next(i){var res;hasValue[i] = true;if(hasValueAll || (hasValueAll = hasValue.every(identity))){try{res = resultSelector.apply(null, values);}catch(ex) {observer.onError(ex);return;}observer.onNext(res);}else if(isDone.filter(function(x, j){return j !== i;}).every(identity)){observer.onCompleted();}}function done(i){isDone[i] = true;if(isDone.every(identity)){observer.onCompleted();}}var subscriptions=new Array(n);for(var idx=0; idx < n; idx++) {(function(i){var source=args[i], sad=new SingleAssignmentDisposable();isPromise(source) && (source = observableFromPromise(source));sad.setDisposable(source.subscribe(function(x){values[i] = x;next(i);}, function(e){observer.onError(e);}, function(){done(i);}));subscriptions[i] = sad;})(idx);}return new CompositeDisposable(subscriptions);}, this);};observableProto.concat = function(){var items=slice.call(arguments, 0);items.unshift(this);return observableConcat.apply(this, items);};var observableConcat=Observable.concat = function(){return enumerableOf(argsOrArray(arguments, 0)).concat();};observableProto.concatAll = function(){return this.merge(1);};observableProto.concatObservable = function(){return this.merge(1);};observableProto.merge = function(maxConcurrentOrOther){if(typeof maxConcurrentOrOther !== "number"){return observableMerge(this, maxConcurrentOrOther);}var sources=this;return new AnonymousObservable(function(o){var activeCount=0, group=new CompositeDisposable(), isStopped=false, q=[];function subscribe(xs){var subscription=new SingleAssignmentDisposable();group.add(subscription);isPromise(xs) && (xs = observableFromPromise(xs));subscription.setDisposable(xs.subscribe(function(x){o.onNext(x);}, function(e){o.onError(e);}, function(){group.remove(subscription);if(q.length > 0){subscribe(q.shift());}else {activeCount--;isStopped && activeCount === 0 && o.onCompleted();}}));}group.add(sources.subscribe(function(innerSource){if(activeCount < maxConcurrentOrOther){activeCount++;subscribe(innerSource);}else {q.push(innerSource);}}, function(e){o.onError(e);}, function(){isStopped = true;activeCount === 0 && o.onCompleted();}));return group;}, sources);};var observableMerge=Observable.merge = function(){var scheduler, sources;if(!arguments[0]){scheduler = immediateScheduler;sources = slice.call(arguments, 1);}else if(isScheduler(arguments[0])){scheduler = arguments[0];sources = slice.call(arguments, 1);}else {scheduler = immediateScheduler;sources = slice.call(arguments, 0);}if(Array.isArray(sources[0])){sources = sources[0];}return observableOf(scheduler, sources).mergeAll();};observableProto.mergeAll = function(){var sources=this;return new AnonymousObservable(function(o){var group=new CompositeDisposable(), isStopped=false, m=new SingleAssignmentDisposable();group.add(m);m.setDisposable(sources.subscribe(function(innerSource){var innerSubscription=new SingleAssignmentDisposable();group.add(innerSubscription);isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));innerSubscription.setDisposable(innerSource.subscribe(function(x){o.onNext(x);}, function(e){o.onError(e);}, function(){group.remove(innerSubscription);isStopped && group.length === 1 && o.onCompleted();}));}, function(e){o.onError(e);}, function(){isStopped = true;group.length === 1 && o.onCompleted();}));return group;}, sources);};observableProto.mergeObservable = function(){return this.mergeAll.apply(this, arguments);};observableProto.onErrorResumeNext = function(second){if(!second){throw new Error("Second observable is required");}return onErrorResumeNext([this, second]);};var onErrorResumeNext=Observable.onErrorResumeNext = function(){var sources=argsOrArray(arguments, 0);return new AnonymousObservable(function(observer){var pos=0, subscription=new SerialDisposable(), cancelable=immediateScheduler.scheduleRecursive(function(self){var current, d;if(pos < sources.length){current = sources[pos++];isPromise(current) && (current = observableFromPromise(current));d = new SingleAssignmentDisposable();subscription.setDisposable(d);d.setDisposable(current.subscribe(observer.onNext.bind(observer), self, self));}else {observer.onCompleted();}});return new CompositeDisposable(subscription, cancelable);});};observableProto.skipUntil = function(other){var source=this;return new AnonymousObservable(function(o){var isOpen=false;var disposables=new CompositeDisposable(source.subscribe(function(left){isOpen && o.onNext(left);}, function(e){o.onError(e);}, function(){isOpen && o.onCompleted();}));isPromise(other) && (other = observableFromPromise(other));var rightSubscription=new SingleAssignmentDisposable();disposables.add(rightSubscription);rightSubscription.setDisposable(other.subscribe(function(){isOpen = true;rightSubscription.dispose();}, function(e){o.onError(e);}, function(){rightSubscription.dispose();}));return disposables;}, source);};observableProto["switch"] = observableProto.switchLatest = function(){var sources=this;return new AnonymousObservable(function(observer){var hasLatest=false, innerSubscription=new SerialDisposable(), isStopped=false, latest=0, subscription=sources.subscribe(function(innerSource){var d=new SingleAssignmentDisposable(), id=++latest;hasLatest = true;innerSubscription.setDisposable(d);isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));d.setDisposable(innerSource.subscribe(function(x){latest === id && observer.onNext(x);}, function(e){latest === id && observer.onError(e);}, function(){if(latest === id){hasLatest = false;isStopped && observer.onCompleted();}}));}, observer.onError.bind(observer), function(){isStopped = true;!hasLatest && observer.onCompleted();});return new CompositeDisposable(subscription, innerSubscription);}, sources);};observableProto.takeUntil = function(other){var source=this;return new AnonymousObservable(function(o){isPromise(other) && (other = observableFromPromise(other));return new CompositeDisposable(source.subscribe(o), other.subscribe(function(){o.onCompleted();}, function(e){o.onError(e);}, noop));}, source);};observableProto.withLatestFrom = function(){var source=this;var args=slice.call(arguments);var resultSelector=args.pop();if(typeof source === "undefined"){throw new Error("Source observable not found for withLatestFrom().");}if(typeof resultSelector !== "function"){throw new Error("withLatestFrom() expects a resultSelector function.");}if(Array.isArray(args[0])){args = args[0];}return new AnonymousObservable(function(observer){var falseFactory=function falseFactory(){return false;}, n=args.length, hasValue=arrayInitialize(n, falseFactory), hasValueAll=false, values=new Array(n);var subscriptions=new Array(n + 1);for(var idx=0; idx < n; idx++) {(function(i){var other=args[i], sad=new SingleAssignmentDisposable();isPromise(other) && (other = observableFromPromise(other));sad.setDisposable(other.subscribe(function(x){values[i] = x;hasValue[i] = true;hasValueAll = hasValue.every(identity);}, observer.onError.bind(observer), function(){}));subscriptions[i] = sad;})(idx);}var sad=new SingleAssignmentDisposable();sad.setDisposable(source.subscribe(function(x){var res;var allValues=[x].concat(values);if(!hasValueAll)return;try{res = resultSelector.apply(null, allValues);}catch(ex) {observer.onError(ex);return;}observer.onNext(res);}, observer.onError.bind(observer), function(){observer.onCompleted();}));subscriptions[n] = sad;return new CompositeDisposable(subscriptions);}, this);};function zipArray(second, resultSelector){var first=this;return new AnonymousObservable(function(observer){var index=0, len=second.length;return first.subscribe(function(left){if(index < len){var right=second[index++], result;try{result = resultSelector(left, right);}catch(e) {observer.onError(e);return;}observer.onNext(result);}else {observer.onCompleted();}}, function(e){observer.onError(e);}, function(){observer.onCompleted();});}, first);}observableProto.zip = function(){if(Array.isArray(arguments[0])){return zipArray.apply(this, arguments);}var parent=this, sources=slice.call(arguments), resultSelector=sources.pop();sources.unshift(parent);return new AnonymousObservable(function(observer){var n=sources.length, queues=arrayInitialize(n, function(){return [];}), isDone=arrayInitialize(n, function(){return false;});function next(i){var res, queuedValues;if(queues.every(function(x){return x.length > 0;})){try{queuedValues = queues.map(function(x){return x.shift();});res = resultSelector.apply(parent, queuedValues);}catch(ex) {observer.onError(ex);return;}observer.onNext(res);}else if(isDone.filter(function(x, j){return j !== i;}).every(identity)){observer.onCompleted();}};function done(i){isDone[i] = true;if(isDone.every(function(x){return x;})){observer.onCompleted();}}var subscriptions=new Array(n);for(var idx=0; idx < n; idx++) {(function(i){var source=sources[i], sad=new SingleAssignmentDisposable();isPromise(source) && (source = observableFromPromise(source));sad.setDisposable(source.subscribe(function(x){queues[i].push(x);next(i);}, function(e){observer.onError(e);}, function(){done(i);}));subscriptions[i] = sad;})(idx);}return new CompositeDisposable(subscriptions);}, parent);};Observable.zip = function(){var args=slice.call(arguments, 0), first=args.shift();return first.zip.apply(first, args);};Observable.zipArray = function(){var sources=argsOrArray(arguments, 0);return new AnonymousObservable(function(observer){var n=sources.length, queues=arrayInitialize(n, function(){return [];}), isDone=arrayInitialize(n, function(){return false;});function next(i){if(queues.every(function(x){return x.length > 0;})){var res=queues.map(function(x){return x.shift();});observer.onNext(res);}else if(isDone.filter(function(x, j){return j !== i;}).every(identity)){observer.onCompleted();return;}};function done(i){isDone[i] = true;if(isDone.every(identity)){observer.onCompleted();return;}}var subscriptions=new Array(n);for(var idx=0; idx < n; idx++) {(function(i){subscriptions[i] = new SingleAssignmentDisposable();subscriptions[i].setDisposable(sources[i].subscribe(function(x){queues[i].push(x);next(i);}, function(e){observer.onError(e);}, function(){done(i);}));})(idx);}return new CompositeDisposable(subscriptions);});};observableProto.asObservable = function(){var source=this;return new AnonymousObservable(function(o){return source.subscribe(o);}, this);};observableProto.bufferWithCount = function(count, skip){if(typeof skip !== "number"){skip = count;}return this.windowWithCount(count, skip).selectMany(function(x){return x.toArray();}).where(function(x){return x.length > 0;});};observableProto.dematerialize = function(){var source=this;return new AnonymousObservable(function(o){return source.subscribe(function(x){return x.accept(o);}, function(e){o.onError(e);}, function(){o.onCompleted();});}, this);};observableProto.distinctUntilChanged = function(keySelector, comparer){var source=this;keySelector || (keySelector = identity);comparer || (comparer = defaultComparer);return new AnonymousObservable(function(o){var hasCurrentKey=false, currentKey;return source.subscribe(function(value){var comparerEquals=false, key;try{key = keySelector(value);}catch(e) {o.onError(e);return;}if(hasCurrentKey){try{comparerEquals = comparer(currentKey, key);}catch(e) {o.onError(e);return;}}if(!hasCurrentKey || !comparerEquals){hasCurrentKey = true;currentKey = key;o.onNext(value);}}, function(e){o.onError(e);}, function(){o.onCompleted();});}, this);};observableProto["do"] = observableProto.tap = function(observerOrOnNext, onError, onCompleted){var source=this, onNextFunc;if(typeof observerOrOnNext === "function"){onNextFunc = observerOrOnNext;}else {onNextFunc = function(x){observerOrOnNext.onNext(x);};onError = function(e){observerOrOnNext.onError(e);};onCompleted = function(){observerOrOnNext.onCompleted();};}return new AnonymousObservable(function(observer){return source.subscribe(function(x){try{onNextFunc(x);}catch(e) {observer.onError(e);}observer.onNext(x);}, function(err){if(onError){try{onError(err);}catch(e) {observer.onError(e);}}observer.onError(err);}, function(){if(onCompleted){try{onCompleted();}catch(e) {observer.onError(e);}}observer.onCompleted();});}, this);};observableProto.doAction = function(){return this.tap.apply(this, arguments);};observableProto.doOnNext = observableProto.tapOnNext = function(onNext, thisArg){return this.tap(typeof thisArg !== "undefined"?function(x){onNext.call(thisArg, x);}:onNext);};observableProto.doOnError = observableProto.tapOnError = function(onError, thisArg){return this.tap(noop, typeof thisArg !== "undefined"?function(e){onError.call(thisArg, e);}:onError);};observableProto.doOnCompleted = observableProto.tapOnCompleted = function(onCompleted, thisArg){return this.tap(noop, null, typeof thisArg !== "undefined"?function(){onCompleted.call(thisArg);}:onCompleted);};observableProto["finally"] = observableProto.ensure = function(action){var source=this;return new AnonymousObservable(function(observer){var subscription;try{subscription = source.subscribe(observer);}catch(e) {action();throw e;}return disposableCreate(function(){try{subscription.dispose();}catch(e) {throw e;}finally {action();}});}, this);};observableProto.finallyAction = function(action){return this.ensure(action);};observableProto.ignoreElements = function(){var source=this;return new AnonymousObservable(function(o){return source.subscribe(noop, function(e){o.onError(e);}, function(){o.onCompleted();});}, source);};observableProto.materialize = function(){var source=this;return new AnonymousObservable(function(observer){return source.subscribe(function(value){observer.onNext(notificationCreateOnNext(value));}, function(e){observer.onNext(notificationCreateOnError(e));observer.onCompleted();}, function(){observer.onNext(notificationCreateOnCompleted());observer.onCompleted();});}, source);};observableProto.repeat = function(repeatCount){return enumerableRepeat(this, repeatCount).concat();};observableProto.retry = function(retryCount){return enumerableRepeat(this, retryCount).catchError();};observableProto.retryWhen = function(notifier){return enumerableRepeat(this).catchErrorWhen(notifier);};observableProto.scan = function(){var hasSeed=false, seed, accumulator, source=this;if(arguments.length === 2){hasSeed = true;seed = arguments[0];accumulator = arguments[1];}else {accumulator = arguments[0];}return new AnonymousObservable(function(o){var hasAccumulation, accumulation, hasValue;return source.subscribe(function(x){!hasValue && (hasValue = true);try{if(hasAccumulation){accumulation = accumulator(accumulation, x);}else {accumulation = hasSeed?accumulator(seed, x):x;hasAccumulation = true;}}catch(e) {o.onError(e);return;}o.onNext(accumulation);}, function(e){o.onError(e);}, function(){!hasValue && hasSeed && o.onNext(seed);o.onCompleted();});}, source);};observableProto.skipLast = function(count){var source=this;return new AnonymousObservable(function(o){var q=[];return source.subscribe(function(x){q.push(x);q.length > count && o.onNext(q.shift());}, function(e){o.onError(e);}, function(){o.onCompleted();});}, source);};observableProto.startWith = function(){var values, scheduler, start=0;if(!!arguments.length && isScheduler(arguments[0])){scheduler = arguments[0];start = 1;}else {scheduler = immediateScheduler;}values = slice.call(arguments, start);return enumerableOf([observableFromArray(values, scheduler), this]).concat();};observableProto.takeLast = function(count){var source=this;return new AnonymousObservable(function(o){var q=[];return source.subscribe(function(x){q.push(x);q.length > count && q.shift();}, function(e){o.onError(e);}, function(){while(q.length > 0) {o.onNext(q.shift());}o.onCompleted();});}, source);};observableProto.takeLastBuffer = function(count){var source=this;return new AnonymousObservable(function(o){var q=[];return source.subscribe(function(x){q.push(x);q.length > count && q.shift();}, function(e){o.onError(e);}, function(){o.onNext(q);o.onCompleted();});}, source);};observableProto.windowWithCount = function(count, skip){var source=this;+count || (count = 0);Math.abs(count) === Infinity && (count = 0);if(count <= 0){throw new Error(argumentOutOfRange);}skip == null && (skip = count);+skip || (skip = 0);Math.abs(skip) === Infinity && (skip = 0);if(skip <= 0){throw new Error(argumentOutOfRange);}return new AnonymousObservable(function(observer){var m=new SingleAssignmentDisposable(), refCountDisposable=new RefCountDisposable(m), n=0, q=[];function createWindow(){var s=new Subject();q.push(s);observer.onNext(addRef(s, refCountDisposable));}createWindow();m.setDisposable(source.subscribe(function(x){for(var i=0, len=q.length; i < len; i++) {q[i].onNext(x);}var c=n - count + 1;c >= 0 && c % skip === 0 && q.shift().onCompleted();++n % skip === 0 && createWindow();}, function(e){while(q.length > 0) {q.shift().onError(e);}observer.onError(e);}, function(){while(q.length > 0) {q.shift().onCompleted();}observer.onCompleted();}));return refCountDisposable;}, source);};function concatMap(source, selector, thisArg){var selectorFunc=bindCallback(selector, thisArg, 3);return source.map(function(x, i){var result=selectorFunc(x, i, source);isPromise(result) && (result = observableFromPromise(result));(isArrayLike(result) || isIterable(result)) && (result = observableFrom(result));return result;}).concatAll();}observableProto.selectConcat = observableProto.concatMap = function(selector, resultSelector, thisArg){if(isFunction(selector) && isFunction(resultSelector)){return this.concatMap(function(x, i){var selectorResult=selector(x, i);isPromise(selectorResult) && (selectorResult = observableFromPromise(selectorResult));(isArrayLike(selectorResult) || isIterable(selectorResult)) && (selectorResult = observableFrom(selectorResult));return selectorResult.map(function(y, i2){return resultSelector(x, y, i, i2);});});}return isFunction(selector)?concatMap(this, selector, thisArg):concatMap(this, function(){return selector;});};observableProto.concatMapObserver = observableProto.selectConcatObserver = function(onNext, onError, onCompleted, thisArg){var source=this, onNextFunc=bindCallback(onNext, thisArg, 2), onErrorFunc=bindCallback(onError, thisArg, 1), onCompletedFunc=bindCallback(onCompleted, thisArg, 0);return new AnonymousObservable(function(observer){var index=0;return source.subscribe(function(x){var result;try{result = onNextFunc(x, index++);}catch(e) {observer.onError(e);return;}isPromise(result) && (result = observableFromPromise(result));observer.onNext(result);}, function(err){var result;try{result = onErrorFunc(err);}catch(e) {observer.onError(e);return;}isPromise(result) && (result = observableFromPromise(result));observer.onNext(result);observer.onCompleted();}, function(){var result;try{result = onCompletedFunc();}catch(e) {observer.onError(e);return;}isPromise(result) && (result = observableFromPromise(result));observer.onNext(result);observer.onCompleted();});}, this).concatAll();};observableProto.defaultIfEmpty = function(defaultValue){var source=this;defaultValue === undefined && (defaultValue = null);return new AnonymousObservable(function(observer){var found=false;return source.subscribe(function(x){found = true;observer.onNext(x);}, function(e){observer.onError(e);}, function(){!found && observer.onNext(defaultValue);observer.onCompleted();});}, source);};function arrayIndexOfComparer(array, item, comparer){for(var i=0, len=array.length; i < len; i++) {if(comparer(array[i], item)){return i;}}return -1;}function HashSet(comparer){this.comparer = comparer;this.set = [];}HashSet.prototype.push = function(value){var retValue=arrayIndexOfComparer(this.set, value, this.comparer) === -1;retValue && this.set.push(value);return retValue;};observableProto.distinct = function(keySelector, comparer){var source=this;comparer || (comparer = defaultComparer);return new AnonymousObservable(function(o){var hashSet=new HashSet(comparer);return source.subscribe(function(x){var key=x;if(keySelector){try{key = keySelector(x);}catch(e) {o.onError(e);return;}}hashSet.push(key) && o.onNext(x);}, function(e){o.onError(e);}, function(){o.onCompleted();});}, this);};observableProto.groupBy = function(keySelector, elementSelector, comparer){return this.groupByUntil(keySelector, elementSelector, observableNever, comparer);};observableProto.groupByUntil = function(keySelector, elementSelector, durationSelector, comparer){var source=this;elementSelector || (elementSelector = identity);comparer || (comparer = defaultComparer);return new AnonymousObservable(function(observer){function handleError(e){return function(item){item.onError(e);};}var map=new Dictionary(0, comparer), groupDisposable=new CompositeDisposable(), refCountDisposable=new RefCountDisposable(groupDisposable);groupDisposable.add(source.subscribe(function(x){var key;try{key = keySelector(x);}catch(e) {map.getValues().forEach(handleError(e));observer.onError(e);return;}var fireNewMapEntry=false, writer=map.tryGetValue(key);if(!writer){writer = new Subject();map.set(key, writer);fireNewMapEntry = true;}if(fireNewMapEntry){var group=new GroupedObservable(key, writer, refCountDisposable), durationGroup=new GroupedObservable(key, writer);try{duration = durationSelector(durationGroup);}catch(e) {map.getValues().forEach(handleError(e));observer.onError(e);return;}observer.onNext(group);var md=new SingleAssignmentDisposable();groupDisposable.add(md);var expire=function expire(){map.remove(key) && writer.onCompleted();groupDisposable.remove(md);};md.setDisposable(duration.take(1).subscribe(noop, function(exn){map.getValues().forEach(handleError(exn));observer.onError(exn);}, expire));}var element;try{element = elementSelector(x);}catch(e) {map.getValues().forEach(handleError(e));observer.onError(e);return;}writer.onNext(element);}, function(ex){map.getValues().forEach(handleError(ex));observer.onError(ex);}, function(){map.getValues().forEach(function(item){item.onCompleted();});observer.onCompleted();}));return refCountDisposable;}, source);};observableProto.select = observableProto.map = function(selector, thisArg){var selectorFn=isFunction(selector)?bindCallback(selector, thisArg, 3):function(){return selector;}, source=this;return new AnonymousObservable(function(o){var count=0;return source.subscribe(function(value){try{var result=selectorFn(value, count++, source);}catch(e) {o.onError(e);return;}o.onNext(result);}, function(e){o.onError(e);}, function(){o.onCompleted();});}, source);};observableProto.pluck = function(prop){return this.map(function(x){return x[prop];});};function flatMap(source, selector, thisArg){var selectorFunc=bindCallback(selector, thisArg, 3);return source.map(function(x, i){var result=selectorFunc(x, i, source);isPromise(result) && (result = observableFromPromise(result));(isArrayLike(result) || isIterable(result)) && (result = observableFrom(result));return result;}).mergeAll();}observableProto.selectMany = observableProto.flatMap = function(selector, resultSelector, thisArg){if(isFunction(selector) && isFunction(resultSelector)){return this.flatMap(function(x, i){var selectorResult=selector(x, i);isPromise(selectorResult) && (selectorResult = observableFromPromise(selectorResult));(isArrayLike(selectorResult) || isIterable(selectorResult)) && (selectorResult = observableFrom(selectorResult));return selectorResult.map(function(y, i2){return resultSelector(x, y, i, i2);});}, thisArg);}return isFunction(selector)?flatMap(this, selector, thisArg):flatMap(this, function(){return selector;});};observableProto.flatMapObserver = observableProto.selectManyObserver = function(onNext, onError, onCompleted, thisArg){var source=this;return new AnonymousObservable(function(observer){var index=0;return source.subscribe(function(x){var result;try{result = onNext.call(thisArg, x, index++);}catch(e) {observer.onError(e);return;}isPromise(result) && (result = observableFromPromise(result));observer.onNext(result);}, function(err){var result;try{result = onError.call(thisArg, err);}catch(e) {observer.onError(e);return;}isPromise(result) && (result = observableFromPromise(result));observer.onNext(result);observer.onCompleted();}, function(){var result;try{result = onCompleted.call(thisArg);}catch(e) {observer.onError(e);return;}isPromise(result) && (result = observableFromPromise(result));observer.onNext(result);observer.onCompleted();});}, source).mergeAll();};observableProto.selectSwitch = observableProto.flatMapLatest = observableProto.switchMap = function(selector, thisArg){return this.select(selector, thisArg).switchLatest();};observableProto.skip = function(count){if(count < 0){throw new Error(argumentOutOfRange);}var source=this;return new AnonymousObservable(function(o){var remaining=count;return source.subscribe(function(x){if(remaining <= 0){o.onNext(x);}else {remaining--;}}, function(e){o.onError(e);}, function(){o.onCompleted();});}, source);};observableProto.skipWhile = function(predicate, thisArg){var source=this, callback=bindCallback(predicate, thisArg, 3);return new AnonymousObservable(function(o){var i=0, running=false;return source.subscribe(function(x){if(!running){try{running = !callback(x, i++, source);}catch(e) {o.onError(e);return;}}running && o.onNext(x);}, function(e){o.onError(e);}, function(){o.onCompleted();});}, source);};observableProto.take = function(count, scheduler){if(count < 0){throw new RangeError(argumentOutOfRange);}if(count === 0){return observableEmpty(scheduler);}var source=this;return new AnonymousObservable(function(o){var remaining=count;return source.subscribe(function(x){if(remaining-- > 0){o.onNext(x);remaining === 0 && o.onCompleted();}}, function(e){o.onError(e);}, function(){o.onCompleted();});}, source);};observableProto.takeWhile = function(predicate, thisArg){var source=this, callback=bindCallback(predicate, thisArg, 3);return new AnonymousObservable(function(o){var i=0, running=true;return source.subscribe(function(x){if(running){try{running = callback(x, i++, source);}catch(e) {o.onError(e);return;}if(running){o.onNext(x);}else {o.onCompleted();}}}, function(e){o.onError(e);}, function(){o.onCompleted();});}, source);};observableProto.where = observableProto.filter = function(predicate, thisArg){var source=this;predicate = bindCallback(predicate, thisArg, 3);return new AnonymousObservable(function(o){var count=0;return source.subscribe(function(value){try{var shouldRun=predicate(value, count++, source);}catch(e) {o.onError(e);return;}shouldRun && o.onNext(value);}, function(e){o.onError(e);}, function(){o.onCompleted();});}, source);};function extremaBy(source, keySelector, comparer){return new AnonymousObservable(function(o){var hasValue=false, lastKey=null, list=[];return source.subscribe(function(x){var comparison, key;try{key = keySelector(x);}catch(ex) {o.onError(ex);return;}comparison = 0;if(!hasValue){hasValue = true;lastKey = key;}else {try{comparison = comparer(key, lastKey);}catch(ex1) {o.onError(ex1);return;}}if(comparison > 0){lastKey = key;list = [];}if(comparison >= 0){list.push(x);}}, function(e){o.onError(e);}, function(){o.onNext(list);o.onCompleted();});}, source);}function firstOnly(x){if(x.length === 0){throw new Error(sequenceContainsNoElements);}return x[0];}observableProto.aggregate = function(){var hasSeed=false, accumulator, seed, source=this;if(arguments.length === 2){hasSeed = true;seed = arguments[0];accumulator = arguments[1];}else {accumulator = arguments[0];}return new AnonymousObservable(function(o){var hasAccumulation, accumulation, hasValue;return source.subscribe(function(x){!hasValue && (hasValue = true);try{if(hasAccumulation){accumulation = accumulator(accumulation, x);}else {accumulation = hasSeed?accumulator(seed, x):x;hasAccumulation = true;}}catch(e) {o.onError(e);return;}}, function(e){o.onError(e);}, function(){hasValue && o.onNext(accumulation);!hasValue && hasSeed && o.onNext(seed);!hasValue && !hasSeed && o.onError(new Error(sequenceContainsNoElements));o.onCompleted();});}, source);};observableProto.reduce = function(accumulator){var hasSeed=false, seed, source=this;if(arguments.length === 2){hasSeed = true;seed = arguments[1];}return new AnonymousObservable(function(o){var hasAccumulation, accumulation, hasValue;return source.subscribe(function(x){!hasValue && (hasValue = true);try{if(hasAccumulation){accumulation = accumulator(accumulation, x);}else {accumulation = hasSeed?accumulator(seed, x):x;hasAccumulation = true;}}catch(e) {o.onError(e);return;}}, function(e){o.onError(e);}, function(){hasValue && o.onNext(accumulation);!hasValue && hasSeed && o.onNext(seed);!hasValue && !hasSeed && o.onError(new Error(sequenceContainsNoElements));o.onCompleted();});}, source);};observableProto.some = function(predicate, thisArg){var source=this;return predicate?source.filter(predicate, thisArg).some():new AnonymousObservable(function(observer){return source.subscribe(function(){observer.onNext(true);observer.onCompleted();}, function(e){observer.onError(e);}, function(){observer.onNext(false);observer.onCompleted();});}, source);};observableProto.any = function(){return this.some.apply(this, arguments);};observableProto.isEmpty = function(){return this.any().map(not);};observableProto.every = function(predicate, thisArg){return this.filter(function(v){return !predicate(v);}, thisArg).some().map(not);};observableProto.all = function(){return this.every.apply(this, arguments);};observableProto.contains = function(searchElement, fromIndex){var source=this;function comparer(a, b){return a === 0 && b === 0 || (a === b || isNaN(a) && isNaN(b));}return new AnonymousObservable(function(o){var i=0, n=+fromIndex || 0;Math.abs(n) === Infinity && (n = 0);if(n < 0){o.onNext(false);o.onCompleted();return disposableEmpty;}return source.subscribe(function(x){if(i++ >= n && comparer(x, searchElement)){o.onNext(true);o.onCompleted();}}, function(e){o.onError(e);}, function(){o.onNext(false);o.onCompleted();});}, this);};observableProto.count = function(predicate, thisArg){return predicate?this.filter(predicate, thisArg).count():this.reduce(function(count){return count + 1;}, 0);};observableProto.indexOf = function(searchElement, fromIndex){var source=this;return new AnonymousObservable(function(o){var i=0, n=+fromIndex || 0;Math.abs(n) === Infinity && (n = 0);if(n < 0){o.onNext(-1);o.onCompleted();return disposableEmpty;}return source.subscribe(function(x){if(i >= n && x === searchElement){o.onNext(i);o.onCompleted();}i++;}, function(e){o.onError(e);}, function(){o.onNext(-1);o.onCompleted();});}, source);};observableProto.sum = function(keySelector, thisArg){return keySelector && isFunction(keySelector)?this.map(keySelector, thisArg).sum():this.reduce(function(prev, curr){return prev + curr;}, 0);};observableProto.minBy = function(keySelector, comparer){comparer || (comparer = defaultSubComparer);return extremaBy(this, keySelector, function(x, y){return comparer(x, y) * -1;});};observableProto.min = function(comparer){return this.minBy(identity, comparer).map(function(x){return firstOnly(x);});};observableProto.maxBy = function(keySelector, comparer){comparer || (comparer = defaultSubComparer);return extremaBy(this, keySelector, comparer);};observableProto.max = function(comparer){return this.maxBy(identity, comparer).map(function(x){return firstOnly(x);});};observableProto.average = function(keySelector, thisArg){return keySelector && isFunction(keySelector)?this.map(keySelector, thisArg).average():this.reduce(function(prev, cur){return {sum:prev.sum + cur, count:prev.count + 1};}, {sum:0, count:0}).map(function(s){if(s.count === 0){throw new Error(sequenceContainsNoElements);}return s.sum / s.count;});};observableProto.sequenceEqual = function(second, comparer){var first=this;comparer || (comparer = defaultComparer);return new AnonymousObservable(function(o){var donel=false, doner=false, ql=[], qr=[];var subscription1=first.subscribe(function(x){var equal, v;if(qr.length > 0){v = qr.shift();try{equal = comparer(v, x);}catch(e) {o.onError(e);return;}if(!equal){o.onNext(false);o.onCompleted();}}else if(doner){o.onNext(false);o.onCompleted();}else {ql.push(x);}}, function(e){o.onError(e);}, function(){donel = true;if(ql.length === 0){if(qr.length > 0){o.onNext(false);o.onCompleted();}else if(doner){o.onNext(true);o.onCompleted();}}});(isArrayLike(second) || isIterable(second)) && (second = observableFrom(second));isPromise(second) && (second = observableFromPromise(second));var subscription2=second.subscribe(function(x){var equal;if(ql.length > 0){var v=ql.shift();try{equal = comparer(v, x);}catch(exception) {o.onError(exception);return;}if(!equal){o.onNext(false);o.onCompleted();}}else if(donel){o.onNext(false);o.onCompleted();}else {qr.push(x);}}, function(e){o.onError(e);}, function(){doner = true;if(qr.length === 0){if(ql.length > 0){o.onNext(false);o.onCompleted();}else if(donel){o.onNext(true);o.onCompleted();}}});return new CompositeDisposable(subscription1, subscription2);}, first);};function elementAtOrDefault(source, index, hasDefault, defaultValue){if(index < 0){throw new Error(argumentOutOfRange);}return new AnonymousObservable(function(o){var i=index;return source.subscribe(function(x){if(i-- === 0){o.onNext(x);o.onCompleted();}}, function(e){o.onError(e);}, function(){if(!hasDefault){o.onError(new Error(argumentOutOfRange));}else {o.onNext(defaultValue);o.onCompleted();}});}, source);}observableProto.elementAt = function(index){return elementAtOrDefault(this, index, false);};observableProto.elementAtOrDefault = function(index, defaultValue){return elementAtOrDefault(this, index, true, defaultValue);};function singleOrDefaultAsync(source, hasDefault, defaultValue){return new AnonymousObservable(function(o){var value=defaultValue, seenValue=false;return source.subscribe(function(x){if(seenValue){o.onError(new Error("Sequence contains more than one element"));}else {value = x;seenValue = true;}}, function(e){o.onError(e);}, function(){if(!seenValue && !hasDefault){o.onError(new Error(sequenceContainsNoElements));}else {o.onNext(value);o.onCompleted();}});}, source);}observableProto.single = function(predicate, thisArg){return predicate && isFunction(predicate)?this.where(predicate, thisArg).single():singleOrDefaultAsync(this, false);};observableProto.singleOrDefault = function(predicate, defaultValue, thisArg){return predicate && isFunction(predicate)?this.filter(predicate, thisArg).singleOrDefault(null, defaultValue):singleOrDefaultAsync(this, true, defaultValue);};function firstOrDefaultAsync(source, hasDefault, defaultValue){return new AnonymousObservable(function(o){return source.subscribe(function(x){o.onNext(x);o.onCompleted();}, function(e){o.onError(e);}, function(){if(!hasDefault){o.onError(new Error(sequenceContainsNoElements));}else {o.onNext(defaultValue);o.onCompleted();}});}, source);}observableProto.first = function(predicate, thisArg){return predicate?this.where(predicate, thisArg).first():firstOrDefaultAsync(this, false);};observableProto.firstOrDefault = function(predicate, defaultValue, thisArg){return predicate?this.where(predicate).firstOrDefault(null, defaultValue):firstOrDefaultAsync(this, true, defaultValue);};function lastOrDefaultAsync(source, hasDefault, defaultValue){return new AnonymousObservable(function(o){var value=defaultValue, seenValue=false;return source.subscribe(function(x){value = x;seenValue = true;}, function(e){o.onError(e);}, function(){if(!seenValue && !hasDefault){o.onError(new Error(sequenceContainsNoElements));}else {o.onNext(value);o.onCompleted();}});}, source);}observableProto.last = function(predicate, thisArg){return predicate?this.where(predicate, thisArg).last():lastOrDefaultAsync(this, false);};observableProto.lastOrDefault = function(predicate, defaultValue, thisArg){return predicate?this.where(predicate, thisArg).lastOrDefault(null, defaultValue):lastOrDefaultAsync(this, true, defaultValue);};function findValue(source, predicate, thisArg, yieldIndex){var callback=bindCallback(predicate, thisArg, 3);return new AnonymousObservable(function(o){var i=0;return source.subscribe(function(x){var shouldRun;try{shouldRun = callback(x, i, source);}catch(e) {o.onError(e);return;}if(shouldRun){o.onNext(yieldIndex?i:x);o.onCompleted();}else {i++;}}, function(e){o.onError(e);}, function(){o.onNext(yieldIndex?-1:undefined);o.onCompleted();});}, source);}observableProto.find = function(predicate, thisArg){return findValue(this, predicate, thisArg, false);};observableProto.findIndex = function(predicate, thisArg){return findValue(this, predicate, thisArg, true);};observableProto.toSet = function(){if(typeof root.Set === "undefined"){throw new TypeError();}var source=this;return new AnonymousObservable(function(o){var s=new root.Set();return source.subscribe(function(x){s.add(x);}, function(e){o.onError(e);}, function(){o.onNext(s);o.onCompleted();});}, source);};observableProto.toMap = function(keySelector, elementSelector){if(typeof root.Map === "undefined"){throw new TypeError();}var source=this;return new AnonymousObservable(function(o){var m=new root.Map();return source.subscribe(function(x){var key;try{key = keySelector(x);}catch(e) {o.onError(e);return;}var element=x;if(elementSelector){try{element = elementSelector(x);}catch(e) {o.onError(e);return;}}m.set(key, element);}, function(e){o.onError(e);}, function(){o.onNext(m);o.onCompleted();});}, source);};var fnString="function", throwString="throw", isObject=Rx.internals.isObject;function toThunk(obj, ctx){if(Array.isArray(obj)){return objectToThunk.call(ctx, obj);}if(isGeneratorFunction(obj)){return observableSpawn(obj.call(ctx));}if(isGenerator(obj)){return observableSpawn(obj);}if(isObservable(obj)){return observableToThunk(obj);}if(isPromise(obj)){return promiseToThunk(obj);}if(typeof obj === fnString){return obj;}if(isObject(obj) || Array.isArray(obj)){return objectToThunk.call(ctx, obj);}return obj;}function objectToThunk(obj){var ctx=this;return function(done){var keys=Object.keys(obj), pending=keys.length, results=new obj.constructor(), finished;if(!pending){timeoutScheduler.schedule(function(){done(null, results);});return;}for(var i=0, len=keys.length; i < len; i++) {run(obj[keys[i]], keys[i]);}function run(fn, key){if(finished){return;}try{fn = toThunk(fn, ctx);if(typeof fn !== fnString){results[key] = fn;return --pending || done(null, results);}fn.call(ctx, function(err, res){if(finished){return;}if(err){finished = true;return done(err);}results[key] = res;--pending || done(null, results);});}catch(e) {finished = true;done(e);}}};}function observableToThunk(observable){return function(fn){var value, hasValue=false;observable.subscribe(function(v){value = v;hasValue = true;}, fn, function(){hasValue && fn(null, value);});};}function promiseToThunk(promise){return function(fn){promise.then(function(res){fn(null, res);}, fn);};}function isObservable(obj){return obj && typeof obj.subscribe === fnString;}function isGeneratorFunction(obj){return obj && obj.constructor && obj.constructor.name === "GeneratorFunction";}function isGenerator(obj){return obj && typeof obj.next === fnString && typeof obj[throwString] === fnString;}var observableSpawn=Rx.spawn = function(fn){var isGenFun=isGeneratorFunction(fn);return function(done){var ctx=this, gen=fn;if(isGenFun){var args=slice.call(arguments), len=args.length, hasCallback=len && typeof args[len - 1] === fnString;done = hasCallback?args.pop():handleError;gen = fn.apply(this, args);}else {done = done || handleError;}next();function exit(err, res){timeoutScheduler.schedule(done.bind(ctx, err, res));}function next(err, res){var ret;if(arguments.length > 2){res = slice.call(arguments, 1);}if(err){try{ret = gen[throwString](err);}catch(e) {return exit(e);}}if(!err){try{ret = gen.next(res);}catch(e) {return exit(e);}}if(ret.done){return exit(null, ret.value);}ret.value = toThunk(ret.value, ctx);if(typeof ret.value === fnString){var called=false;try{ret.value.call(ctx, function(){if(called){return;}called = true;next.apply(ctx, arguments);});}catch(e) {timeoutScheduler.schedule(function(){if(called){return;}called = true;next.call(ctx, e);});}return;}next(new TypeError("Rx.spawn only supports a function, Promise, Observable, Object or Array."));}};};function handleError(err){if(!err){return;}timeoutScheduler.schedule(function(){throw err;});}Observable.start = function(func, context, scheduler){return observableToAsync(func, context, scheduler)();};var observableToAsync=Observable.toAsync = function(func, context, scheduler){isScheduler(scheduler) || (scheduler = timeoutScheduler);return function(){var args=arguments, subject=new AsyncSubject();scheduler.schedule(function(){var result;try{result = func.apply(context, args);}catch(e) {subject.onError(e);return;}subject.onNext(result);subject.onCompleted();});return subject.asObservable();};};Observable.fromCallback = function(func, context, selector){return function(){var args=slice.call(arguments, 0);return new AnonymousObservable(function(observer){function handler(){var results=arguments;if(selector){try{results = selector(results);}catch(err) {observer.onError(err);return;}observer.onNext(results);}else {if(results.length <= 1){observer.onNext.apply(observer, results);}else {observer.onNext(results);}}observer.onCompleted();}args.push(handler);func.apply(context, args);}).publishLast().refCount();};};Observable.fromNodeCallback = function(func, context, selector){return function(){var args=slice.call(arguments, 0);return new AnonymousObservable(function(observer){function handler(err){if(err){observer.onError(err);return;}var results=slice.call(arguments, 1);if(selector){try{results = selector(results);}catch(e) {observer.onError(e);return;}observer.onNext(results);}else {if(results.length <= 1){observer.onNext.apply(observer, results);}else {observer.onNext(results);}}observer.onCompleted();}args.push(handler);func.apply(context, args);}).publishLast().refCount();};};function createListener(element, name, handler){if(element.addEventListener){element.addEventListener(name, handler, false);return disposableCreate(function(){element.removeEventListener(name, handler, false);});}throw new Error("No listener found");}function createEventListener(el, eventName, handler){var disposables=new CompositeDisposable();if(Object.prototype.toString.call(el) === "[object NodeList]"){for(var i=0, len=el.length; i < len; i++) {disposables.add(createEventListener(el.item(i), eventName, handler));}}else if(el){disposables.add(createListener(el, eventName, handler));}return disposables;}Rx.config.useNativeEvents = false;Observable.fromEvent = function(element, eventName, selector){if(element.addListener){return fromEventPattern(function(h){element.addListener(eventName, h);}, function(h){element.removeListener(eventName, h);}, selector);}if(!Rx.config.useNativeEvents){if(typeof element.on === "function" && typeof element.off === "function"){return fromEventPattern(function(h){element.on(eventName, h);}, function(h){element.off(eventName, h);}, selector);}if(!!root.Ember && typeof root.Ember.addListener === "function"){return fromEventPattern(function(h){Ember.addListener(element, eventName, h);}, function(h){Ember.removeListener(element, eventName, h);}, selector);}}return new AnonymousObservable(function(observer){return createEventListener(element, eventName, function handler(e){var results=e;if(selector){try{results = selector(arguments);}catch(err) {observer.onError(err);return;}}observer.onNext(results);});}).publish().refCount();};var fromEventPattern=Observable.fromEventPattern = function(addHandler, removeHandler, selector){return new AnonymousObservable(function(observer){function innerHandler(e){var result=e;if(selector){try{result = selector(arguments);}catch(err) {observer.onError(err);return;}}observer.onNext(result);}var returnValue=addHandler(innerHandler);return disposableCreate(function(){if(removeHandler){removeHandler(innerHandler, returnValue);}});}).publish().refCount();};Observable.startAsync = function(functionAsync){var promise;try{promise = functionAsync();}catch(e) {return observableThrow(e);}return observableFromPromise(promise);};var PausableObservable=(function(__super__){inherits(PausableObservable, __super__);function subscribe(observer){var conn=this.source.publish(), subscription=conn.subscribe(observer), connection=disposableEmpty;var pausable=this.pauser.distinctUntilChanged().subscribe(function(b){if(b){connection = conn.connect();}else {connection.dispose();connection = disposableEmpty;}});return new CompositeDisposable(subscription, connection, pausable);}function PausableObservable(source, pauser){this.source = source;this.controller = new Subject();if(pauser && pauser.subscribe){this.pauser = this.controller.merge(pauser);}else {this.pauser = this.controller;}__super__.call(this, subscribe, source);}PausableObservable.prototype.pause = function(){this.controller.onNext(false);};PausableObservable.prototype.resume = function(){this.controller.onNext(true);};return PausableObservable;})(Observable);observableProto.pausable = function(pauser){return new PausableObservable(this, pauser);};function combineLatestSource(source, subject, resultSelector){return new AnonymousObservable(function(o){var hasValue=[false, false], hasValueAll=false, isDone=false, values=new Array(2), err;function next(x, i){values[i] = x;var res;hasValue[i] = true;if(hasValueAll || (hasValueAll = hasValue.every(identity))){if(err){o.onError(err);return;}try{res = resultSelector.apply(null, values);}catch(ex) {o.onError(ex);return;}o.onNext(res);}if(isDone && values[1]){o.onCompleted();}}return new CompositeDisposable(source.subscribe(function(x){next(x, 0);}, function(e){if(values[1]){o.onError(e);}else {err = e;}}, function(){isDone = true;values[1] && o.onCompleted();}), subject.subscribe(function(x){next(x, 1);}, function(e){o.onError(e);}, function(){isDone = true;next(true, 1);}));}, source);}var PausableBufferedObservable=(function(__super__){inherits(PausableBufferedObservable, __super__);function subscribe(o){var q=[], previousShouldFire;var subscription=combineLatestSource(this.source, this.pauser.distinctUntilChanged().startWith(false), function(data, shouldFire){return {data:data, shouldFire:shouldFire};}).subscribe(function(results){if(previousShouldFire !== undefined && results.shouldFire != previousShouldFire){previousShouldFire = results.shouldFire;if(results.shouldFire){while(q.length > 0) {o.onNext(q.shift());}}}else {previousShouldFire = results.shouldFire;if(results.shouldFire){o.onNext(results.data);}else {q.push(results.data);}}}, function(err){while(q.length > 0) {o.onNext(q.shift());}o.onError(err);}, function(){while(q.length > 0) {o.onNext(q.shift());}o.onCompleted();});return subscription;}function PausableBufferedObservable(source, pauser){this.source = source;this.controller = new Subject();if(pauser && pauser.subscribe){this.pauser = this.controller.merge(pauser);}else {this.pauser = this.controller;}__super__.call(this, subscribe, source);}PausableBufferedObservable.prototype.pause = function(){this.controller.onNext(false);};PausableBufferedObservable.prototype.resume = function(){this.controller.onNext(true);};return PausableBufferedObservable;})(Observable);observableProto.pausableBuffered = function(subject){return new PausableBufferedObservable(this, subject);};var ControlledObservable=(function(__super__){inherits(ControlledObservable, __super__);function subscribe(observer){return this.source.subscribe(observer);}function ControlledObservable(source, enableQueue){__super__.call(this, subscribe, source);this.subject = new ControlledSubject(enableQueue);this.source = source.multicast(this.subject).refCount();}ControlledObservable.prototype.request = function(numberOfItems){if(numberOfItems == null){numberOfItems = -1;}return this.subject.request(numberOfItems);};return ControlledObservable;})(Observable);var ControlledSubject=(function(__super__){function subscribe(observer){return this.subject.subscribe(observer);}inherits(ControlledSubject, __super__);function ControlledSubject(enableQueue){enableQueue == null && (enableQueue = true);__super__.call(this, subscribe);this.subject = new Subject();this.enableQueue = enableQueue;this.queue = enableQueue?[]:null;this.requestedCount = 0;this.requestedDisposable = disposableEmpty;this.error = null;this.hasFailed = false;this.hasCompleted = false;this.controlledDisposable = disposableEmpty;}addProperties(ControlledSubject.prototype, Observer, {onCompleted:function onCompleted(){this.hasCompleted = true;(!this.enableQueue || this.queue.length === 0) && this.subject.onCompleted();}, onError:function onError(error){this.hasFailed = true;this.error = error;(!this.enableQueue || this.queue.length === 0) && this.subject.onError(error);}, onNext:function onNext(value){var hasRequested=false;if(this.requestedCount === 0){this.enableQueue && this.queue.push(value);}else {this.requestedCount !== -1 && this.requestedCount-- === 0 && this.disposeCurrentRequest();hasRequested = true;}hasRequested && this.subject.onNext(value);}, _processRequest:function _processRequest(numberOfItems){if(this.enableQueue){while(this.queue.length >= numberOfItems && numberOfItems > 0) {this.subject.onNext(this.queue.shift());numberOfItems--;}return this.queue.length !== 0?{numberOfItems:numberOfItems, returnValue:true}:{numberOfItems:numberOfItems, returnValue:false};}if(this.hasFailed){this.subject.onError(this.error);this.controlledDisposable.dispose();this.controlledDisposable = disposableEmpty;}else if(this.hasCompleted){this.subject.onCompleted();this.controlledDisposable.dispose();this.controlledDisposable = disposableEmpty;}return {numberOfItems:numberOfItems, returnValue:false};}, request:function request(number){this.disposeCurrentRequest();var self=this, r=this._processRequest(number);var number=r.numberOfItems;if(!r.returnValue){this.requestedCount = number;this.requestedDisposable = disposableCreate(function(){self.requestedCount = 0;});return this.requestedDisposable;}else {return disposableEmpty;}}, disposeCurrentRequest:function disposeCurrentRequest(){this.requestedDisposable.dispose();this.requestedDisposable = disposableEmpty;}});return ControlledSubject;})(Observable);observableProto.controlled = function(enableQueue){if(enableQueue == null){enableQueue = true;}return new ControlledObservable(this, enableQueue);};var StopAndWaitObservable=(function(__super__){function subscribe(observer){this.subscription = this.source.subscribe(new StopAndWaitObserver(observer, this, this.subscription));var self=this;timeoutScheduler.schedule(function(){self.source.request(1);});return this.subscription;}inherits(StopAndWaitObservable, __super__);function StopAndWaitObservable(source){__super__.call(this, subscribe, source);this.source = source;}var StopAndWaitObserver=(function(__sub__){inherits(StopAndWaitObserver, __sub__);function StopAndWaitObserver(observer, observable, cancel){__sub__.call(this);this.observer = observer;this.observable = observable;this.cancel = cancel;}var stopAndWaitObserverProto=StopAndWaitObserver.prototype;stopAndWaitObserverProto.completed = function(){this.observer.onCompleted();this.dispose();};stopAndWaitObserverProto.error = function(error){this.observer.onError(error);this.dispose();};stopAndWaitObserverProto.next = function(value){this.observer.onNext(value);var self=this;timeoutScheduler.schedule(function(){self.observable.source.request(1);});};stopAndWaitObserverProto.dispose = function(){this.observer = null;if(this.cancel){this.cancel.dispose();this.cancel = null;}__sub__.prototype.dispose.call(this);};return StopAndWaitObserver;})(AbstractObserver);return StopAndWaitObservable;})(Observable);ControlledObservable.prototype.stopAndWait = function(){return new StopAndWaitObservable(this);};var WindowedObservable=(function(__super__){function subscribe(observer){this.subscription = this.source.subscribe(new WindowedObserver(observer, this, this.subscription));var self=this;timeoutScheduler.schedule(function(){self.source.request(self.windowSize);});return this.subscription;}inherits(WindowedObservable, __super__);function WindowedObservable(source, windowSize){__super__.call(this, subscribe, source);this.source = source;this.windowSize = windowSize;}var WindowedObserver=(function(__sub__){inherits(WindowedObserver, __sub__);function WindowedObserver(observer, observable, cancel){this.observer = observer;this.observable = observable;this.cancel = cancel;this.received = 0;}var windowedObserverPrototype=WindowedObserver.prototype;windowedObserverPrototype.completed = function(){this.observer.onCompleted();this.dispose();};windowedObserverPrototype.error = function(error){this.observer.onError(error);this.dispose();};windowedObserverPrototype.next = function(value){this.observer.onNext(value);this.received = ++this.received % this.observable.windowSize;if(this.received === 0){var self=this;timeoutScheduler.schedule(function(){self.observable.source.request(self.observable.windowSize);});}};windowedObserverPrototype.dispose = function(){this.observer = null;if(this.cancel){this.cancel.dispose();this.cancel = null;}__sub__.prototype.dispose.call(this);};return WindowedObserver;})(AbstractObserver);return WindowedObservable;})(Observable);ControlledObservable.prototype.windowed = function(windowSize){return new WindowedObservable(this, windowSize);};observableProto.multicast = function(subjectOrSubjectSelector, selector){var source=this;return typeof subjectOrSubjectSelector === "function"?new AnonymousObservable(function(observer){var connectable=source.multicast(subjectOrSubjectSelector());return new CompositeDisposable(selector(connectable).subscribe(observer), connectable.connect());}, source):new ConnectableObservable(source, subjectOrSubjectSelector);};observableProto.publish = function(selector){return selector && isFunction(selector)?this.multicast(function(){return new Subject();}, selector):this.multicast(new Subject());};observableProto.share = function(){return this.publish().refCount();};observableProto.publishLast = function(selector){return selector && isFunction(selector)?this.multicast(function(){return new AsyncSubject();}, selector):this.multicast(new AsyncSubject());};observableProto.publishValue = function(initialValueOrSelector, initialValue){return arguments.length === 2?this.multicast(function(){return new BehaviorSubject(initialValue);}, initialValueOrSelector):this.multicast(new BehaviorSubject(initialValueOrSelector));};observableProto.shareValue = function(initialValue){return this.publishValue(initialValue).refCount();};observableProto.replay = function(selector, bufferSize, window, scheduler){return selector && isFunction(selector)?this.multicast(function(){return new ReplaySubject(bufferSize, window, scheduler);}, selector):this.multicast(new ReplaySubject(bufferSize, window, scheduler));};observableProto.shareReplay = function(bufferSize, window, scheduler){return this.replay(null, bufferSize, window, scheduler).refCount();};var InnerSubscription=function InnerSubscription(subject, observer){this.subject = subject;this.observer = observer;};InnerSubscription.prototype.dispose = function(){if(!this.subject.isDisposed && this.observer !== null){var idx=this.subject.observers.indexOf(this.observer);this.subject.observers.splice(idx, 1);this.observer = null;}};var BehaviorSubject=Rx.BehaviorSubject = (function(__super__){function subscribe(observer){checkDisposed.call(this);if(!this.isStopped){this.observers.push(observer);observer.onNext(this.value);return new InnerSubscription(this, observer);}if(this.hasError){observer.onError(this.error);}else {observer.onCompleted();}return disposableEmpty;}inherits(BehaviorSubject, __super__);function BehaviorSubject(value){__super__.call(this, subscribe);this.value = value, this.observers = [], this.isDisposed = false, this.isStopped = false, this.hasError = false;}addProperties(BehaviorSubject.prototype, Observer, {hasObservers:function hasObservers(){return this.observers.length > 0;}, onCompleted:function onCompleted(){checkDisposed.call(this);if(this.isStopped){return;}this.isStopped = true;for(var i=0, os=this.observers.slice(0), len=os.length; i < len; i++) {os[i].onCompleted();}this.observers.length = 0;}, onError:function onError(error){checkDisposed.call(this);if(this.isStopped){return;}this.isStopped = true;this.hasError = true;this.error = error;for(var i=0, os=this.observers.slice(0), len=os.length; i < len; i++) {os[i].onError(error);}this.observers.length = 0;}, onNext:function onNext(value){checkDisposed.call(this);if(this.isStopped){return;}this.value = value;for(var i=0, os=this.observers.slice(0), len=os.length; i < len; i++) {os[i].onNext(value);}}, dispose:function dispose(){this.isDisposed = true;this.observers = null;this.value = null;this.exception = null;}});return BehaviorSubject;})(Observable);var ReplaySubject=Rx.ReplaySubject = (function(__super__){function createRemovableDisposable(subject, observer){return disposableCreate(function(){observer.dispose();!subject.isDisposed && subject.observers.splice(subject.observers.indexOf(observer), 1);});}function subscribe(observer){var so=new ScheduledObserver(this.scheduler, observer), subscription=createRemovableDisposable(this, so);checkDisposed.call(this);this._trim(this.scheduler.now());this.observers.push(so);for(var i=0, len=this.q.length; i < len; i++) {so.onNext(this.q[i].value);}if(this.hasError){so.onError(this.error);}else if(this.isStopped){so.onCompleted();}so.ensureActive();return subscription;}inherits(ReplaySubject, __super__);function ReplaySubject(bufferSize, windowSize, scheduler){this.bufferSize = bufferSize == null?Number.MAX_VALUE:bufferSize;this.windowSize = windowSize == null?Number.MAX_VALUE:windowSize;this.scheduler = scheduler || currentThreadScheduler;this.q = [];this.observers = [];this.isStopped = false;this.isDisposed = false;this.hasError = false;this.error = null;__super__.call(this, subscribe);}addProperties(ReplaySubject.prototype, Observer.prototype, {hasObservers:function hasObservers(){return this.observers.length > 0;}, _trim:function _trim(now){while(this.q.length > this.bufferSize) {this.q.shift();}while(this.q.length > 0 && now - this.q[0].interval > this.windowSize) {this.q.shift();}}, onNext:function onNext(value){checkDisposed.call(this);if(this.isStopped){return;}var now=this.scheduler.now();this.q.push({interval:now, value:value});this._trim(now);var o=this.observers.slice(0);for(var i=0, len=o.length; i < len; i++) {var observer=o[i];observer.onNext(value);observer.ensureActive();}}, onError:function onError(error){checkDisposed.call(this);if(this.isStopped){return;}this.isStopped = true;this.error = error;this.hasError = true;var now=this.scheduler.now();this._trim(now);var o=this.observers.slice(0);for(var i=0, len=o.length; i < len; i++) {var observer=o[i];observer.onError(error);observer.ensureActive();}this.observers = [];}, onCompleted:function onCompleted(){checkDisposed.call(this);if(this.isStopped){return;}this.isStopped = true;var now=this.scheduler.now();this._trim(now);var o=this.observers.slice(0);for(var i=0, len=o.length; i < len; i++) {var observer=o[i];observer.onCompleted();observer.ensureActive();}this.observers = [];}, dispose:function dispose(){this.isDisposed = true;this.observers = null;}});return ReplaySubject;})(Observable);var ConnectableObservable=Rx.ConnectableObservable = (function(__super__){inherits(ConnectableObservable, __super__);function ConnectableObservable(source, subject){var hasSubscription=false, subscription, sourceObservable=source.asObservable();this.connect = function(){if(!hasSubscription){hasSubscription = true;subscription = new CompositeDisposable(sourceObservable.subscribe(subject), disposableCreate(function(){hasSubscription = false;}));}return subscription;};__super__.call(this, function(o){return subject.subscribe(o);});}ConnectableObservable.prototype.refCount = function(){var connectableSubscription, count=0, source=this;return new AnonymousObservable(function(observer){var shouldConnect=++count === 1, subscription=source.subscribe(observer);shouldConnect && (connectableSubscription = source.connect());return function(){subscription.dispose();--count === 0 && connectableSubscription.dispose();};});};return ConnectableObservable;})(Observable);var Dictionary=(function(){var primes=[1, 3, 7, 13, 31, 61, 127, 251, 509, 1021, 2039, 4093, 8191, 16381, 32749, 65521, 131071, 262139, 524287, 1048573, 2097143, 4194301, 8388593, 16777213, 33554393, 67108859, 134217689, 268435399, 536870909, 1073741789, 2147483647], noSuchkey="no such key", duplicatekey="duplicate key";function isPrime(candidate){if((candidate & 1) === 0){return candidate === 2;}var num1=Math.sqrt(candidate), num2=3;while(num2 <= num1) {if(candidate % num2 === 0){return false;}num2 += 2;}return true;}function getPrime(min){var index, num, candidate;for(index = 0; index < primes.length; ++index) {num = primes[index];if(num >= min){return num;}}candidate = min | 1;while(candidate < primes[primes.length - 1]) {if(isPrime(candidate)){return candidate;}candidate += 2;}return min;}function stringHashFn(str){var hash=757602046;if(!str.length){return hash;}for(var i=0, len=str.length; i < len; i++) {var character=str.charCodeAt(i);hash = (hash << 5) - hash + character;hash = hash & hash;}return hash;}function numberHashFn(key){var c2=668265261;key = key ^ 61 ^ key >>> 16;key = key + (key << 3);key = key ^ key >>> 4;key = key * c2;key = key ^ key >>> 15;return key;}var getHashCode=(function(){var uniqueIdCounter=0;return function(obj){if(obj == null){throw new Error(noSuchkey);}if(typeof obj === "string"){return stringHashFn(obj);}if(typeof obj === "number"){return numberHashFn(obj);}if(typeof obj === "boolean"){return obj === true?1:0;}if(obj instanceof Date){return numberHashFn(obj.valueOf());}if(obj instanceof RegExp){return stringHashFn(obj.toString());}if(typeof obj.valueOf === "function"){var valueOf=obj.valueOf();if(typeof valueOf === "number"){return numberHashFn(valueOf);}if(typeof obj === "string"){return stringHashFn(valueOf);}}if(obj.hashCode){return obj.hashCode();}var id=17 * uniqueIdCounter++;obj.hashCode = function(){return id;};return id;};})();function newEntry(){return {key:null, value:null, next:0, hashCode:0};}function Dictionary(capacity, comparer){if(capacity < 0){throw new Error("out of range");}if(capacity > 0){this._initialize(capacity);}this.comparer = comparer || defaultComparer;this.freeCount = 0;this.size = 0;this.freeList = -1;}var dictionaryProto=Dictionary.prototype;dictionaryProto._initialize = function(capacity){var prime=getPrime(capacity), i;this.buckets = new Array(prime);this.entries = new Array(prime);for(i = 0; i < prime; i++) {this.buckets[i] = -1;this.entries[i] = newEntry();}this.freeList = -1;};dictionaryProto.add = function(key, value){this._insert(key, value, true);};dictionaryProto._insert = function(key, value, add){if(!this.buckets){this._initialize(0);}var index3, num=getHashCode(key) & 2147483647, index1=num % this.buckets.length;for(var index2=this.buckets[index1]; index2 >= 0; index2 = this.entries[index2].next) {if(this.entries[index2].hashCode === num && this.comparer(this.entries[index2].key, key)){if(add){throw new Error(duplicatekey);}this.entries[index2].value = value;return;}}if(this.freeCount > 0){index3 = this.freeList;this.freeList = this.entries[index3].next;--this.freeCount;}else {if(this.size === this.entries.length){this._resize();index1 = num % this.buckets.length;}index3 = this.size;++this.size;}this.entries[index3].hashCode = num;this.entries[index3].next = this.buckets[index1];this.entries[index3].key = key;this.entries[index3].value = value;this.buckets[index1] = index3;};dictionaryProto._resize = function(){var prime=getPrime(this.size * 2), numArray=new Array(prime);for(index = 0; index < numArray.length; ++index) {numArray[index] = -1;}var entryArray=new Array(prime);for(index = 0; index < this.size; ++index) {entryArray[index] = this.entries[index];}for(var index=this.size; index < prime; ++index) {entryArray[index] = newEntry();}for(var index1=0; index1 < this.size; ++index1) {var index2=entryArray[index1].hashCode % prime;entryArray[index1].next = numArray[index2];numArray[index2] = index1;}this.buckets = numArray;this.entries = entryArray;};dictionaryProto.remove = function(key){if(this.buckets){var num=getHashCode(key) & 2147483647, index1=num % this.buckets.length, index2=-1;for(var index3=this.buckets[index1]; index3 >= 0; index3 = this.entries[index3].next) {if(this.entries[index3].hashCode === num && this.comparer(this.entries[index3].key, key)){if(index2 < 0){this.buckets[index1] = this.entries[index3].next;}else {this.entries[index2].next = this.entries[index3].next;}this.entries[index3].hashCode = -1;this.entries[index3].next = this.freeList;this.entries[index3].key = null;this.entries[index3].value = null;this.freeList = index3;++this.freeCount;return true;}else {index2 = index3;}}}return false;};dictionaryProto.clear = function(){var index, len;if(this.size <= 0){return;}for(index = 0, len = this.buckets.length; index < len; ++index) {this.buckets[index] = -1;}for(index = 0; index < this.size; ++index) {this.entries[index] = newEntry();}this.freeList = -1;this.size = 0;};dictionaryProto._findEntry = function(key){if(this.buckets){var num=getHashCode(key) & 2147483647;for(var index=this.buckets[num % this.buckets.length]; index >= 0; index = this.entries[index].next) {if(this.entries[index].hashCode === num && this.comparer(this.entries[index].key, key)){return index;}}}return -1;};dictionaryProto.count = function(){return this.size - this.freeCount;};dictionaryProto.tryGetValue = function(key){var entry=this._findEntry(key);return entry >= 0?this.entries[entry].value:undefined;};dictionaryProto.getValues = function(){var index=0, results=[];if(this.entries){for(var index1=0; index1 < this.size; index1++) {if(this.entries[index1].hashCode >= 0){results[index++] = this.entries[index1].value;}}}return results;};dictionaryProto.get = function(key){var entry=this._findEntry(key);if(entry >= 0){return this.entries[entry].value;}throw new Error(noSuchkey);};dictionaryProto.set = function(key, value){this._insert(key, value, false);};dictionaryProto.containskey = function(key){return this._findEntry(key) >= 0;};return Dictionary;})();observableProto.join = function(right, leftDurationSelector, rightDurationSelector, resultSelector){var left=this;return new AnonymousObservable(function(observer){var group=new CompositeDisposable();var leftDone=false, rightDone=false;var leftId=0, rightId=0;var leftMap=new Dictionary(), rightMap=new Dictionary();group.add(left.subscribe(function(value){var id=leftId++;var md=new SingleAssignmentDisposable();leftMap.add(id, value);group.add(md);var expire=function expire(){leftMap.remove(id) && leftMap.count() === 0 && leftDone && observer.onCompleted();group.remove(md);};var duration;try{duration = leftDurationSelector(value);}catch(e) {observer.onError(e);return;}md.setDisposable(duration.take(1).subscribe(noop, observer.onError.bind(observer), expire));rightMap.getValues().forEach(function(v){var result;try{result = resultSelector(value, v);}catch(exn) {observer.onError(exn);return;}observer.onNext(result);});}, observer.onError.bind(observer), function(){leftDone = true;(rightDone || leftMap.count() === 0) && observer.onCompleted();}));group.add(right.subscribe(function(value){var id=rightId++;var md=new SingleAssignmentDisposable();rightMap.add(id, value);group.add(md);var expire=function expire(){rightMap.remove(id) && rightMap.count() === 0 && rightDone && observer.onCompleted();group.remove(md);};var duration;try{duration = rightDurationSelector(value);}catch(e) {observer.onError(e);return;}md.setDisposable(duration.take(1).subscribe(noop, observer.onError.bind(observer), expire));leftMap.getValues().forEach(function(v){var result;try{result = resultSelector(v, value);}catch(exn) {observer.onError(exn);return;}observer.onNext(result);});}, observer.onError.bind(observer), function(){rightDone = true;(leftDone || rightMap.count() === 0) && observer.onCompleted();}));return group;}, left);};observableProto.groupJoin = function(right, leftDurationSelector, rightDurationSelector, resultSelector){var left=this;return new AnonymousObservable(function(observer){var group=new CompositeDisposable();var r=new RefCountDisposable(group);var leftMap=new Dictionary(), rightMap=new Dictionary();var leftId=0, rightId=0;function handleError(e){return function(v){v.onError(e);};};group.add(left.subscribe(function(value){var s=new Subject();var id=leftId++;leftMap.add(id, s);var result;try{result = resultSelector(value, addRef(s, r));}catch(e) {leftMap.getValues().forEach(handleError(e));observer.onError(e);return;}observer.onNext(result);rightMap.getValues().forEach(function(v){s.onNext(v);});var md=new SingleAssignmentDisposable();group.add(md);var expire=function expire(){leftMap.remove(id) && s.onCompleted();group.remove(md);};var duration;try{duration = leftDurationSelector(value);}catch(e) {leftMap.getValues().forEach(handleError(e));observer.onError(e);return;}md.setDisposable(duration.take(1).subscribe(noop, function(e){leftMap.getValues().forEach(handleError(e));observer.onError(e);}, expire));}, function(e){leftMap.getValues().forEach(handleError(e));observer.onError(e);}, observer.onCompleted.bind(observer)));group.add(right.subscribe(function(value){var id=rightId++;rightMap.add(id, value);var md=new SingleAssignmentDisposable();group.add(md);var expire=function expire(){rightMap.remove(id);group.remove(md);};var duration;try{duration = rightDurationSelector(value);}catch(e) {leftMap.getValues().forEach(handleError(e));observer.onError(e);return;}md.setDisposable(duration.take(1).subscribe(noop, function(e){leftMap.getValues().forEach(handleError(e));observer.onError(e);}, expire));leftMap.getValues().forEach(function(v){v.onNext(value);});}, function(e){leftMap.getValues().forEach(handleError(e));observer.onError(e);}));return r;}, left);};observableProto.buffer = function(bufferOpeningsOrClosingSelector, bufferClosingSelector){return this.window.apply(this, arguments).selectMany(function(x){return x.toArray();});};observableProto.window = function(windowOpeningsOrClosingSelector, windowClosingSelector){if(arguments.length === 1 && typeof arguments[0] !== "function"){return observableWindowWithBoundaries.call(this, windowOpeningsOrClosingSelector);}return typeof windowOpeningsOrClosingSelector === "function"?observableWindowWithClosingSelector.call(this, windowOpeningsOrClosingSelector):observableWindowWithOpenings.call(this, windowOpeningsOrClosingSelector, windowClosingSelector);};function observableWindowWithOpenings(windowOpenings, windowClosingSelector){return windowOpenings.groupJoin(this, windowClosingSelector, observableEmpty, function(_, win){return win;});}function observableWindowWithBoundaries(windowBoundaries){var source=this;return new AnonymousObservable(function(observer){var win=new Subject(), d=new CompositeDisposable(), r=new RefCountDisposable(d);observer.onNext(addRef(win, r));d.add(source.subscribe(function(x){win.onNext(x);}, function(err){win.onError(err);observer.onError(err);}, function(){win.onCompleted();observer.onCompleted();}));isPromise(windowBoundaries) && (windowBoundaries = observableFromPromise(windowBoundaries));d.add(windowBoundaries.subscribe(function(w){win.onCompleted();win = new Subject();observer.onNext(addRef(win, r));}, function(err){win.onError(err);observer.onError(err);}, function(){win.onCompleted();observer.onCompleted();}));return r;}, source);}function observableWindowWithClosingSelector(windowClosingSelector){var source=this;return new AnonymousObservable(function(observer){var m=new SerialDisposable(), d=new CompositeDisposable(m), r=new RefCountDisposable(d), win=new Subject();observer.onNext(addRef(win, r));d.add(source.subscribe(function(x){win.onNext(x);}, function(err){win.onError(err);observer.onError(err);}, function(){win.onCompleted();observer.onCompleted();}));function createWindowClose(){var windowClose;try{windowClose = windowClosingSelector();}catch(e) {observer.onError(e);return;}isPromise(windowClose) && (windowClose = observableFromPromise(windowClose));var m1=new SingleAssignmentDisposable();m.setDisposable(m1);m1.setDisposable(windowClose.take(1).subscribe(noop, function(err){win.onError(err);observer.onError(err);}, function(){win.onCompleted();win = new Subject();observer.onNext(addRef(win, r));createWindowClose();}));}createWindowClose();return r;}, source);}observableProto.pairwise = function(){var source=this;return new AnonymousObservable(function(observer){var previous, hasPrevious=false;return source.subscribe(function(x){if(hasPrevious){observer.onNext([previous, x]);}else {hasPrevious = true;}previous = x;}, observer.onError.bind(observer), observer.onCompleted.bind(observer));}, source);};observableProto.partition = function(predicate, thisArg){return [this.filter(predicate, thisArg), this.filter(function(x, i, o){return !predicate.call(thisArg, x, i, o);})];};function enumerableWhile(condition, source){return new Enumerable(function(){return new Enumerator(function(){return condition()?{done:false, value:source}:{done:true, value:undefined};});});}observableProto.letBind = observableProto["let"] = function(func){return func(this);};Observable["if"] = Observable.ifThen = function(condition, thenSource, elseSourceOrScheduler){return observableDefer(function(){elseSourceOrScheduler || (elseSourceOrScheduler = observableEmpty());isPromise(thenSource) && (thenSource = observableFromPromise(thenSource));isPromise(elseSourceOrScheduler) && (elseSourceOrScheduler = observableFromPromise(elseSourceOrScheduler));typeof elseSourceOrScheduler.now === "function" && (elseSourceOrScheduler = observableEmpty(elseSourceOrScheduler));return condition()?thenSource:elseSourceOrScheduler;});};Observable["for"] = Observable.forIn = function(sources, resultSelector, thisArg){return enumerableOf(sources, resultSelector, thisArg).concat();};var observableWhileDo=Observable["while"] = Observable.whileDo = function(condition, source){isPromise(source) && (source = observableFromPromise(source));return enumerableWhile(condition, source).concat();};observableProto.doWhile = function(condition){return observableConcat([this, observableWhileDo(condition, this)]);};Observable["case"] = Observable.switchCase = function(selector, sources, defaultSourceOrScheduler){return observableDefer(function(){isPromise(defaultSourceOrScheduler) && (defaultSourceOrScheduler = observableFromPromise(defaultSourceOrScheduler));defaultSourceOrScheduler || (defaultSourceOrScheduler = observableEmpty());typeof defaultSourceOrScheduler.now === "function" && (defaultSourceOrScheduler = observableEmpty(defaultSourceOrScheduler));var result=sources[selector()];isPromise(result) && (result = observableFromPromise(result));return result || defaultSourceOrScheduler;});};observableProto.expand = function(selector, scheduler){isScheduler(scheduler) || (scheduler = immediateScheduler);var source=this;return new AnonymousObservable(function(observer){var q=[], m=new SerialDisposable(), d=new CompositeDisposable(m), activeCount=0, isAcquired=false;var ensureActive=(function(_ensureActive){var _ensureActiveWrapper=function ensureActive(){return _ensureActive.apply(this, arguments);};_ensureActiveWrapper.toString = function(){return _ensureActive.toString();};return _ensureActiveWrapper;})(function(){var isOwner=false;if(q.length > 0){isOwner = !isAcquired;isAcquired = true;}if(isOwner){m.setDisposable(scheduler.scheduleRecursive(function(self){var work;if(q.length > 0){work = q.shift();}else {isAcquired = false;return;}var m1=new SingleAssignmentDisposable();d.add(m1);m1.setDisposable(work.subscribe(function(x){observer.onNext(x);var result=null;try{result = selector(x);}catch(e) {observer.onError(e);}q.push(result);activeCount++;ensureActive();}, observer.onError.bind(observer), function(){d.remove(m1);activeCount--;if(activeCount === 0){observer.onCompleted();}}));self();}));}});q.push(source);activeCount++;ensureActive();return d;}, this);};Observable.forkJoin = function(){var allSources=argsOrArray(arguments, 0);return new AnonymousObservable(function(subscriber){var count=allSources.length;if(count === 0){subscriber.onCompleted();return disposableEmpty;}var group=new CompositeDisposable(), finished=false, hasResults=new Array(count), hasCompleted=new Array(count), results=new Array(count);for(var idx=0; idx < count; idx++) {(function(i){var source=allSources[i];isPromise(source) && (source = observableFromPromise(source));group.add(source.subscribe(function(value){if(!finished){hasResults[i] = true;results[i] = value;}}, function(e){finished = true;subscriber.onError(e);group.dispose();}, function(){if(!finished){if(!hasResults[i]){subscriber.onCompleted();return;}hasCompleted[i] = true;for(var ix=0; ix < count; ix++) {if(!hasCompleted[ix]){return;}}finished = true;subscriber.onNext(results);subscriber.onCompleted();}}));})(idx);}return group;});};observableProto.forkJoin = function(second, resultSelector){var first=this;return new AnonymousObservable(function(observer){var leftStopped=false, rightStopped=false, hasLeft=false, hasRight=false, lastLeft, lastRight, leftSubscription=new SingleAssignmentDisposable(), rightSubscription=new SingleAssignmentDisposable();isPromise(second) && (second = observableFromPromise(second));leftSubscription.setDisposable(first.subscribe(function(left){hasLeft = true;lastLeft = left;}, function(err){rightSubscription.dispose();observer.onError(err);}, function(){leftStopped = true;if(rightStopped){if(!hasLeft){observer.onCompleted();}else if(!hasRight){observer.onCompleted();}else {var result;try{result = resultSelector(lastLeft, lastRight);}catch(e) {observer.onError(e);return;}observer.onNext(result);observer.onCompleted();}}}));rightSubscription.setDisposable(second.subscribe(function(right){hasRight = true;lastRight = right;}, function(err){leftSubscription.dispose();observer.onError(err);}, function(){rightStopped = true;if(leftStopped){if(!hasLeft){observer.onCompleted();}else if(!hasRight){observer.onCompleted();}else {var result;try{result = resultSelector(lastLeft, lastRight);}catch(e) {observer.onError(e);return;}observer.onNext(result);observer.onCompleted();}}}));return new CompositeDisposable(leftSubscription, rightSubscription);}, first);};observableProto.manySelect = function(selector, scheduler){isScheduler(scheduler) || (scheduler = immediateScheduler);var source=this;return observableDefer(function(){var chain;return source.map(function(x){var curr=new ChainObservable(x);chain && chain.onNext(x);chain = curr;return curr;}).tap(noop, function(e){chain && chain.onError(e);}, function(){chain && chain.onCompleted();}).observeOn(scheduler).map(selector);}, source);};var ChainObservable=(function(__super__){function subscribe(observer){var self=this, g=new CompositeDisposable();g.add(currentThreadScheduler.schedule(function(){observer.onNext(self.head);g.add(self.tail.mergeAll().subscribe(observer));}));return g;}inherits(ChainObservable, __super__);function ChainObservable(head){__super__.call(this, subscribe);this.head = head;this.tail = new AsyncSubject();}addProperties(ChainObservable.prototype, Observer, {onCompleted:function onCompleted(){this.onNext(Observable.empty());}, onError:function onError(e){this.onNext(Observable.throwException(e));}, onNext:function onNext(v){this.tail.onNext(v);this.tail.onCompleted();}});return ChainObservable;})(Observable);var Map=root.Map || (function(){function Map(){this._keys = [];this._values = [];}Map.prototype.get = function(key){var i=this._keys.indexOf(key);return i !== -1?this._values[i]:undefined;};Map.prototype.set = function(key, value){var i=this._keys.indexOf(key);i !== -1 && (this._values[i] = value);this._values[this._keys.push(key) - 1] = value;};Map.prototype.forEach = function(callback, thisArg){for(var i=0, len=this._keys.length; i < len; i++) {callback.call(thisArg, this._values[i], this._keys[i]);}};return Map;})();function Pattern(patterns){this.patterns = patterns;}Pattern.prototype.and = function(other){return new Pattern(this.patterns.concat(other));};Pattern.prototype.thenDo = function(selector){return new Plan(this, selector);};function Plan(expression, selector){this.expression = expression;this.selector = selector;}Plan.prototype.activate = function(externalSubscriptions, observer, deactivate){var self=this;var joinObservers=[];for(var i=0, len=this.expression.patterns.length; i < len; i++) {joinObservers.push(planCreateObserver(externalSubscriptions, this.expression.patterns[i], observer.onError.bind(observer)));}var activePlan=new ActivePlan(joinObservers, function(){var result;try{result = self.selector.apply(self, arguments);}catch(e) {observer.onError(e);return;}observer.onNext(result);}, function(){for(var j=0, jlen=joinObservers.length; j < jlen; j++) {joinObservers[j].removeActivePlan(activePlan);}deactivate(activePlan);});for(i = 0, len = joinObservers.length; i < len; i++) {joinObservers[i].addActivePlan(activePlan);}return activePlan;};function planCreateObserver(externalSubscriptions, observable, onError){var entry=externalSubscriptions.get(observable);if(!entry){var observer=new JoinObserver(observable, onError);externalSubscriptions.set(observable, observer);return observer;}return entry;}function ActivePlan(joinObserverArray, onNext, onCompleted){this.joinObserverArray = joinObserverArray;this.onNext = onNext;this.onCompleted = onCompleted;this.joinObservers = new Map();for(var i=0, len=this.joinObserverArray.length; i < len; i++) {var joinObserver=this.joinObserverArray[i];this.joinObservers.set(joinObserver, joinObserver);}}ActivePlan.prototype.dequeue = function(){this.joinObservers.forEach(function(v){v.queue.shift();});};ActivePlan.prototype.match = function(){var i, len, hasValues=true;for(i = 0, len = this.joinObserverArray.length; i < len; i++) {if(this.joinObserverArray[i].queue.length === 0){hasValues = false;break;}}if(hasValues){var firstValues=[], isCompleted=false;for(i = 0, len = this.joinObserverArray.length; i < len; i++) {firstValues.push(this.joinObserverArray[i].queue[0]);this.joinObserverArray[i].queue[0].kind === "C" && (isCompleted = true);}if(isCompleted){this.onCompleted();}else {this.dequeue();var values=[];for(i = 0, len = firstValues.length; i < firstValues.length; i++) {values.push(firstValues[i].value);}this.onNext.apply(this, values);}}};var JoinObserver=(function(__super__){inherits(JoinObserver, __super__);function JoinObserver(source, onError){__super__.call(this);this.source = source;this.onError = onError;this.queue = [];this.activePlans = [];this.subscription = new SingleAssignmentDisposable();this.isDisposed = false;}var JoinObserverPrototype=JoinObserver.prototype;JoinObserverPrototype.next = function(notification){if(!this.isDisposed){if(notification.kind === "E"){this.onError(notification.exception);return;}this.queue.push(notification);var activePlans=this.activePlans.slice(0);for(var i=0, len=activePlans.length; i < len; i++) {activePlans[i].match();}}};JoinObserverPrototype.error = noop;JoinObserverPrototype.completed = noop;JoinObserverPrototype.addActivePlan = function(activePlan){this.activePlans.push(activePlan);};JoinObserverPrototype.subscribe = function(){this.subscription.setDisposable(this.source.materialize().subscribe(this));};JoinObserverPrototype.removeActivePlan = function(activePlan){this.activePlans.splice(this.activePlans.indexOf(activePlan), 1);this.activePlans.length === 0 && this.dispose();};JoinObserverPrototype.dispose = function(){__super__.prototype.dispose.call(this);if(!this.isDisposed){this.isDisposed = true;this.subscription.dispose();}};return JoinObserver;})(AbstractObserver);observableProto.and = function(right){return new Pattern([this, right]);};observableProto.thenDo = function(selector){return new Pattern([this]).thenDo(selector);};Observable.when = function(){var plans=argsOrArray(arguments, 0);return new AnonymousObservable(function(observer){var activePlans=[], externalSubscriptions=new Map();var outObserver=observerCreate(observer.onNext.bind(observer), function(err){externalSubscriptions.forEach(function(v){v.onError(err);});observer.onError(err);}, observer.onCompleted.bind(observer));try{for(var i=0, len=plans.length; i < len; i++) {activePlans.push(plans[i].activate(externalSubscriptions, outObserver, function(activePlan){var idx=activePlans.indexOf(activePlan);activePlans.splice(idx, 1);activePlans.length === 0 && observer.onCompleted();}));}}catch(e) {observableThrow(e).subscribe(observer);}var group=new CompositeDisposable();externalSubscriptions.forEach(function(joinObserver){joinObserver.subscribe();group.add(joinObserver);});return group;});};function observableTimerDate(dueTime, scheduler){return new AnonymousObservable(function(observer){return scheduler.scheduleWithAbsolute(dueTime, function(){observer.onNext(0);observer.onCompleted();});});}function observableTimerDateAndPeriod(dueTime, period, scheduler){return new AnonymousObservable(function(observer){var count=0, d=dueTime, p=normalizeTime(period);return scheduler.scheduleRecursiveWithAbsolute(d, function(self){if(p > 0){var now=scheduler.now();d = d + p;d <= now && (d = now + p);}observer.onNext(count++);self(d);});});}function observableTimerTimeSpan(dueTime, scheduler){return new AnonymousObservable(function(observer){return scheduler.scheduleWithRelative(normalizeTime(dueTime), function(){observer.onNext(0);observer.onCompleted();});});}function observableTimerTimeSpanAndPeriod(dueTime, period, scheduler){return dueTime === period?new AnonymousObservable(function(observer){return scheduler.schedulePeriodicWithState(0, period, function(count){observer.onNext(count);return count + 1;});}):observableDefer(function(){return observableTimerDateAndPeriod(scheduler.now() + dueTime, period, scheduler);});}var observableinterval=Observable.interval = function(period, scheduler){return observableTimerTimeSpanAndPeriod(period, period, isScheduler(scheduler)?scheduler:timeoutScheduler);};var observableTimer=Observable.timer = function(dueTime, periodOrScheduler, scheduler){var period;isScheduler(scheduler) || (scheduler = timeoutScheduler);if(periodOrScheduler !== undefined && typeof periodOrScheduler === "number"){period = periodOrScheduler;}else if(isScheduler(periodOrScheduler)){scheduler = periodOrScheduler;}if(dueTime instanceof Date && period === undefined){return observableTimerDate(dueTime.getTime(), scheduler);}if(dueTime instanceof Date && period !== undefined){period = periodOrScheduler;return observableTimerDateAndPeriod(dueTime.getTime(), period, scheduler);}return period === undefined?observableTimerTimeSpan(dueTime, scheduler):observableTimerTimeSpanAndPeriod(dueTime, period, scheduler);};function observableDelayTimeSpan(source, dueTime, scheduler){return new AnonymousObservable(function(observer){var active=false, cancelable=new SerialDisposable(), exception=null, q=[], running=false, subscription;subscription = source.materialize().timestamp(scheduler).subscribe(function(notification){var d, shouldRun;if(notification.value.kind === "E"){q = [];q.push(notification);exception = notification.value.exception;shouldRun = !running;}else {q.push({value:notification.value, timestamp:notification.timestamp + dueTime});shouldRun = !active;active = true;}if(shouldRun){if(exception !== null){observer.onError(exception);}else {d = new SingleAssignmentDisposable();cancelable.setDisposable(d);d.setDisposable(scheduler.scheduleRecursiveWithRelative(dueTime, function(self){var e, recurseDueTime, result, shouldRecurse;if(exception !== null){return;}running = true;do{result = null;if(q.length > 0 && q[0].timestamp - scheduler.now() <= 0){result = q.shift().value;}if(result !== null){result.accept(observer);}}while(result !== null);shouldRecurse = false;recurseDueTime = 0;if(q.length > 0){shouldRecurse = true;recurseDueTime = Math.max(0, q[0].timestamp - scheduler.now());}else {active = false;}e = exception;running = false;if(e !== null){observer.onError(e);}else if(shouldRecurse){self(recurseDueTime);}}));}}});return new CompositeDisposable(subscription, cancelable);}, source);}function observableDelayDate(source, dueTime, scheduler){return observableDefer(function(){return observableDelayTimeSpan(source, dueTime - scheduler.now(), scheduler);});}observableProto.delay = function(dueTime, scheduler){isScheduler(scheduler) || (scheduler = timeoutScheduler);return dueTime instanceof Date?observableDelayDate(this, dueTime.getTime(), scheduler):observableDelayTimeSpan(this, dueTime, scheduler);};observableProto.debounce = observableProto.throttleWithTimeout = function(dueTime, scheduler){isScheduler(scheduler) || (scheduler = timeoutScheduler);var source=this;return new AnonymousObservable(function(observer){var cancelable=new SerialDisposable(), hasvalue=false, value, id=0;var subscription=source.subscribe(function(x){hasvalue = true;value = x;id++;var currentId=id, d=new SingleAssignmentDisposable();cancelable.setDisposable(d);d.setDisposable(scheduler.scheduleWithRelative(dueTime, function(){hasvalue && id === currentId && observer.onNext(value);hasvalue = false;}));}, function(e){cancelable.dispose();observer.onError(e);hasvalue = false;id++;}, function(){cancelable.dispose();hasvalue && observer.onNext(value);observer.onCompleted();hasvalue = false;id++;});return new CompositeDisposable(subscription, cancelable);}, this);};observableProto.throttle = function(dueTime, scheduler){return this.debounce(dueTime, scheduler);};observableProto.windowWithTime = function(timeSpan, timeShiftOrScheduler, scheduler){var source=this, timeShift;timeShiftOrScheduler == null && (timeShift = timeSpan);isScheduler(scheduler) || (scheduler = timeoutScheduler);if(typeof timeShiftOrScheduler === "number"){timeShift = timeShiftOrScheduler;}else if(isScheduler(timeShiftOrScheduler)){timeShift = timeSpan;scheduler = timeShiftOrScheduler;}return new AnonymousObservable(function(observer){var groupDisposable, nextShift=timeShift, nextSpan=timeSpan, q=[], refCountDisposable, timerD=new SerialDisposable(), totalTime=0;groupDisposable = new CompositeDisposable(timerD), refCountDisposable = new RefCountDisposable(groupDisposable);function createTimer(){var m=new SingleAssignmentDisposable(), isSpan=false, isShift=false;timerD.setDisposable(m);if(nextSpan === nextShift){isSpan = true;isShift = true;}else if(nextSpan < nextShift){isSpan = true;}else {isShift = true;}var newTotalTime=isSpan?nextSpan:nextShift, ts=newTotalTime - totalTime;totalTime = newTotalTime;if(isSpan){nextSpan += timeShift;}if(isShift){nextShift += timeShift;}m.setDisposable(scheduler.scheduleWithRelative(ts, function(){if(isShift){var s=new Subject();q.push(s);observer.onNext(addRef(s, refCountDisposable));}isSpan && q.shift().onCompleted();createTimer();}));};q.push(new Subject());observer.onNext(addRef(q[0], refCountDisposable));createTimer();groupDisposable.add(source.subscribe(function(x){for(var i=0, len=q.length; i < len; i++) {q[i].onNext(x);}}, function(e){for(var i=0, len=q.length; i < len; i++) {q[i].onError(e);}observer.onError(e);}, function(){for(var i=0, len=q.length; i < len; i++) {q[i].onCompleted();}observer.onCompleted();}));return refCountDisposable;}, source);};observableProto.windowWithTimeOrCount = function(timeSpan, count, scheduler){var source=this;isScheduler(scheduler) || (scheduler = timeoutScheduler);return new AnonymousObservable(function(observer){var timerD=new SerialDisposable(), groupDisposable=new CompositeDisposable(timerD), refCountDisposable=new RefCountDisposable(groupDisposable), n=0, windowId=0, s=new Subject();function createTimer(id){var m=new SingleAssignmentDisposable();timerD.setDisposable(m);m.setDisposable(scheduler.scheduleWithRelative(timeSpan, function(){if(id !== windowId){return;}n = 0;var newId=++windowId;s.onCompleted();s = new Subject();observer.onNext(addRef(s, refCountDisposable));createTimer(newId);}));}observer.onNext(addRef(s, refCountDisposable));createTimer(0);groupDisposable.add(source.subscribe(function(x){var newId=0, newWindow=false;s.onNext(x);if(++n === count){newWindow = true;n = 0;newId = ++windowId;s.onCompleted();s = new Subject();observer.onNext(addRef(s, refCountDisposable));}newWindow && createTimer(newId);}, function(e){s.onError(e);observer.onError(e);}, function(){s.onCompleted();observer.onCompleted();}));return refCountDisposable;}, source);};observableProto.bufferWithTime = function(timeSpan, timeShiftOrScheduler, scheduler){return this.windowWithTime.apply(this, arguments).selectMany(function(x){return x.toArray();});};observableProto.bufferWithTimeOrCount = function(timeSpan, count, scheduler){return this.windowWithTimeOrCount(timeSpan, count, scheduler).selectMany(function(x){return x.toArray();});};observableProto.timeInterval = function(scheduler){var source=this;isScheduler(scheduler) || (scheduler = timeoutScheduler);return observableDefer(function(){var last=scheduler.now();return source.map(function(x){var now=scheduler.now(), span=now - last;last = now;return {value:x, interval:span};});});};observableProto.timestamp = function(scheduler){isScheduler(scheduler) || (scheduler = timeoutScheduler);return this.map(function(x){return {value:x, timestamp:scheduler.now()};});};function sampleObservable(source, sampler){return new AnonymousObservable(function(observer){var atEnd, value, hasValue;function sampleSubscribe(){if(hasValue){hasValue = false;observer.onNext(value);}atEnd && observer.onCompleted();}return new CompositeDisposable(source.subscribe(function(newValue){hasValue = true;value = newValue;}, observer.onError.bind(observer), function(){atEnd = true;}), sampler.subscribe(sampleSubscribe, observer.onError.bind(observer), sampleSubscribe));}, source);}observableProto.sample = observableProto.throttleLatest = function(intervalOrSampler, scheduler){isScheduler(scheduler) || (scheduler = timeoutScheduler);return typeof intervalOrSampler === "number"?sampleObservable(this, observableinterval(intervalOrSampler, scheduler)):sampleObservable(this, intervalOrSampler);};observableProto.timeout = function(dueTime, other, scheduler){(other == null || typeof other === "string") && (other = observableThrow(new Error(other || "Timeout")));isScheduler(scheduler) || (scheduler = timeoutScheduler);var source=this, schedulerMethod=dueTime instanceof Date?"scheduleWithAbsolute":"scheduleWithRelative";return new AnonymousObservable(function(observer){var id=0, original=new SingleAssignmentDisposable(), subscription=new SerialDisposable(), switched=false, timer=new SerialDisposable();subscription.setDisposable(original);function createTimer(){var myId=id;timer.setDisposable(scheduler[schedulerMethod](dueTime, function(){if(id === myId){isPromise(other) && (other = observableFromPromise(other));subscription.setDisposable(other.subscribe(observer));}}));}createTimer();original.setDisposable(source.subscribe(function(x){if(!switched){id++;observer.onNext(x);createTimer();}}, function(e){if(!switched){id++;observer.onError(e);}}, function(){if(!switched){id++;observer.onCompleted();}}));return new CompositeDisposable(subscription, timer);}, source);};Observable.generateWithAbsoluteTime = function(initialState, condition, iterate, resultSelector, timeSelector, scheduler){isScheduler(scheduler) || (scheduler = timeoutScheduler);return new AnonymousObservable(function(observer){var first=true, hasResult=false, result, state=initialState, time;return scheduler.scheduleRecursiveWithAbsolute(scheduler.now(), function(self){hasResult && observer.onNext(result);try{if(first){first = false;}else {state = iterate(state);}hasResult = condition(state);if(hasResult){result = resultSelector(state);time = timeSelector(state);}}catch(e) {observer.onError(e);return;}if(hasResult){self(time);}else {observer.onCompleted();}});});};Observable.generateWithRelativeTime = function(initialState, condition, iterate, resultSelector, timeSelector, scheduler){isScheduler(scheduler) || (scheduler = timeoutScheduler);return new AnonymousObservable(function(observer){var first=true, hasResult=false, result, state=initialState, time;return scheduler.scheduleRecursiveWithRelative(0, function(self){hasResult && observer.onNext(result);try{if(first){first = false;}else {state = iterate(state);}hasResult = condition(state);if(hasResult){result = resultSelector(state);time = timeSelector(state);}}catch(e) {observer.onError(e);return;}if(hasResult){self(time);}else {observer.onCompleted();}});});};observableProto.delaySubscription = function(dueTime, scheduler){return this.delayWithSelector(observableTimer(dueTime, isScheduler(scheduler)?scheduler:timeoutScheduler), observableEmpty);};observableProto.delayWithSelector = function(subscriptionDelay, delayDurationSelector){var source=this, subDelay, selector;if(typeof subscriptionDelay === "function"){selector = subscriptionDelay;}else {subDelay = subscriptionDelay;selector = delayDurationSelector;}return new AnonymousObservable(function(observer){var delays=new CompositeDisposable(), atEnd=false, done=function done(){if(atEnd && delays.length === 0){observer.onCompleted();}}, subscription=new SerialDisposable(), start=function start(){subscription.setDisposable(source.subscribe(function(x){var delay;try{delay = selector(x);}catch(error) {observer.onError(error);return;}var d=new SingleAssignmentDisposable();delays.add(d);d.setDisposable(delay.subscribe(function(){observer.onNext(x);delays.remove(d);done();}, observer.onError.bind(observer), function(){observer.onNext(x);delays.remove(d);done();}));}, observer.onError.bind(observer), function(){atEnd = true;subscription.dispose();done();}));};if(!subDelay){start();}else {subscription.setDisposable(subDelay.subscribe(start, observer.onError.bind(observer), start));}return new CompositeDisposable(subscription, delays);}, this);};observableProto.timeoutWithSelector = function(firstTimeout, timeoutdurationSelector, other){if(arguments.length === 1){timeoutdurationSelector = firstTimeout;firstTimeout = observableNever();}other || (other = observableThrow(new Error("Timeout")));var source=this;return new AnonymousObservable(function(observer){var subscription=new SerialDisposable(), timer=new SerialDisposable(), original=new SingleAssignmentDisposable();subscription.setDisposable(original);var id=0, switched=false;function setTimer(timeout){var myId=id;function timerWins(){return id === myId;}var d=new SingleAssignmentDisposable();timer.setDisposable(d);d.setDisposable(timeout.subscribe(function(){timerWins() && subscription.setDisposable(other.subscribe(observer));d.dispose();}, function(e){timerWins() && observer.onError(e);}, function(){timerWins() && subscription.setDisposable(other.subscribe(observer));}));};setTimer(firstTimeout);function observerWins(){var res=!switched;if(res){id++;}return res;}original.setDisposable(source.subscribe(function(x){if(observerWins()){observer.onNext(x);var timeout;try{timeout = timeoutdurationSelector(x);}catch(e) {observer.onError(e);return;}setTimer(isPromise(timeout)?observableFromPromise(timeout):timeout);}}, function(e){observerWins() && observer.onError(e);}, function(){observerWins() && observer.onCompleted();}));return new CompositeDisposable(subscription, timer);}, source);};observableProto.debounceWithSelector = function(durationSelector){var source=this;return new AnonymousObservable(function(observer){var value, hasValue=false, cancelable=new SerialDisposable(), id=0;var subscription=source.subscribe(function(x){var throttle;try{throttle = durationSelector(x);}catch(e) {observer.onError(e);return;}isPromise(throttle) && (throttle = observableFromPromise(throttle));hasValue = true;value = x;id++;var currentid=id, d=new SingleAssignmentDisposable();cancelable.setDisposable(d);d.setDisposable(throttle.subscribe(function(){hasValue && id === currentid && observer.onNext(value);hasValue = false;d.dispose();}, observer.onError.bind(observer), function(){hasValue && id === currentid && observer.onNext(value);hasValue = false;d.dispose();}));}, function(e){cancelable.dispose();observer.onError(e);hasValue = false;id++;}, function(){cancelable.dispose();hasValue && observer.onNext(value);observer.onCompleted();hasValue = false;id++;});return new CompositeDisposable(subscription, cancelable);}, source);};observableProto.throttleWithSelector = function(){return this.debounceWithSelector.apply(this, arguments);};observableProto.skipLastWithTime = function(duration, scheduler){isScheduler(scheduler) || (scheduler = timeoutScheduler);var source=this;return new AnonymousObservable(function(o){var q=[];return source.subscribe(function(x){var now=scheduler.now();q.push({interval:now, value:x});while(q.length > 0 && now - q[0].interval >= duration) {o.onNext(q.shift().value);}}, function(e){o.onError(e);}, function(){var now=scheduler.now();while(q.length > 0 && now - q[0].interval >= duration) {o.onNext(q.shift().value);}o.onCompleted();});}, source);};observableProto.takeLastWithTime = function(duration, scheduler){var source=this;isScheduler(scheduler) || (scheduler = timeoutScheduler);return new AnonymousObservable(function(o){var q=[];return source.subscribe(function(x){var now=scheduler.now();q.push({interval:now, value:x});while(q.length > 0 && now - q[0].interval >= duration) {q.shift();}}, function(e){o.onError(e);}, function(){var now=scheduler.now();while(q.length > 0) {var next=q.shift();if(now - next.interval <= duration){o.onNext(next.value);}}o.onCompleted();});}, source);};observableProto.takeLastBufferWithTime = function(duration, scheduler){var source=this;isScheduler(scheduler) || (scheduler = timeoutScheduler);return new AnonymousObservable(function(o){var q=[];return source.subscribe(function(x){var now=scheduler.now();q.push({interval:now, value:x});while(q.length > 0 && now - q[0].interval >= duration) {q.shift();}}, function(e){o.onError(e);}, function(){var now=scheduler.now(), res=[];while(q.length > 0) {var next=q.shift();now - next.interval <= duration && res.push(next.value);}o.onNext(res);o.onCompleted();});}, source);};observableProto.takeWithTime = function(duration, scheduler){var source=this;isScheduler(scheduler) || (scheduler = timeoutScheduler);return new AnonymousObservable(function(o){return new CompositeDisposable(scheduler.scheduleWithRelative(duration, function(){o.onCompleted();}), source.subscribe(o));}, source);};observableProto.skipWithTime = function(duration, scheduler){var source=this;isScheduler(scheduler) || (scheduler = timeoutScheduler);return new AnonymousObservable(function(observer){var open=false;return new CompositeDisposable(scheduler.scheduleWithRelative(duration, function(){open = true;}), source.subscribe(function(x){open && observer.onNext(x);}, observer.onError.bind(observer), observer.onCompleted.bind(observer)));}, source);};observableProto.skipUntilWithTime = function(startTime, scheduler){isScheduler(scheduler) || (scheduler = timeoutScheduler);var source=this, schedulerMethod=startTime instanceof Date?"scheduleWithAbsolute":"scheduleWithRelative";return new AnonymousObservable(function(o){var open=false;return new CompositeDisposable(scheduler[schedulerMethod](startTime, function(){open = true;}), source.subscribe(function(x){open && o.onNext(x);}, function(e){o.onError(e);}, function(){o.onCompleted();}));}, source);};observableProto.takeUntilWithTime = function(endTime, scheduler){isScheduler(scheduler) || (scheduler = timeoutScheduler);var source=this, schedulerMethod=endTime instanceof Date?"scheduleWithAbsolute":"scheduleWithRelative";return new AnonymousObservable(function(o){return new CompositeDisposable(scheduler[schedulerMethod](endTime, function(){o.onCompleted();}), source.subscribe(o));}, source);};observableProto.throttleFirst = function(windowDuration, scheduler){isScheduler(scheduler) || (scheduler = timeoutScheduler);var duration=+windowDuration || 0;if(duration <= 0){throw new RangeError("windowDuration cannot be less or equal zero.");}var source=this;return new AnonymousObservable(function(o){var lastOnNext=0;return source.subscribe(function(x){var now=scheduler.now();if(lastOnNext === 0 || now - lastOnNext >= duration){lastOnNext = now;o.onNext(x);}}, function(e){o.onError(e);}, function(){o.onCompleted();});}, source);};observableProto.transduce = function(transducer){var source=this;function transformForObserver(observer){return {init:function init(){return observer;}, step:function step(obs, input){return obs.onNext(input);}, result:function result(obs){return obs.onCompleted();}};}return new AnonymousObservable(function(observer){var xform=transducer(transformForObserver(observer));return source.subscribe(function(v){try{xform.step(observer, v);}catch(e) {observer.onError(e);}}, observer.onError.bind(observer), function(){xform.result(observer);});}, source);};observableProto.exclusive = function(){var sources=this;return new AnonymousObservable(function(observer){var hasCurrent=false, isStopped=false, m=new SingleAssignmentDisposable(), g=new CompositeDisposable();g.add(m);m.setDisposable(sources.subscribe(function(innerSource){if(!hasCurrent){hasCurrent = true;isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));var innerSubscription=new SingleAssignmentDisposable();g.add(innerSubscription);innerSubscription.setDisposable(innerSource.subscribe(observer.onNext.bind(observer), observer.onError.bind(observer), function(){g.remove(innerSubscription);hasCurrent = false;if(isStopped && g.length === 1){observer.onCompleted();}}));}}, observer.onError.bind(observer), function(){isStopped = true;if(!hasCurrent && g.length === 1){observer.onCompleted();}}));return g;}, this);};observableProto.exclusiveMap = function(selector, thisArg){var sources=this, selectorFunc=bindCallback(selector, thisArg, 3);return new AnonymousObservable(function(observer){var index=0, hasCurrent=false, isStopped=true, m=new SingleAssignmentDisposable(), g=new CompositeDisposable();g.add(m);m.setDisposable(sources.subscribe(function(innerSource){if(!hasCurrent){hasCurrent = true;innerSubscription = new SingleAssignmentDisposable();g.add(innerSubscription);isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));innerSubscription.setDisposable(innerSource.subscribe(function(x){var result;try{result = selectorFunc(x, index++, innerSource);}catch(e) {observer.onError(e);return;}observer.onNext(result);}, function(e){observer.onError(e);}, function(){g.remove(innerSubscription);hasCurrent = false;if(isStopped && g.length === 1){observer.onCompleted();}}));}}, function(e){observer.onError(e);}, function(){isStopped = true;if(g.length === 1 && !hasCurrent){observer.onCompleted();}}));return g;}, this);};Rx.VirtualTimeScheduler = (function(__super__){function notImplemented(){throw new Error("Not implemented");}function localNow(){return this.toDateTimeOffset(this.clock);}function scheduleNow(state, action){return this.scheduleAbsoluteWithState(state, this.clock, action);}function scheduleRelative(state, dueTime, action){return this.scheduleRelativeWithState(state, this.toRelative(dueTime), action);}function scheduleAbsolute(state, dueTime, action){return this.scheduleRelativeWithState(state, this.toRelative(dueTime - this.now()), action);}function invokeAction(scheduler, action){action();return disposableEmpty;}inherits(VirtualTimeScheduler, __super__);function VirtualTimeScheduler(initialClock, comparer){this.clock = initialClock;this.comparer = comparer;this.isEnabled = false;this.queue = new PriorityQueue(1024);__super__.call(this, localNow, scheduleNow, scheduleRelative, scheduleAbsolute);}var VirtualTimeSchedulerPrototype=VirtualTimeScheduler.prototype;VirtualTimeSchedulerPrototype.add = notImplemented;VirtualTimeSchedulerPrototype.toDateTimeOffset = notImplemented;VirtualTimeSchedulerPrototype.toRelative = notImplemented;VirtualTimeSchedulerPrototype.schedulePeriodicWithState = function(state, period, action){var s=new SchedulePeriodicRecursive(this, state, period, action);return s.start();};VirtualTimeSchedulerPrototype.scheduleRelativeWithState = function(state, dueTime, action){var runAt=this.add(this.clock, dueTime);return this.scheduleAbsoluteWithState(state, runAt, action);};VirtualTimeSchedulerPrototype.scheduleRelative = function(dueTime, action){return this.scheduleRelativeWithState(action, dueTime, invokeAction);};VirtualTimeSchedulerPrototype.start = function(){if(!this.isEnabled){this.isEnabled = true;do{var next=this.getNext();if(next !== null){this.comparer(next.dueTime, this.clock) > 0 && (this.clock = next.dueTime);next.invoke();}else {this.isEnabled = false;}}while(this.isEnabled);}};VirtualTimeSchedulerPrototype.stop = function(){this.isEnabled = false;};VirtualTimeSchedulerPrototype.advanceTo = function(time){var dueToClock=this.comparer(this.clock, time);if(this.comparer(this.clock, time) > 0){throw new Error(argumentOutOfRange);}if(dueToClock === 0){return;}if(!this.isEnabled){this.isEnabled = true;do{var next=this.getNext();if(next !== null && this.comparer(next.dueTime, time) <= 0){this.comparer(next.dueTime, this.clock) > 0 && (this.clock = next.dueTime);next.invoke();}else {this.isEnabled = false;}}while(this.isEnabled);this.clock = time;}};VirtualTimeSchedulerPrototype.advanceBy = function(time){var dt=this.add(this.clock, time), dueToClock=this.comparer(this.clock, dt);if(dueToClock > 0){throw new Error(argumentOutOfRange);}if(dueToClock === 0){return;}this.advanceTo(dt);};VirtualTimeSchedulerPrototype.sleep = function(time){var dt=this.add(this.clock, time);if(this.comparer(this.clock, dt) >= 0){throw new Error(argumentOutOfRange);}this.clock = dt;};VirtualTimeSchedulerPrototype.getNext = function(){while(this.queue.length > 0) {var next=this.queue.peek();if(next.isCancelled()){this.queue.dequeue();}else {return next;}}return null;};VirtualTimeSchedulerPrototype.scheduleAbsolute = function(dueTime, action){return this.scheduleAbsoluteWithState(action, dueTime, invokeAction);};VirtualTimeSchedulerPrototype.scheduleAbsoluteWithState = function(state, dueTime, action){var self=this;function run(scheduler, state1){self.queue.remove(si);return action(scheduler, state1);}var si=new ScheduledItem(this, state, run, dueTime, this.comparer);this.queue.enqueue(si);return si.disposable;};return VirtualTimeScheduler;})(Scheduler);Rx.HistoricalScheduler = (function(__super__){inherits(HistoricalScheduler, __super__);function HistoricalScheduler(initialClock, comparer){var clock=initialClock == null?0:initialClock;var cmp=comparer || defaultSubComparer;__super__.call(this, clock, cmp);}var HistoricalSchedulerProto=HistoricalScheduler.prototype;HistoricalSchedulerProto.add = function(absolute, relative){return absolute + relative;};HistoricalSchedulerProto.toDateTimeOffset = function(absolute){return new Date(absolute).getTime();};HistoricalSchedulerProto.toRelative = function(timeSpan){return timeSpan;};return HistoricalScheduler;})(Rx.VirtualTimeScheduler);var AnonymousObservable=Rx.AnonymousObservable = (function(__super__){inherits(AnonymousObservable, __super__);function fixSubscriber(subscriber){if(subscriber && typeof subscriber.dispose === "function"){return subscriber;}return typeof subscriber === "function"?disposableCreate(subscriber):disposableEmpty;}function AnonymousObservable(subscribe, parent){this.source = parent;if(!(this instanceof AnonymousObservable)){return new AnonymousObservable(subscribe);}function s(observer){var setDisposable=function setDisposable(){try{autoDetachObserver.setDisposable(fixSubscriber(subscribe(autoDetachObserver)));}catch(e) {if(!autoDetachObserver.fail(e)){throw e;}}};var autoDetachObserver=new AutoDetachObserver(observer);if(currentThreadScheduler.scheduleRequired()){currentThreadScheduler.schedule(setDisposable);}else {setDisposable();}return autoDetachObserver;}__super__.call(this, s);}return AnonymousObservable;})(Observable);var AutoDetachObserver=(function(__super__){inherits(AutoDetachObserver, __super__);function AutoDetachObserver(observer){__super__.call(this);this.observer = observer;this.m = new SingleAssignmentDisposable();}var AutoDetachObserverPrototype=AutoDetachObserver.prototype;AutoDetachObserverPrototype.next = function(value){var noError=false;try{this.observer.onNext(value);noError = true;}catch(e) {throw e;}finally {!noError && this.dispose();}};AutoDetachObserverPrototype.error = function(err){try{this.observer.onError(err);}catch(e) {throw e;}finally {this.dispose();}};AutoDetachObserverPrototype.completed = function(){try{this.observer.onCompleted();}catch(e) {throw e;}finally {this.dispose();}};AutoDetachObserverPrototype.setDisposable = function(value){this.m.setDisposable(value);};AutoDetachObserverPrototype.getDisposable = function(){return this.m.getDisposable();};AutoDetachObserverPrototype.dispose = function(){__super__.prototype.dispose.call(this);this.m.dispose();};return AutoDetachObserver;})(AbstractObserver);var GroupedObservable=(function(__super__){inherits(GroupedObservable, __super__);function subscribe(observer){return this.underlyingObservable.subscribe(observer);}function GroupedObservable(key, underlyingObservable, mergedDisposable){__super__.call(this, subscribe);this.key = key;this.underlyingObservable = !mergedDisposable?underlyingObservable:new AnonymousObservable(function(observer){return new CompositeDisposable(mergedDisposable.getDisposable(), underlyingObservable.subscribe(observer));});}return GroupedObservable;})(Observable);var Subject=Rx.Subject = (function(__super__){function subscribe(observer){checkDisposed.call(this);if(!this.isStopped){this.observers.push(observer);return new InnerSubscription(this, observer);}if(this.hasError){observer.onError(this.error);return disposableEmpty;}observer.onCompleted();return disposableEmpty;}inherits(Subject, __super__);function Subject(){__super__.call(this, subscribe);this.isDisposed = false, this.isStopped = false, this.observers = [];this.hasError = false;}addProperties(Subject.prototype, Observer.prototype, {hasObservers:function hasObservers(){return this.observers.length > 0;}, onCompleted:function onCompleted(){checkDisposed.call(this);if(!this.isStopped){var os=this.observers.slice(0);this.isStopped = true;for(var i=0, len=os.length; i < len; i++) {os[i].onCompleted();}this.observers.length = 0;}}, onError:function onError(error){checkDisposed.call(this);if(!this.isStopped){var os=this.observers.slice(0);this.isStopped = true;this.error = error;this.hasError = true;for(var i=0, len=os.length; i < len; i++) {os[i].onError(error);}this.observers.length = 0;}}, onNext:function onNext(value){checkDisposed.call(this);if(!this.isStopped){var os=this.observers.slice(0);for(var i=0, len=os.length; i < len; i++) {os[i].onNext(value);}}}, dispose:function dispose(){this.isDisposed = true;this.observers = null;}});Subject.create = function(observer, observable){return new AnonymousSubject(observer, observable);};return Subject;})(Observable);var AsyncSubject=Rx.AsyncSubject = (function(__super__){function subscribe(observer){checkDisposed.call(this);if(!this.isStopped){this.observers.push(observer);return new InnerSubscription(this, observer);}if(this.hasError){observer.onError(this.error);}else if(this.hasValue){observer.onNext(this.value);observer.onCompleted();}else {observer.onCompleted();}return disposableEmpty;}inherits(AsyncSubject, __super__);function AsyncSubject(){__super__.call(this, subscribe);this.isDisposed = false;this.isStopped = false;this.hasValue = false;this.observers = [];this.hasError = false;}addProperties(AsyncSubject.prototype, Observer, {hasObservers:function hasObservers(){checkDisposed.call(this);return this.observers.length > 0;}, onCompleted:function onCompleted(){var i, len;checkDisposed.call(this);if(!this.isStopped){this.isStopped = true;var os=this.observers.slice(0), len=os.length;if(this.hasValue){for(i = 0; i < len; i++) {var o=os[i];o.onNext(this.value);o.onCompleted();}}else {for(i = 0; i < len; i++) {os[i].onCompleted();}}this.observers.length = 0;}}, onError:function onError(error){checkDisposed.call(this);if(!this.isStopped){var os=this.observers.slice(0);this.isStopped = true;this.hasError = true;this.error = error;for(var i=0, len=os.length; i < len; i++) {os[i].onError(error);}this.observers.length = 0;}}, onNext:function onNext(value){checkDisposed.call(this);if(this.isStopped){return;}this.value = value;this.hasValue = true;}, dispose:function dispose(){this.isDisposed = true;this.observers = null;this.exception = null;this.value = null;}});return AsyncSubject;})(Observable);var AnonymousSubject=Rx.AnonymousSubject = (function(__super__){inherits(AnonymousSubject, __super__);function subscribe(observer){this.observable.subscribe(observer);}function AnonymousSubject(observer, observable){this.observer = observer;this.observable = observable;__super__.call(this, subscribe);}addProperties(AnonymousSubject.prototype, Observer.prototype, {onCompleted:function onCompleted(){this.observer.onCompleted();}, onError:function onError(error){this.observer.onError(error);}, onNext:function onNext(value){this.observer.onNext(value);}});return AnonymousSubject;})(Observable);Rx.Pauser = (function(__super__){inherits(Pauser, __super__);function Pauser(){__super__.call(this);}Pauser.prototype.pause = function(){this.onNext(false);};Pauser.prototype.resume = function(){this.onNext(true);};return Pauser;})(Subject);if(true){root.Rx = Rx;!(__WEBPACK_AMD_DEFINE_RESULT__ = function(){return Rx;}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));}else if(freeExports && freeModule){if(moduleExports){(freeModule.exports = Rx).Rx = Rx;}else {freeExports.Rx = Rx;}}else {root.Rx = Rx;}var rEndingLine=captureLine();}).call(undefined);
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(25)(module), (function() { return this; }()), __webpack_require__(28)))

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	function CycleInterfaceError(message, missingMember) {
	  this.name = "CycleInterfaceError";
	  this.message = message || "";
	  this.missingMember = missingMember || "";
	}
	CycleInterfaceError.prototype = Error.prototype;
	
	function customInterfaceErrorMessageInInject(dataFlowNode, message) {
	  var originalInject = dataFlowNode.inject;
	  dataFlowNode.inject = function inject() {
	    try {
	      return originalInject.apply({}, arguments);
	    } catch (err) {
	      if (err.name === "CycleInterfaceError") {
	        throw new CycleInterfaceError(message + err.missingMember, err.missingMember);
	      } else {
	        throw err;
	      }
	    }
	  };
	  return dataFlowNode;
	}
	
	module.exports = {
	  CycleInterfaceError: CycleInterfaceError,
	  customInterfaceErrorMessageInInject: customInterfaceErrorMessageInInject
	};

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var Rx = __webpack_require__(16);
	
	function InputProxy() {
	  this.proxiedProps = {};
	  // For any DataFlowNode
	  this.get = function getFromProxy(streamKey) {
	    if (typeof this.proxiedProps[streamKey] === "undefined") {
	      this.proxiedProps[streamKey] = new Rx.Subject();
	    }
	    return this.proxiedProps[streamKey];
	  };
	  // For the DOMUser
	  this.event$ = function event$FromProxy(selector, eventName) {
	    if (typeof this.proxiedProps[selector] === "undefined") {
	      this.proxiedProps[selector] = {
	        _hasEvent$: true
	      };
	    }
	    if (typeof this.proxiedProps[selector][eventName] === "undefined") {
	      this.proxiedProps[selector][eventName] = new Rx.Subject();
	    }
	    return this.proxiedProps[selector][eventName];
	  };
	}
	
	module.exports = InputProxy;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	function endsWithDollarSign(str) {
	  if (typeof str !== "string") {
	    return false;
	  }
	  return str.indexOf("$", str.length - 1) !== -1;
	}
	
	module.exports = {
	  endsWithDollarSign: endsWithDollarSign
	};

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var diff = __webpack_require__(26);
	
	module.exports = diff;

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var patch = __webpack_require__(27);
	
	module.exports = patch;

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var InputProxy = __webpack_require__(18);
	var Utils = __webpack_require__(19);
	var Rx = __webpack_require__(16);
	
	function makeDispatchFunction(element, eventName) {
	  return function dispatchCustomEvent(evData) {
	    var event;
	    try {
	      event = new Event(eventName);
	    } catch (err) {
	      event = document.createEvent("Event");
	      event.initEvent(eventName, true, true);
	    }
	    event.data = evData;
	    element.dispatchEvent(event);
	  };
	}
	
	function subscribeDispatchers(element, eventStreams) {
	  if (!eventStreams || typeof eventStreams !== "object") {
	    return;
	  }
	
	  var disposables = new Rx.CompositeDisposable();
	  for (var streamName in eventStreams) {
	    if (eventStreams.hasOwnProperty(streamName)) {
	      if (Utils.endsWithDollarSign(streamName) && typeof eventStreams[streamName].subscribe === "function") {
	        var eventName = streamName.slice(0, -1);
	        var disposable = eventStreams[streamName].subscribe(makeDispatchFunction(element, eventName));
	        disposables.add(disposable);
	      }
	    }
	  }
	  return disposables;
	}
	
	function subscribeDispatchersWhenRootChanges(widget, eventStreams) {
	  widget._rootElem$.distinctUntilChanged(Rx.helpers.identity, function comparer(x, y) {
	    return x && y && x.isEqualNode && x.isEqualNode(y);
	  }).subscribe(function (rootElem) {
	    if (widget.eventStreamsSubscriptions) {
	      widget.eventStreamsSubscriptions.dispose();
	    }
	    widget.eventStreamsSubscriptions = subscribeDispatchers(rootElem, eventStreams);
	  });
	}
	
	function makeInputPropertiesProxy() {
	  var inputProxy = new InputProxy();
	  var oldGet = inputProxy.get;
	  inputProxy.get = function get(streamName) {
	    var result = oldGet.call(this, streamName);
	    if (result && result.distinctUntilChanged) {
	      return result.distinctUntilChanged();
	    } else {
	      return result;
	    }
	  };
	  return inputProxy;
	}
	
	function createContainerElement(tagName, vtreeProperties) {
	  var elem = document.createElement("div");
	  elem.className = vtreeProperties.className || "";
	  elem.id = vtreeProperties.id || "";
	  elem.className += " cycleCustomElement-" + tagName.toUpperCase();
	  elem.cycleCustomElementProperties = makeInputPropertiesProxy();
	  return elem;
	}
	
	function replicateUserRootElem$(user, widget) {
	  user._rootElem$.subscribe(function (elem) {
	    widget._rootElem$.onNext(elem);
	  });
	}
	
	function makeConstructor() {
	  return function customElementConstructor(vtree) {
	    this.type = "Widget";
	    this.properties = vtree.properties;
	    this.key = vtree.key;
	  };
	}
	
	function makeInit(tagName, definitionFn) {
	  var DOMUser = __webpack_require__(10);
	  return function initCustomElement() {
	    var widget = this;
	    var element = createContainerElement(tagName, widget.properties);
	    var user = new DOMUser(element);
	    var eventStreams = definitionFn(user, element.cycleCustomElementProperties);
	    widget._rootElem$ = new Rx.ReplaySubject(1);
	    replicateUserRootElem$(user, widget);
	    widget.eventStreamsSubscriptions = subscribeDispatchers(element, eventStreams);
	    subscribeDispatchersWhenRootChanges(widget, eventStreams);
	    widget.update(null, element);
	    return element;
	  };
	}
	
	function makeUpdate() {
	  return function updateCustomElement(prev, elem) {
	    if (!elem) {
	      return;
	    }
	    if (!elem.cycleCustomElementProperties) {
	      return;
	    }
	    if (!(elem.cycleCustomElementProperties instanceof InputProxy)) {
	      return;
	    }
	    if (!elem.cycleCustomElementProperties.proxiedProps) {
	      return;
	    }
	
	    var proxiedProps = elem.cycleCustomElementProperties.proxiedProps;
	    for (var prop in proxiedProps) {
	      if (proxiedProps.hasOwnProperty(prop)) {
	        var propStreamName = prop;
	        var propName = prop.slice(0, -1);
	        if (this.properties.hasOwnProperty(propName)) {
	          proxiedProps[propStreamName].onNext(this.properties[propName]);
	        }
	      }
	    }
	  };
	}
	
	module.exports = {
	  makeConstructor: makeConstructor,
	  makeInit: makeInit,
	  makeUpdate: makeUpdate
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var h = __webpack_require__(29);
	
	module.exports = h;

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var createElement = __webpack_require__(30);
	
	module.exports = createElement;

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	module.exports = function (module) {
		if (!module.webpackPolyfill) {
			module.deprecate = function () {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	};

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var isArray = __webpack_require__(47);
	
	var VPatch = __webpack_require__(37);
	var isVNode = __webpack_require__(33);
	var isVText = __webpack_require__(34);
	var isWidget = __webpack_require__(35);
	var isThunk = __webpack_require__(38);
	var handleThunk = __webpack_require__(36);
	
	var diffProps = __webpack_require__(39);
	
	module.exports = diff;
	
	function diff(a, b) {
	    var patch = { a: a };
	    walk(a, b, patch, 0);
	    return patch;
	}
	
	function walk(a, b, patch, index) {
	    if (a === b) {
	        return;
	    }
	
	    var apply = patch[index];
	    var applyClear = false;
	
	    if (isThunk(a) || isThunk(b)) {
	        thunks(a, b, patch, index);
	    } else if (b == null) {
	
	        // If a is a widget we will add a remove patch for it
	        // Otherwise any child widgets/hooks must be destroyed.
	        // This prevents adding two remove patches for a widget.
	        if (!isWidget(a)) {
	            clearState(a, patch, index);
	            apply = patch[index];
	        }
	
	        apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b));
	    } else if (isVNode(b)) {
	        if (isVNode(a)) {
	            if (a.tagName === b.tagName && a.namespace === b.namespace && a.key === b.key) {
	                var propsPatch = diffProps(a.properties, b.properties);
	                if (propsPatch) {
	                    apply = appendPatch(apply, new VPatch(VPatch.PROPS, a, propsPatch));
	                }
	                apply = diffChildren(a, b, patch, apply, index);
	            } else {
	                apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b));
	                applyClear = true;
	            }
	        } else {
	            apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b));
	            applyClear = true;
	        }
	    } else if (isVText(b)) {
	        if (!isVText(a)) {
	            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b));
	            applyClear = true;
	        } else if (a.text !== b.text) {
	            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b));
	        }
	    } else if (isWidget(b)) {
	        if (!isWidget(a)) {
	            applyClear = true;
	        }
	
	        apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b));
	    }
	
	    if (apply) {
	        patch[index] = apply;
	    }
	
	    if (applyClear) {
	        clearState(a, patch, index);
	    }
	}
	
	function diffChildren(a, b, patch, apply, index) {
	    var aChildren = a.children;
	    var bChildren = reorder(aChildren, b.children);
	
	    var aLen = aChildren.length;
	    var bLen = bChildren.length;
	    var len = aLen > bLen ? aLen : bLen;
	
	    for (var i = 0; i < len; i++) {
	        var leftNode = aChildren[i];
	        var rightNode = bChildren[i];
	        index += 1;
	
	        if (!leftNode) {
	            if (rightNode) {
	                // Excess nodes in b need to be added
	                apply = appendPatch(apply, new VPatch(VPatch.INSERT, null, rightNode));
	            }
	        } else {
	            walk(leftNode, rightNode, patch, index);
	        }
	
	        if (isVNode(leftNode) && leftNode.count) {
	            index += leftNode.count;
	        }
	    }
	
	    if (bChildren.moves) {
	        // Reorder nodes last
	        apply = appendPatch(apply, new VPatch(VPatch.ORDER, a, bChildren.moves));
	    }
	
	    return apply;
	}
	
	function clearState(vNode, patch, index) {
	    // TODO: Make this a single walk, not two
	    unhook(vNode, patch, index);
	    destroyWidgets(vNode, patch, index);
	}
	
	// Patch records for all destroyed widgets must be added because we need
	// a DOM node reference for the destroy function
	function destroyWidgets(vNode, patch, index) {
	    if (isWidget(vNode)) {
	        if (typeof vNode.destroy === "function") {
	            patch[index] = appendPatch(patch[index], new VPatch(VPatch.REMOVE, vNode, null));
	        }
	    } else if (isVNode(vNode) && (vNode.hasWidgets || vNode.hasThunks)) {
	        var children = vNode.children;
	        var len = children.length;
	        for (var i = 0; i < len; i++) {
	            var child = children[i];
	            index += 1;
	
	            destroyWidgets(child, patch, index);
	
	            if (isVNode(child) && child.count) {
	                index += child.count;
	            }
	        }
	    } else if (isThunk(vNode)) {
	        thunks(vNode, null, patch, index);
	    }
	}
	
	// Create a sub-patch for thunks
	function thunks(a, b, patch, index) {
	    var nodes = handleThunk(a, b);
	    var thunkPatch = diff(nodes.a, nodes.b);
	    if (hasPatches(thunkPatch)) {
	        patch[index] = new VPatch(VPatch.THUNK, null, thunkPatch);
	    }
	}
	
	function hasPatches(patch) {
	    for (var index in patch) {
	        if (index !== "a") {
	            return true;
	        }
	    }
	
	    return false;
	}
	
	// Execute hooks when two nodes are identical
	function unhook(vNode, patch, index) {
	    if (isVNode(vNode)) {
	        if (vNode.hooks) {
	            patch[index] = appendPatch(patch[index], new VPatch(VPatch.PROPS, vNode, undefinedKeys(vNode.hooks)));
	        }
	
	        if (vNode.descendantHooks || vNode.hasThunks) {
	            var children = vNode.children;
	            var len = children.length;
	            for (var i = 0; i < len; i++) {
	                var child = children[i];
	                index += 1;
	
	                unhook(child, patch, index);
	
	                if (isVNode(child) && child.count) {
	                    index += child.count;
	                }
	            }
	        }
	    } else if (isThunk(vNode)) {
	        thunks(vNode, null, patch, index);
	    }
	}
	
	function undefinedKeys(obj) {
	    var result = {};
	
	    for (var key in obj) {
	        result[key] = undefined;
	    }
	
	    return result;
	}
	
	// List diff, naive left to right reordering
	function reorder(aChildren, bChildren) {
	
	    var bKeys = keyIndex(bChildren);
	
	    if (!bKeys) {
	        return bChildren;
	    }
	
	    var aKeys = keyIndex(aChildren);
	
	    if (!aKeys) {
	        return bChildren;
	    }
	
	    var bMatch = {},
	        aMatch = {};
	
	    for (var aKey in bKeys) {
	        bMatch[bKeys[aKey]] = aKeys[aKey];
	    }
	
	    for (var bKey in aKeys) {
	        aMatch[aKeys[bKey]] = bKeys[bKey];
	    }
	
	    var aLen = aChildren.length;
	    var bLen = bChildren.length;
	    var len = aLen > bLen ? aLen : bLen;
	    var shuffle = [];
	    var freeIndex = 0;
	    var i = 0;
	    var moveIndex = 0;
	    var moves = {};
	    var removes = moves.removes = {};
	    var reverse = moves.reverse = {};
	    var hasMoves = false;
	
	    while (freeIndex < len) {
	        var move = aMatch[i];
	        if (move !== undefined) {
	            shuffle[i] = bChildren[move];
	            if (move !== moveIndex) {
	                moves[move] = moveIndex;
	                reverse[moveIndex] = move;
	                hasMoves = true;
	            }
	            moveIndex++;
	        } else if (i in aMatch) {
	            shuffle[i] = undefined;
	            removes[i] = moveIndex++;
	            hasMoves = true;
	        } else {
	            while (bMatch[freeIndex] !== undefined) {
	                freeIndex++;
	            }
	
	            if (freeIndex < len) {
	                var freeChild = bChildren[freeIndex];
	                if (freeChild) {
	                    shuffle[i] = freeChild;
	                    if (freeIndex !== moveIndex) {
	                        hasMoves = true;
	                        moves[freeIndex] = moveIndex;
	                        reverse[moveIndex] = freeIndex;
	                    }
	                    moveIndex++;
	                }
	                freeIndex++;
	            }
	        }
	        i++;
	    }
	
	    if (hasMoves) {
	        shuffle.moves = moves;
	    }
	
	    return shuffle;
	}
	
	function keyIndex(children) {
	    var i, keys;
	
	    for (i = 0; i < children.length; i++) {
	        var child = children[i];
	
	        if (child.key !== undefined) {
	            keys = keys || {};
	            keys[child.key] = i;
	        }
	    }
	
	    return keys;
	}
	
	function appendPatch(apply, patch) {
	    if (apply) {
	        if (isArray(apply)) {
	            apply.push(patch);
	        } else {
	            apply = [apply, patch];
	        }
	
	        return apply;
	    } else {
	        return patch;
	    }
	}

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var document = __webpack_require__(48);
	var isArray = __webpack_require__(47);
	
	var domIndex = __webpack_require__(31);
	var patchOp = __webpack_require__(32);
	module.exports = patch;
	
	function patch(rootNode, patches) {
	    return patchRecursive(rootNode, patches);
	}
	
	function patchRecursive(rootNode, patches, renderOptions) {
	    var indices = patchIndices(patches);
	
	    if (indices.length === 0) {
	        return rootNode;
	    }
	
	    var index = domIndex(rootNode, patches.a, indices);
	    var ownerDocument = rootNode.ownerDocument;
	
	    if (!renderOptions) {
	        renderOptions = { patch: patchRecursive };
	        if (ownerDocument !== document) {
	            renderOptions.document = ownerDocument;
	        }
	    }
	
	    for (var i = 0; i < indices.length; i++) {
	        var nodeIndex = indices[i];
	        rootNode = applyPatch(rootNode, index[nodeIndex], patches[nodeIndex], renderOptions);
	    }
	
	    return rootNode;
	}
	
	function applyPatch(rootNode, domNode, patchList, renderOptions) {
	    if (!domNode) {
	        return rootNode;
	    }
	
	    var newNode;
	
	    if (isArray(patchList)) {
	        for (var i = 0; i < patchList.length; i++) {
	            newNode = patchOp(patchList[i], domNode, renderOptions);
	
	            if (domNode === rootNode) {
	                rootNode = newNode;
	            }
	        }
	    } else {
	        newNode = patchOp(patchList, domNode, renderOptions);
	
	        if (domNode === rootNode) {
	            rootNode = newNode;
	        }
	    }
	
	    return rootNode;
	}
	
	function patchIndices(patches) {
	    var indices = [];
	
	    for (var key in patches) {
	        if (key !== "a") {
	            indices.push(Number(key));
	        }
	    }
	
	    return indices;
	}

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	// shim for using process in browser
	
	var process = module.exports = {};
	var queue = [];
	var draining = false;
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    draining = true;
	    var currentQueue;
	    var len = queue.length;
	    while (len) {
	        currentQueue = queue;
	        queue = [];
	        var i = -1;
	        while (++i < len) {
	            currentQueue[i]();
	        }
	        len = queue.length;
	    }
	    draining = false;
	}
	process.nextTick = function (fun) {
	    queue.push(fun);
	    if (!draining) {
	        setTimeout(drainQueue, 0);
	    }
	};
	
	process.title = "browser";
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ""; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error("process.binding is not supported");
	};
	
	// TODO(shtylman)
	process.cwd = function () {
	    return "/";
	};
	process.chdir = function (dir) {
	    throw new Error("process.chdir is not supported");
	};
	process.umask = function () {
	    return 0;
	};

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var isArray = __webpack_require__(47);
	
	var VNode = __webpack_require__(40);
	var VText = __webpack_require__(41);
	var isVNode = __webpack_require__(33);
	var isVText = __webpack_require__(34);
	var isWidget = __webpack_require__(35);
	var isHook = __webpack_require__(42);
	var isVThunk = __webpack_require__(38);
	
	var parseTag = __webpack_require__(43);
	var softSetHook = __webpack_require__(44);
	var evHook = __webpack_require__(45);
	
	module.exports = h;
	
	function h(tagName, properties, children) {
	    var childNodes = [];
	    var tag, props, key, namespace;
	
	    if (!children && isChildren(properties)) {
	        children = properties;
	        props = {};
	    }
	
	    props = props || properties || {};
	    tag = parseTag(tagName, props);
	
	    // support keys
	    if (props.hasOwnProperty("key")) {
	        key = props.key;
	        props.key = undefined;
	    }
	
	    // support namespace
	    if (props.hasOwnProperty("namespace")) {
	        namespace = props.namespace;
	        props.namespace = undefined;
	    }
	
	    // fix cursor bug
	    if (tag === "INPUT" && !namespace && props.hasOwnProperty("value") && props.value !== undefined && !isHook(props.value)) {
	        props.value = softSetHook(props.value);
	    }
	
	    transformProperties(props);
	
	    if (children !== undefined && children !== null) {
	        addChild(children, childNodes, tag, props);
	    }
	
	    return new VNode(tag, props, childNodes, key, namespace);
	}
	
	function addChild(c, childNodes, tag, props) {
	    if (typeof c === "string") {
	        childNodes.push(new VText(c));
	    } else if (isChild(c)) {
	        childNodes.push(c);
	    } else if (isArray(c)) {
	        for (var i = 0; i < c.length; i++) {
	            addChild(c[i], childNodes, tag, props);
	        }
	    } else if (c === null || c === undefined) {
	        return;
	    } else {
	        throw UnexpectedVirtualElement({
	            foreignObject: c,
	            parentVnode: {
	                tagName: tag,
	                properties: props
	            }
	        });
	    }
	}
	
	function transformProperties(props) {
	    for (var propName in props) {
	        if (props.hasOwnProperty(propName)) {
	            var value = props[propName];
	
	            if (isHook(value)) {
	                continue;
	            }
	
	            if (propName.substr(0, 3) === "ev-") {
	                // add ev-foo support
	                props[propName] = evHook(value);
	            }
	        }
	    }
	}
	
	function isChild(x) {
	    return isVNode(x) || isVText(x) || isWidget(x) || isVThunk(x);
	}
	
	function isChildren(x) {
	    return typeof x === "string" || isArray(x) || isChild(x);
	}
	
	function UnexpectedVirtualElement(data) {
	    var err = new Error();
	
	    err.type = "virtual-hyperscript.unexpected.virtual-element";
	    err.message = "Unexpected virtual child passed to h().\n" + "Expected a VNode / Vthunk / VWidget / string but:\n" + "got:\n" + errorString(data.foreignObject) + ".\n" + "The parent vnode is:\n" + errorString(data.parentVnode);
	    "\n" + "Suggested fix: change your `h(..., [ ... ])` callsite.";
	    err.foreignObject = data.foreignObject;
	    err.parentVnode = data.parentVnode;
	
	    return err;
	}
	
	function errorString(obj) {
	    try {
	        return JSON.stringify(obj, null, "    ");
	    } catch (e) {
	        return String(obj);
	    }
	}

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var document = __webpack_require__(48);
	
	var applyProperties = __webpack_require__(46);
	
	var isVNode = __webpack_require__(33);
	var isVText = __webpack_require__(34);
	var isWidget = __webpack_require__(35);
	var handleThunk = __webpack_require__(36);
	
	module.exports = createElement;
	
	function createElement(vnode, opts) {
	    var doc = opts ? opts.document || document : document;
	    var warn = opts ? opts.warn : null;
	
	    vnode = handleThunk(vnode).a;
	
	    if (isWidget(vnode)) {
	        return vnode.init();
	    } else if (isVText(vnode)) {
	        return doc.createTextNode(vnode.text);
	    } else if (!isVNode(vnode)) {
	        if (warn) {
	            warn("Item is not a valid virtual dom node", vnode);
	        }
	        return null;
	    }
	
	    var node = vnode.namespace === null ? doc.createElement(vnode.tagName) : doc.createElementNS(vnode.namespace, vnode.tagName);
	
	    var props = vnode.properties;
	    applyProperties(node, props);
	
	    var children = vnode.children;
	
	    for (var i = 0; i < children.length; i++) {
	        var childNode = createElement(children[i], opts);
	        if (childNode) {
	            node.appendChild(childNode);
	        }
	    }
	
	    return node;
	}

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
	// We don't want to read all of the DOM nodes in the tree so we use
	// the in-order tree indexing to eliminate recursion down certain branches.
	// We only recurse into a DOM node if we know that it contains a child of
	// interest.
	
	var noChild = {};
	
	module.exports = domIndex;
	
	function domIndex(rootNode, tree, indices, nodes) {
	    if (!indices || indices.length === 0) {
	        return {};
	    } else {
	        indices.sort(ascending);
	        return recurse(rootNode, tree, indices, nodes, 0);
	    }
	}
	
	function recurse(rootNode, tree, indices, nodes, rootIndex) {
	    nodes = nodes || {};
	
	    if (rootNode) {
	        if (indexInRange(indices, rootIndex, rootIndex)) {
	            nodes[rootIndex] = rootNode;
	        }
	
	        var vChildren = tree.children;
	
	        if (vChildren) {
	
	            var childNodes = rootNode.childNodes;
	
	            for (var i = 0; i < tree.children.length; i++) {
	                rootIndex += 1;
	
	                var vChild = vChildren[i] || noChild;
	                var nextIndex = rootIndex + (vChild.count || 0);
	
	                // skip recursion down the tree if there are no nodes down here
	                if (indexInRange(indices, rootIndex, nextIndex)) {
	                    recurse(childNodes[i], vChild, indices, nodes, rootIndex);
	                }
	
	                rootIndex = nextIndex;
	            }
	        }
	    }
	
	    return nodes;
	}
	
	// Binary search for an index in the interval [left, right]
	function indexInRange(indices, left, right) {
	    if (indices.length === 0) {
	        return false;
	    }
	
	    var minIndex = 0;
	    var maxIndex = indices.length - 1;
	    var currentIndex;
	    var currentItem;
	
	    while (minIndex <= maxIndex) {
	        currentIndex = (maxIndex + minIndex) / 2 >> 0;
	        currentItem = indices[currentIndex];
	
	        if (minIndex === maxIndex) {
	            return currentItem >= left && currentItem <= right;
	        } else if (currentItem < left) {
	            minIndex = currentIndex + 1;
	        } else if (currentItem > right) {
	            maxIndex = currentIndex - 1;
	        } else {
	            return true;
	        }
	    }
	
	    return false;
	}
	
	function ascending(a, b) {
	    return a > b ? 1 : -1;
	}

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var applyProperties = __webpack_require__(46);
	
	var isWidget = __webpack_require__(35);
	var VPatch = __webpack_require__(37);
	
	var render = __webpack_require__(30);
	var updateWidget = __webpack_require__(49);
	
	module.exports = applyPatch;
	
	function applyPatch(vpatch, domNode, renderOptions) {
	    var type = vpatch.type;
	    var vNode = vpatch.vNode;
	    var patch = vpatch.patch;
	
	    switch (type) {
	        case VPatch.REMOVE:
	            return removeNode(domNode, vNode);
	        case VPatch.INSERT:
	            return insertNode(domNode, patch, renderOptions);
	        case VPatch.VTEXT:
	            return stringPatch(domNode, vNode, patch, renderOptions);
	        case VPatch.WIDGET:
	            return widgetPatch(domNode, vNode, patch, renderOptions);
	        case VPatch.VNODE:
	            return vNodePatch(domNode, vNode, patch, renderOptions);
	        case VPatch.ORDER:
	            reorderChildren(domNode, patch);
	            return domNode;
	        case VPatch.PROPS:
	            applyProperties(domNode, patch, vNode.properties);
	            return domNode;
	        case VPatch.THUNK:
	            return replaceRoot(domNode, renderOptions.patch(domNode, patch, renderOptions));
	        default:
	            return domNode;
	    }
	}
	
	function removeNode(domNode, vNode) {
	    var parentNode = domNode.parentNode;
	
	    if (parentNode) {
	        parentNode.removeChild(domNode);
	    }
	
	    destroyWidget(domNode, vNode);
	
	    return null;
	}
	
	function insertNode(parentNode, vNode, renderOptions) {
	    var newNode = render(vNode, renderOptions);
	
	    if (parentNode) {
	        parentNode.appendChild(newNode);
	    }
	
	    return parentNode;
	}
	
	function stringPatch(domNode, leftVNode, vText, renderOptions) {
	    var newNode;
	
	    if (domNode.nodeType === 3) {
	        domNode.replaceData(0, domNode.length, vText.text);
	        newNode = domNode;
	    } else {
	        var parentNode = domNode.parentNode;
	        newNode = render(vText, renderOptions);
	
	        if (parentNode) {
	            parentNode.replaceChild(newNode, domNode);
	        }
	    }
	
	    return newNode;
	}
	
	function widgetPatch(domNode, leftVNode, widget, renderOptions) {
	    var updating = updateWidget(leftVNode, widget);
	    var newNode;
	
	    if (updating) {
	        newNode = widget.update(leftVNode, domNode) || domNode;
	    } else {
	        newNode = render(widget, renderOptions);
	    }
	
	    var parentNode = domNode.parentNode;
	
	    if (parentNode && newNode !== domNode) {
	        parentNode.replaceChild(newNode, domNode);
	    }
	
	    if (!updating) {
	        destroyWidget(domNode, leftVNode);
	    }
	
	    return newNode;
	}
	
	function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
	    var parentNode = domNode.parentNode;
	    var newNode = render(vNode, renderOptions);
	
	    if (parentNode) {
	        parentNode.replaceChild(newNode, domNode);
	    }
	
	    return newNode;
	}
	
	function destroyWidget(domNode, w) {
	    if (typeof w.destroy === "function" && isWidget(w)) {
	        w.destroy(domNode);
	    }
	}
	
	function reorderChildren(domNode, bIndex) {
	    var children = [];
	    var childNodes = domNode.childNodes;
	    var len = childNodes.length;
	    var i;
	    var reverseIndex = bIndex.reverse;
	
	    for (i = 0; i < len; i++) {
	        children.push(domNode.childNodes[i]);
	    }
	
	    var insertOffset = 0;
	    var move;
	    var node;
	    var insertNode;
	    var chainLength;
	    var insertedLength;
	    var nextSibling;
	    for (i = 0; i < len;) {
	        move = bIndex[i];
	        chainLength = 1;
	        if (move !== undefined && move !== i) {
	            // try to bring forward as long of a chain as possible
	            while (bIndex[i + chainLength] === move + chainLength) {
	                chainLength++;
	            }
	
	            // the element currently at this index will be moved later so increase the insert offset
	            if (reverseIndex[i] > i + chainLength) {
	                insertOffset++;
	            }
	
	            node = children[move];
	            insertNode = childNodes[i + insertOffset] || null;
	            insertedLength = 0;
	            while (node !== insertNode && insertedLength++ < chainLength) {
	                domNode.insertBefore(node, insertNode);
	                node = children[move + insertedLength];
	            }
	
	            // the moved element came from the front of the array so reduce the insert offset
	            if (move + chainLength < i) {
	                insertOffset--;
	            }
	        }
	
	        // element at this index is scheduled to be removed so increase insert offset
	        if (i in bIndex.removes) {
	            insertOffset++;
	        }
	
	        i += chainLength;
	    }
	}
	
	function replaceRoot(oldRoot, newRoot) {
	    if (oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode) {
	        console.log(oldRoot);
	        oldRoot.parentNode.replaceChild(newRoot, oldRoot);
	    }
	
	    return newRoot;
	}

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var version = __webpack_require__(50);
	
	module.exports = isVirtualNode;
	
	function isVirtualNode(x) {
	    return x && x.type === "VirtualNode" && x.version === version;
	}

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var version = __webpack_require__(50);
	
	module.exports = isVirtualText;
	
	function isVirtualText(x) {
	    return x && x.type === "VirtualText" && x.version === version;
	}

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	module.exports = isWidget;
	
	function isWidget(w) {
	    return w && w.type === "Widget";
	}

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var isVNode = __webpack_require__(33);
	var isVText = __webpack_require__(34);
	var isWidget = __webpack_require__(35);
	var isThunk = __webpack_require__(38);
	
	module.exports = handleThunk;
	
	function handleThunk(a, b) {
	    var renderedA = a;
	    var renderedB = b;
	
	    if (isThunk(b)) {
	        renderedB = renderThunk(b, a);
	    }
	
	    if (isThunk(a)) {
	        renderedA = renderThunk(a, null);
	    }
	
	    return {
	        a: renderedA,
	        b: renderedB
	    };
	}
	
	function renderThunk(thunk, previous) {
	    var renderedThunk = thunk.vnode;
	
	    if (!renderedThunk) {
	        renderedThunk = thunk.vnode = thunk.render(previous);
	    }
	
	    if (!(isVNode(renderedThunk) || isVText(renderedThunk) || isWidget(renderedThunk))) {
	        throw new Error("thunk did not return a valid node");
	    }
	
	    return renderedThunk;
	}

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var version = __webpack_require__(50);
	
	VirtualPatch.NONE = 0;
	VirtualPatch.VTEXT = 1;
	VirtualPatch.VNODE = 2;
	VirtualPatch.WIDGET = 3;
	VirtualPatch.PROPS = 4;
	VirtualPatch.ORDER = 5;
	VirtualPatch.INSERT = 6;
	VirtualPatch.REMOVE = 7;
	VirtualPatch.THUNK = 8;
	
	module.exports = VirtualPatch;
	
	function VirtualPatch(type, vNode, patch) {
	    this.type = Number(type);
	    this.vNode = vNode;
	    this.patch = patch;
	}
	
	VirtualPatch.prototype.version = version;
	VirtualPatch.prototype.type = "VirtualPatch";

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	module.exports = isThunk;
	
	function isThunk(t) {
	    return t && t.type === "Thunk";
	}

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var isObject = __webpack_require__(52);
	var isHook = __webpack_require__(42);
	
	module.exports = diffProps;
	
	function diffProps(a, b) {
	    var diff;
	
	    for (var aKey in a) {
	        if (!(aKey in b)) {
	            diff = diff || {};
	            diff[aKey] = undefined;
	        }
	
	        var aValue = a[aKey];
	        var bValue = b[aKey];
	
	        if (aValue === bValue) {
	            continue;
	        } else if (isObject(aValue) && isObject(bValue)) {
	            if (getPrototype(bValue) !== getPrototype(aValue)) {
	                diff = diff || {};
	                diff[aKey] = bValue;
	            } else if (isHook(bValue)) {
	                diff = diff || {};
	                diff[aKey] = bValue;
	            } else {
	                var objectDiff = diffProps(aValue, bValue);
	                if (objectDiff) {
	                    diff = diff || {};
	                    diff[aKey] = objectDiff;
	                }
	            }
	        } else {
	            diff = diff || {};
	            diff[aKey] = bValue;
	        }
	    }
	
	    for (var bKey in b) {
	        if (!(bKey in a)) {
	            diff = diff || {};
	            diff[bKey] = b[bKey];
	        }
	    }
	
	    return diff;
	}
	
	function getPrototype(value) {
	    if (Object.getPrototypeOf) {
	        return Object.getPrototypeOf(value);
	    } else if (value.__proto__) {
	        return value.__proto__;
	    } else if (value.constructor) {
	        return value.constructor.prototype;
	    }
	}

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var version = __webpack_require__(50);
	var isVNode = __webpack_require__(33);
	var isWidget = __webpack_require__(35);
	var isThunk = __webpack_require__(38);
	var isVHook = __webpack_require__(42);
	
	module.exports = VirtualNode;
	
	var noProperties = {};
	var noChildren = [];
	
	function VirtualNode(tagName, properties, children, key, namespace) {
	    this.tagName = tagName;
	    this.properties = properties || noProperties;
	    this.children = children || noChildren;
	    this.key = key != null ? String(key) : undefined;
	    this.namespace = typeof namespace === "string" ? namespace : null;
	
	    var count = children && children.length || 0;
	    var descendants = 0;
	    var hasWidgets = false;
	    var hasThunks = false;
	    var descendantHooks = false;
	    var hooks;
	
	    for (var propName in properties) {
	        if (properties.hasOwnProperty(propName)) {
	            var property = properties[propName];
	            if (isVHook(property) && property.unhook) {
	                if (!hooks) {
	                    hooks = {};
	                }
	
	                hooks[propName] = property;
	            }
	        }
	    }
	
	    for (var i = 0; i < count; i++) {
	        var child = children[i];
	        if (isVNode(child)) {
	            descendants += child.count || 0;
	
	            if (!hasWidgets && child.hasWidgets) {
	                hasWidgets = true;
	            }
	
	            if (!hasThunks && child.hasThunks) {
	                hasThunks = true;
	            }
	
	            if (!descendantHooks && (child.hooks || child.descendantHooks)) {
	                descendantHooks = true;
	            }
	        } else if (!hasWidgets && isWidget(child)) {
	            if (typeof child.destroy === "function") {
	                hasWidgets = true;
	            }
	        } else if (!hasThunks && isThunk(child)) {
	            hasThunks = true;
	        }
	    }
	
	    this.count = count + descendants;
	    this.hasWidgets = hasWidgets;
	    this.hasThunks = hasThunks;
	    this.hooks = hooks;
	    this.descendantHooks = descendantHooks;
	}
	
	VirtualNode.prototype.version = version;
	VirtualNode.prototype.type = "VirtualNode";

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var version = __webpack_require__(50);
	
	module.exports = VirtualText;
	
	function VirtualText(text) {
	    this.text = String(text);
	}
	
	VirtualText.prototype.version = version;
	VirtualText.prototype.type = "VirtualText";

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	module.exports = isHook;
	
	function isHook(hook) {
	  return hook && (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") || typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"));
	}

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var split = __webpack_require__(53);
	
	var classIdSplit = /([\.#]?[a-zA-Z0-9_:-]+)/;
	var notClassId = /^\.|#/;
	
	module.exports = parseTag;
	
	function parseTag(tag, props) {
	    if (!tag) {
	        return "DIV";
	    }
	
	    var noId = !props.hasOwnProperty("id");
	
	    var tagParts = split(tag, classIdSplit);
	    var tagName = null;
	
	    if (notClassId.test(tagParts[1])) {
	        tagName = "DIV";
	    }
	
	    var classes, part, type, i;
	
	    for (i = 0; i < tagParts.length; i++) {
	        part = tagParts[i];
	
	        if (!part) {
	            continue;
	        }
	
	        type = part.charAt(0);
	
	        if (!tagName) {
	            tagName = part;
	        } else if (type === ".") {
	            classes = classes || [];
	            classes.push(part.substring(1, part.length));
	        } else if (type === "#" && noId) {
	            props.id = part.substring(1, part.length);
	        }
	    }
	
	    if (classes) {
	        if (props.className) {
	            classes.push(props.className);
	        }
	
	        props.className = classes.join(" ");
	    }
	
	    return props.namespace ? tagName : tagName.toUpperCase();
	}

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	module.exports = SoftSetHook;
	
	function SoftSetHook(value) {
	    if (!(this instanceof SoftSetHook)) {
	        return new SoftSetHook(value);
	    }
	
	    this.value = value;
	}
	
	SoftSetHook.prototype.hook = function (node, propertyName) {
	    if (node[propertyName] !== this.value) {
	        node[propertyName] = this.value;
	    }
	};

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var EvStore = __webpack_require__(54);
	
	module.exports = EvHook;
	
	function EvHook(value) {
	    if (!(this instanceof EvHook)) {
	        return new EvHook(value);
	    }
	
	    this.value = value;
	}
	
	EvHook.prototype.hook = function (node, propertyName) {
	    var es = EvStore(node);
	    var propName = propertyName.substr(3);
	
	    es[propName] = this.value;
	};
	
	EvHook.prototype.unhook = function (node, propertyName) {
	    var es = EvStore(node);
	    var propName = propertyName.substr(3);
	
	    es[propName] = undefined;
	};

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var isObject = __webpack_require__(52);
	var isHook = __webpack_require__(42);
	
	module.exports = applyProperties;
	
	function applyProperties(node, props, previous) {
	    for (var propName in props) {
	        var propValue = props[propName];
	
	        if (propValue === undefined) {
	            removeProperty(node, propName, propValue, previous);
	        } else if (isHook(propValue)) {
	            removeProperty(node, propName, propValue, previous);
	            if (propValue.hook) {
	                propValue.hook(node, propName, previous ? previous[propName] : undefined);
	            }
	        } else {
	            if (isObject(propValue)) {
	                patchObject(node, props, previous, propName, propValue);
	            } else {
	                node[propName] = propValue;
	            }
	        }
	    }
	}
	
	function removeProperty(node, propName, propValue, previous) {
	    if (previous) {
	        var previousValue = previous[propName];
	
	        if (!isHook(previousValue)) {
	            if (propName === "attributes") {
	                for (var attrName in previousValue) {
	                    node.removeAttribute(attrName);
	                }
	            } else if (propName === "style") {
	                for (var i in previousValue) {
	                    node.style[i] = "";
	                }
	            } else if (typeof previousValue === "string") {
	                node[propName] = "";
	            } else {
	                node[propName] = null;
	            }
	        } else if (previousValue.unhook) {
	            previousValue.unhook(node, propName, propValue);
	        }
	    }
	}
	
	function patchObject(node, props, previous, propName, propValue) {
	    var previousValue = previous ? previous[propName] : undefined;
	
	    // Set attributes
	    if (propName === "attributes") {
	        for (var attrName in propValue) {
	            var attrValue = propValue[attrName];
	
	            if (attrValue === undefined) {
	                node.removeAttribute(attrName);
	            } else {
	                node.setAttribute(attrName, attrValue);
	            }
	        }
	
	        return;
	    }
	
	    if (previousValue && isObject(previousValue) && getPrototype(previousValue) !== getPrototype(propValue)) {
	        node[propName] = propValue;
	        return;
	    }
	
	    if (!isObject(node[propName])) {
	        node[propName] = {};
	    }
	
	    var replacer = propName === "style" ? "" : undefined;
	
	    for (var k in propValue) {
	        var value = propValue[k];
	        node[propName][k] = value === undefined ? replacer : value;
	    }
	}
	
	function getPrototype(value) {
	    if (Object.getPrototypeOf) {
	        return Object.getPrototypeOf(value);
	    } else if (value.__proto__) {
	        return value.__proto__;
	    } else if (value.constructor) {
	        return value.constructor.prototype;
	    }
	}

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var nativeIsArray = Array.isArray;
	var toString = Object.prototype.toString;
	
	module.exports = nativeIsArray || isArray;
	
	function isArray(obj) {
	    return toString.call(obj) === "[object Array]";
	}

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {"";
	
	var topLevel = typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : {};
	var minDoc = __webpack_require__(51);
	
	if (typeof document !== "undefined") {
	    module.exports = document;
	} else {
	    var doccy = topLevel["__GLOBAL_DOCUMENT_CACHE@4"];
	
	    if (!doccy) {
	        doccy = topLevel["__GLOBAL_DOCUMENT_CACHE@4"] = minDoc;
	    }
	
	    module.exports = doccy;
	}
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var isWidget = __webpack_require__(35);
	
	module.exports = updateWidget;
	
	function updateWidget(a, b) {
	    if (isWidget(a) && isWidget(b)) {
	        if ("name" in a && "name" in b) {
	            return a.id === b.id;
	        } else {
	            return a.init === b.init;
	        }
	    }
	
	    return false;
	}

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	module.exports = "1";

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	/* (ignored) */

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	module.exports = function isObject(x) {
		return typeof x === "object" && x !== null;
	};

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	/*!
	 * Cross-Browser Split 1.1.1
	 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
	 * Available under the MIT License
	 * ECMAScript compliant, uniform cross-browser split method
	 */
	
	/**
	 * Splits a string into an array of strings using a regex or string separator. Matches of the
	 * separator are not included in the result array. However, if `separator` is a regex that contains
	 * capturing groups, backreferences are spliced into the result each time `separator` is matched.
	 * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
	 * cross-browser.
	 * @param {String} str String to split.
	 * @param {RegExp|String} separator Regex or string to use for separating the string.
	 * @param {Number} [limit] Maximum number of items to include in the result array.
	 * @returns {Array} Array of substrings.
	 * @example
	 *
	 * // Basic use
	 * split('a b c d', ' ');
	 * // -> ['a', 'b', 'c', 'd']
	 *
	 * // With limit
	 * split('a b c d', ' ', 2);
	 * // -> ['a', 'b']
	 *
	 * // Backreferences in result array
	 * split('..word1 word2..', /([a-z]+)(\d+)/i);
	 * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
	 */
	module.exports = (function split(undef) {
	
	  var nativeSplit = String.prototype.split,
	      compliantExecNpcg = /()??/.exec("")[1] === undef,
	
	  // NPCG: nonparticipating capturing group
	  self;
	
	  self = function (str, separator, limit) {
	    // If `separator` is not a regex, use `nativeSplit`
	    if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
	      return nativeSplit.call(str, separator, limit);
	    }
	    var output = [],
	        flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + (separator.sticky ? "y" : ""),
	
	    // Firefox 3+
	    lastLastIndex = 0,
	
	    // Make `global` and avoid `lastIndex` issues by working with a copy
	    separator = new RegExp(separator.source, flags + "g"),
	        separator2,
	        match,
	        lastIndex,
	        lastLength;
	    str += ""; // Type-convert
	    if (!compliantExecNpcg) {
	      // Doesn't need flags gy, but they don't hurt
	      separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
	    }
	    /* Values for `limit`, per the spec:
	     * If undefined: 4294967295 // Math.pow(2, 32) - 1
	     * If 0, Infinity, or NaN: 0
	     * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
	     * If negative number: 4294967296 - Math.floor(Math.abs(limit))
	     * If other: Type-convert, then use the above rules
	     */
	    limit = limit === undef ? -1 >>> 0 : // Math.pow(2, 32) - 1
	    limit >>> 0; // ToUint32(limit)
	    while (match = separator.exec(str)) {
	      // `separator.lastIndex` is not reliable cross-browser
	      lastIndex = match.index + match[0].length;
	      if (lastIndex > lastLastIndex) {
	        output.push(str.slice(lastLastIndex, match.index));
	        // Fix browsers whose `exec` methods don't consistently return `undefined` for
	        // nonparticipating capturing groups
	        if (!compliantExecNpcg && match.length > 1) {
	          match[0].replace(separator2, function () {
	            for (var i = 1; i < arguments.length - 2; i++) {
	              if (arguments[i] === undef) {
	                match[i] = undef;
	              }
	            }
	          });
	        }
	        if (match.length > 1 && match.index < str.length) {
	          Array.prototype.push.apply(output, match.slice(1));
	        }
	        lastLength = match[0].length;
	        lastLastIndex = lastIndex;
	        if (output.length >= limit) {
	          break;
	        }
	      }
	      if (separator.lastIndex === match.index) {
	        separator.lastIndex++; // Avoid an infinite loop
	      }
	    }
	    if (lastLastIndex === str.length) {
	      if (lastLength || !separator.test("")) {
	        output.push("");
	      }
	    } else {
	      output.push(str.slice(lastLastIndex));
	    }
	    return output.length > limit ? output.slice(0, limit) : output;
	  };
	
	  return self;
	})();
	// Proposed for ES6

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var OneVersionConstraint = __webpack_require__(55);
	
	var MY_VERSION = "7";
	OneVersionConstraint("ev-store", MY_VERSION);
	
	var hashKey = "__EV_STORE_KEY@" + MY_VERSION;
	
	module.exports = EvStore;
	
	function EvStore(elem) {
	    var hash = elem[hashKey];
	
	    if (!hash) {
	        hash = elem[hashKey] = {};
	    }
	
	    return hash;
	}

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	"";
	
	var Individual = __webpack_require__(56);
	
	module.exports = OneVersion;
	
	function OneVersion(moduleName, version, defaultValue) {
	    var key = "__INDIVIDUAL_ONE_VERSION_" + moduleName;
	    var enforceKey = key + "_ENFORCE_SINGLETON";
	
	    var versionValue = Individual(enforceKey, version);
	
	    if (versionValue !== version) {
	        throw new Error("Can only have one copy of " + moduleName + ".\n" + "You already have version " + versionValue + " installed.\n" + "This means you cannot install version " + version);
	    }
	
	    return Individual(key, defaultValue);
	}

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {"";
	
	/*global window, global*/
	
	var root = typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
	
	module.exports = Individual;
	
	function Individual(key, value) {
	    if (key in root) {
	        return root[key];
	    }
	
	    root[key] = value;
	
	    return value;
	}
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }
/******/ ]);
//# sourceMappingURL=script.js.map