// markup.js
// (c) 2014 aikeru, MIT License
// generates angle-brackets (HTML, XML, etc.)
// has no dependencies

(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.returnExports = factory();
    }
}(this, function () {
	var keys = Object.keys || (function() {
		var hasOwnProperty = Object.prototype.hasOwnProperty,
			hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
			dontEnums = [
			  'toString',
			  'toLocaleString',
			  'valueOf',
			  'hasOwnProperty',
			  'isPrototypeOf',
			  'propertyIsEnumerable',
			  'constructor'
			],
			dontEnumsLength = dontEnums.length

		return function(obj) {
			if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object')

			var result = []

			for (var prop in obj) {
				if (hasOwnProperty.call(obj, prop)) result.push(prop)
			}

			if (hasDontEnumBug) {
				for (var i = 0; i < dontEnumsLength; i++) {
					if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i])
				}
			}
			return result
		}
	})();
	
	var create = Object.create || (function () {
        var F = function () {};
        return function create(o) {
            if (arguments.length > 1) { 
              throw Error('Second argument not supported');
            }
            if (o === null) { 
              throw Error('Cannot set a null [[Prototype]]');
            }
            if (typeof o != 'object') { 
              throw TypeError('Argument must be an object');
            }
            F.prototype = o;
            return new F();
        };
    })();
	
	var bind = Function.prototype.bind || function (oThis) {
		if (typeof this !== "function") {
		  // closest thing possible to the ECMAScript 5
		  // internal IsCallable function
		  throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}

		var aArgs = Array.prototype.slice.call(arguments, 1), 
			fToBind = this, 
			fNOP = function () {},
			fBound = function () {
			  return fToBind.apply(this instanceof fNOP && oThis
					 ? this
					 : oThis,
					 aArgs.concat(Array.prototype.slice.call(arguments)));
			};

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;
	};
	
	function type(obj) {
		return Object.prototype.toString.call(obj).match(/^\[object (.*)\]$/)[1];
	}
	
	function markupEscape(str) {
	   return (''+str)
			.replace(/&/g, '&amp;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}
	function mixWith(newAtts) {
		for (var attr in newAtts) {
			if (newAtts.hasOwnProperty(attr)) {
				this.attr(attr, newAtts[attr]);
			}
		}
	};
	function renderOpenTag(attributes) {
		var retTxt = '<' + this.tagName;
		if(attributes !== undefined) {
			for(var attr in attributes) {
				if(attributes.hasOwnProperty(attr)) {
					retTxt += ' ' + attr + ' = "' + attributes[attr] + '"';
				}
			}
		}
		if(this.selfClosing) { retTxt += ' />'; }
		else { retTxt += '>'; }
		return retTxt;
	};
	function renderCloseTag() {
		if(this.selfClosing) { return ''; }
		var retTxt = '</' + this.tagName + '>';
		return retTxt;
	};
	TagBase.prototype.render = function render() {
		var retTxt = this.renderOpenTag(),
			innerText = this.getInnerText();
		
		if(!this.selfClosing) {
			if(this.children !== undefined && this.children.length > 0) {
				for(var i = 0; i < this.children.length; i++) {
					var child = this.children[i];
					if(child.render !== undefined) {
						retTxt += child.render();
					} else {
						retTxt += child.toString();
					}
				}
			} else {
				if(innerText !== undefined) {
					retTxt += innerText;
				}
			}
		}
		retTxt += this.renderCloseTag();
		return retTxt;
	};
	var caseModes = {
		html: 0,
		xml: 1,
		unknown: 99
	};
	function attr(attributes, caseMode, attName, attValue) {
		var lowerName = (''+attName).toLowerCase();
		if (arguments.length < 4) {
			if(caseMode === caseModes.html) {
				//Just return lowercase attribute
				if (attributes[lowerName] !== undefined) {
					return attributes[lowerName];
				} else {
					return "";
				}
			} else {
				//Return case-sensitive attribute
				return attributes[attName];
			}
		} else {
			if(caseMode === caseModes.html) {
				//Just assign lowercase attribute
				attributes[lowerName] = attValue;
			} else {
				if(attributes[attName] !== undefined || attributes.hasOwnProperty(attName)) {
					//If we have the attribute, assign it
					attributes[attName] = attValue;
				} else {
					//Make sure we don't have another attribute that varies by case only
					for(var attr in attributes) {
						if(attributes.hasOwnProperty(attr)) {
							if(attr.toLowerCase() === lowerName) {
								throw new Error('Tried to assign ' + attName + ' when ' + attr + ' already exists.');
							}
						}
					}
					attributes[attName] = attValue;
				}
			}
		}
		return this;
	};
	function addClass(attributes, clsName) {
		if (attributes['class']) {
			var classes = attributes['class'].split(' ');
			for (var i = 0; i < classes.length; i++) {
				if (classes[i] === clsName) {
					return this;
				}
			}
			attributes['class'] += attributes['class'] ? ' ' + clsName : clsName;
			return this;
		} else {
			attributes['class'] = clsName;
		}
		return this;
	}
	function removeClass(attributes, clsName) {
		var newClasses = '';
		if(attributes['class']) {
			var classes = attributes['class'].split(' ');
			for(var i = 0; i < classes.length; i++) {
				if(classes[i] !== clsName) {
					newClasses += newClasses ? ' ' + classes[i] : classes[i];
				}
			}
			attributes['class'] = newClasses;
		}
		return this;
	}
	function hasClass(attributes, clsName) {
		if(attributes["class"]) {
			var classes = attributes["class"].split(' ');
			for(var i = 0; i < classes.length; i++) {
				if(classes[i] === clsName) {
					return true;
				}
			}
		}
		return false;
	}
	
	function TagBase(name, attribs, selfClosing) {		
		var self = this;
		if(name) self.tagName = name;
		if(attribs !== undefined) {
			if(type(attribs) === 'Boolean') { self.selfClosing = attribs; }
			else {
				_attributes = attribs;
			}
		}
		if(selfClosing !== undefined) { self.selfClosing = !!selfClosing; }
		else if(self.selfClosing === undefined) { self.selfClosing = false; }
		
		var _attributes = {};
		self.renderOpenTag = bind.call(renderOpenTag, this, _attributes);
		self.renderCloseTag = bind.cal(renderCloseTag, this);
		self.attr = bind.call(attr, this, _attributes, caseModes.html);
		self.children = [];
	}
			
	HtmlTag.prototype.constructor = HtmlTag;
	HtmlTag.prototype = Object.create(TagBase.prototype);
	function HtmlTag(name, attribs, selfClosing) {
		var self = this;
		var _attributes = {},
			_innerText;
		if(name) self.tagName = name;
		self.attr = bind.call(attr, this, _attributes, caseModes.html);
		if(attribs !== undefined) {
			if(type(attribs) === 'Boolean') { self.selfClosing = attribs; }
			else {
				mixWith.call(this, attribs);
			}
		}
		if(selfClosing !== undefined) { self.selfClosing = !!selfClosing; }
		else if(self.selfClosing === undefined) { self.selfClosing = false; }
		
		self.renderOpenTag = bind.call(renderOpenTag, this, _attributes);
		self.renderCloseTag = bind.call(renderCloseTag, this);
		self.render = bind.call(self.render, this);
		self.hasClass = bind.call(hasClass, this, _attributes);
		self.addClass = bind.call(addClass, this, _attributes);
		self.removeClass = bind.call(removeClass, this, _attributes);
		
		self.setInnerText = function(str) {
			_innerText = markupEscape(str);
		};
		self.getInnerText = function() {
			return _innerText;
		};
		self.children = [];
	};
	
	XmlTag.prototype = Object.create(TagBase.prototype);
	XmlTag.prototype.constructor = XmlTag;
	function XmlTag(name, attribs, selfClosing) {
		var self = this,
			_attributes = {},
			_innerText;
		if(name) self.tagName = name;
		self.attr = bind.call(attr, this, _attributes, caseModes.xml);
		if(attribs !== undefined) {
			if(type(attribs) === 'Boolean') { self.selfClosing = attribs; }
			else {
				mixWith.call(this, attribs);
			}
		}
		if(selfClosing !== undefined) { self.selfClosing = !!selfClosing; }
		else if(self.selfClosing === undefined) { self.selfClosing = false; }
		
		
		self.renderOpenTag = bind.call(renderOpenTag, this, _attributes);
		self.renderCloseTag = bind.call(renderCloseTag, this);
		self.setInnerText = function(str) {
			_innerText = markupEscape(str);
		};
		self.getInnerText = function() {
			return _innerText;
		};
		self.children = [];
	}
	
	TagLiteral.prototype = Object.create(TagBase.prototype);
	TagLiteral.prototype.constructor = TagLiteral;
	function TagLiteral(outputStr) {
		var _innerText = outputStr;
		this.render = function render() {
			return _innerText;
		};
		this.getInnerText = function() { return _innerText; };
		this.setInnerText = function(str) {  _innerText = str; };
	}

    return {
		TagBase: TagBase,
		XmlTag: XmlTag,
		HtmlTag: HtmlTag,
		TagLiteral: TagLiteral
	};
}));