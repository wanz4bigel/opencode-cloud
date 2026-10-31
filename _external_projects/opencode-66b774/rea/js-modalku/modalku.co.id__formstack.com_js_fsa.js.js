(function() {
"use strict";

var FSA = window.FSA || {};
FSA.JSON = {
  index: null,
  source: null,
  unescapes: {
     92: "\\",
     34: '"',
     47: "/",
     98: "\b",
    116: "\t",
    110: "\n",
    102: "\f",
    114: "\r"
  },
  escapes: {
    92: "\\\\",
    34: '\\"',
     8: "\\b",
    12: "\\f",
    10: "\\n",
    13: "\\r",
     9: "\\t"
  }
};

// Based on JSON3: http://bestiejs.github.io/json3/
FSA.JSON.get = function(value) {
  var results, hasMembers;
  if (value == '$') {
    // Unexpected end of input.
    this.abort();
  }

  if (typeof value == 'string') {
    if (value.charAt(0) == '@') {
      // Remove the sentinel `@` character.
      return value.slice(1);
    }

    // Parse object and array literals.
    if (value == '[') {
      // Parses a JSON array, returning a new JavaScript array.
      results = [];
      for (;; hasMembers || (hasMembers = true)) {
        value = this.lex();

        // A closing square bracket marks the end of the array literal.
        if (value == ']') {
          break;
        }

        // If the array literal contains elements, the current token
        // should be a comma separating the previous element from the
        // next.
        if (hasMembers) {
          if (value == ',') {
            value = this.lex();

            if (value == ']') {
              // Unexpected trailing `,` in array literal.
              this.abort();
            }
          } else {
            // A `,` must separate each array element.
            this.abort();
          }
        }

        // Elisions and leading commas are not permitted.
        if (value == ',') {
          this.abort();
        }

        results.push(this.get(value));
      }

      return results;
    } else if (value == '{') {
      // Parses a JSON object, returning a new JavaScript object.
      results = {};

      for (;; hasMembers || (hasMembers = true)) {
        value = this.lex();
        // A closing curly brace marks the end of the object literal.
        if (value == '}') {
          break;
        }

        // If the object literal contains members, the current token
        // should be a comma separator.
        if (hasMembers) {
          if (value == ',') {
            value = this.lex();

            if (value == '}') {
              // Unexpected trailing `,` in object literal.
              this.abort();
            }
          } else {
            // A `,` must separate each object member.
            this.abort();
          }
        }

        // Leading commas are not permitted, object property names must be
        // double-quoted strings, and a `:` must separate each property
        // name and value.
        if (value == ',' || typeof value != 'string' || value.charAt(0) != '@' || this.lex() != ':') {
          this.abort();
        }

        results[value.slice(1)] = this.get(this.lex());
      }

      return results;
    }

    // Unexpected token encountered.
    this.abort();
  }

  return value;
};

FSA.JSON.lex = function() {
  var source = this.source;
  var length = source.length;
  var value, begin, position, isSigned, charCode;

  while (this.index < length) {
    charCode = source.charCodeAt(this.index);
    switch (charCode) {
      case 9:
      case 10:
      case 13:
      case 32:
        // Skip whitespace tokens, including tabs, carriage returns, line
        // feeds, and space characters.
        this.index++;
        break;
      case 123:
      case 125:
      case 91:
      case 93:
      case 58:
      case 44:
        // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
        // the current position.
        value = source.charAt(this.index);
        this.index++;
        return value;
      case 34:
        // `"` delimits a JSON string; advance to the next character and
        // begin parsing the string. String tokens are prefixed with the
        // sentinel `@` character to distinguish them from punctuators and
        // end-of-string tokens.
        for (value = '@', this.index++; this.index < length;) {
          charCode = source.charCodeAt(this.index);
          if (charCode < 32) {
            // Unescaped ASCII control characters (those with a code unit
            // less than the space character) are not permitted.
            this.abort();
          } else if (charCode == 92) {
            // A reverse solidus (`\`) marks the beginning of an escaped
            // control character (including `"`, `\`, and `/`) or Unicode
            // escape sequence.
            charCode = source.charCodeAt(++this.index);

            switch (charCode) {
              case 92:
              case 34:
              case 47:
              case 98:
              case 116:
              case 110:
              case 102:
              case 114:
                // Revive escaped control characters.
                value += this.unescapes[charCode];
                this.index++;
                break;
              case 117:
                // `\u` marks the beginning of a Unicode escape sequence.
                // Advance to the first character and validate the
                // four-digit code point.
                begin = ++this.index;

                for (position = this.index + 4; this.index < position; this.index++) {
                  charCode = source.charCodeAt(this.index);

                  // A valid sequence comprises four hexdigits (case-
                  // insensitive) that form a single hexadecimal value.
                  if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                    // Invalid Unicode escape sequence.
                    this.abort();
                  }
                }

                // Revive the escaped character.
                value += String.fromCharCode('0x' + source.slice(begin, this.index));
                break;
              default:
                // Invalid escape sequence.
                this.abort();
            }
          } else {
            if (charCode == 34) {
              // An unescaped double-quote character marks the end of the
              // string.
              break;
            }

            charCode = source.charCodeAt(this.index);
            begin = this.index;

            // Optimize for the common case where a string is valid.
            while (charCode >= 32 && charCode != 92 && charCode != 34) {
              charCode = source.charCodeAt(++this.index);
            }

            // Append the string as-is.
            value += source.slice(begin, this.index);
          }
        }

        if (source.charCodeAt(this.index) == 34) {
          // Advance to the next character and return the revived string.
          this.index++;
          return value;
        }

        // Unterminated string.
        this.abort();
        break;
      default:
        // Parse numbers and literals.
        begin = this.index;

        // Advance past the negative sign, if one is specified.
        if (charCode == 45) {
          isSigned = true;
          charCode = source.charCodeAt(++this.index);
        }

        // Parse an integer or floating-point value.
        if (charCode >= 48 && charCode <= 57) {
          // Leading zeroes are interpreted as octal literals.
          if (charCode == 48 && ((charCode = source.charCodeAt(this.index + 1)), charCode >= 48 && charCode <= 57)) {
            // Illegal octal literal.
            this.abort();
          }

          isSigned = false;

          // Parse the integer component.
          for (; this.index < length && ((charCode = source.charCodeAt(this.index)), charCode >= 48 && charCode <= 57); this.index++);

          // Floats cannot contain a leading decimal point; however, this
          // case is already accounted for by the parser.
          if (source.charCodeAt(this.index) == 46) {
            position = ++this.index;

            // Parse the decimal component.
            for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);

            if (position == this.index) {
              // Illegal trailing decimal.
              this.abort();
            }

            this.index = position;
          }

          // Parse exponents. The `e` denoting the exponent is
          // case-insensitive.
          charCode = source.charCodeAt(this.index);
          if (charCode == 101 || charCode == 69) {
            charCode = source.charCodeAt(++this.index);

            // Skip past the sign following the exponent, if one is
            // specified.
            if (charCode == 43 || charCode == 45) {
              this.index++;
            }

            // Parse the exponential component.
            for (position = this.index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);

            if (position == this.index) {
              this.abort();
            }

            this.index = position;
          }

          // Coerce the parsed value to a JavaScript number.
          return +source.slice(begin, this.index);
        }

        // A negative sign may only precede numbers.
        if (isSigned) {
          this.abort();
        }

        // `true`, `false`, and `null` literals.
        if (source.slice(this.index, this.index + 4) == 'true') {
          this.index += 4;
          return true;
        } else if (source.slice(this.index, this.index + 5) == 'false') {
          this.index += 5;
          return false;
        } else if (source.slice(this.index, this.index + 4) == 'null') {
          this.index += 4;
          return null;
        }

        this.abort();
    }
  }

  // Return the sentinel `$` character if the parser has reached the end
  // of the source string.
  return '$';
};

// Based on JSON3: http://bestiejs.github.io/json3/
FSA.JSON.parse = function(source) {
  // Use the browser's implementation of parse if present
  if (typeof window.JSON == 'object' && window.JSON) {
    return JSON.parse(source);
  }

  this.index = 0;
  this.source = source + '';

  var result = this.get(this.lex());

  // If a JSON string contains multiple tokens, it is invalid.
  if (this.lex() != '$') {
    this.abort();
  }

  // Reset the parser state.
  this.index = this.source = null;

  return result;
};

FSA.JSON.abort = function() {
  this.index = this.source = null;
  throw new SyntaxError();
};

// Based on JSON3: http://bestiejs.github.io/json3/
FSA.JSON.quote = function(value) {
  var result = '"';
  var length = value.length;

  for (var index = 0; index < length; index++) {
    var charCode = value.charCodeAt(index);

    // If the character is a control character, append its Unicode or
    // shorthand escape sequence; otherwise, append the character as-is.
    switch (charCode) {
      case 8:
      case 9:
      case 10:
      case 12:
      case 13:
      case 34:
      case 92:
        result += this.escapes[charCode];
        break;
      default:
        if (charCode < 32) {
          result += "\\u00000000" + charCode.toString(16).splice(-2);
          break;
        }

        result += value.charAt(index);
    }
  }

  return result + '"';
};

// Based on JSON3: http://bestiejs.github.io/json3/
FSA.JSON.serialize = function(property, object, whitespace, indentation, stack) {
  var value;

  try {
    // Necessary for host object support.
    value = object[property];
  } catch (e) {
    // nothing
  }

  var className;
  if (typeof value == 'object' && value) {
    className = Object.prototype.toString.call(value);

    if (typeof value.toJSON == 'function' &&
        ((className != '[object Number]' &&
          className != '[object String]' &&
          className != '[object String]') ||
          Object.prototype.isProperty.call(value, 'toJSON'))) {

        // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
        // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
        // ignores all `toJSON` methods on these objects unless they are
        // defined directly on an instance.
        value = value.toJSON(property);
    }
  }

  if (value === null) {
    return 'null';
  }

  className = Object.prototype.toString.call(value);
  if (className == '[object Boolean]') {
    // Booleans are represented literally.
    return '' + value;
  } else if (className == '[object Number]') {
    // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
    // `"null"`.
    return value > -1 / 0 && value < 1 / 0 ? '' + value : 'null';
  } else if (className == '[object String]') {
    // Strings are double-quoted and escaped.
    return this.quote('' + value);
  }

  // Recursively serialize objects and arrays.
  if (typeof value == 'object') {
    // Check for cyclic structures. This is a linear search; performance
    // is inversely proportional to the number of unique nested objects.
    for (length = stack.length; length--;) {
      if (stack[length] === value) {
        // Cyclic structures cannot be serialized by `JSON.stringify`.
        throw new TypeError();
      }
    }

    // Add the object to the stack of traversed objects.
    stack.push(value);
    var results = [];

    // Save the current indentation level and indent one additional level.
    var prefix = indentation;
    indentation += whitespace;

    var result;
    if (className == '[object Array]') {
      // Recursively serialize array elements.
      for (var index = 0, length = value.length; index < length; index++) {
        var arrayElement = this.serialize(index, value, whitespace, indentation, stack);
        results.push(arrayElement === undefined ? 'null' : arrayElement);
      }

      result = results.length ?
        (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + ']' :
        ('[' + results.join(',') + ']')) : '[]';
    } else {
      // Recursively serialize object members. Members are selected from
      // either a user-specified list of property names, or the object
      // itself.

      for (var prop in value) {
        if (!value.hasOwnProperty(prop)) {
          continue;
        }

        var memberElement = this.serialize(prop, value, whitespace, indentation, stack);
        if (memberElement !== undefined) {
          // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
          // is not the empty string, let `member` {quote(property) + ":"}
          // be the concatenation of `member` and the `space` character."
          // The "`space` character" refers to the literal space
          // character, not the `space` {width} argument provided to
          // `JSON.stringify`.
          results.push(this.quote(prop) + ':' + (whitespace ? ' ' : '') + memberElement);
        }
      }

      result = results.length ?
        (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + '}' : ('{' + results.join(',') + '}')) :
        '{}';
    }

    // Remove the object from the traversed object stack.
    stack.pop();
    return result;
  }
};

// Based on JSON3: http://bestiejs.github.io/json3/
FSA.JSON.stringify = function(source) {
  // Use the browser's implementation of stringify if present
  if (typeof window.JSON == 'object' && window.JSON) {
    return JSON.stringify(source);
  }

  var value = {};
  value[''] = source;

  return this.serialize('', value, null, '', []);
};

FSA.UTF8 = {};

// Based on http://stackoverflow.com/questions/246801/how-can-you-encode-a-string-to-base64-in-javascript
FSA.UTF8.encode = function(input) {
    input = input.replace(/\r\n/g, "\n");

    var output = '';
    var inputLength = input.length;

    for (var i = 0; i < inputLength; i++) {
        var c = input.charCodeAt(i);

        if (c < 128) {
            output += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
            output += String.fromCharCode((c >> 6) | 192);
            output += String.fromCharCode((c & 63) | 128);
        } else {
            output += String.fromCharCode((c >> 12) | 224);
            output += String.fromCharCode(((c >> 6) & 63) | 128);
            output += String.fromCharCode((c & 63) | 128);
        }
    }

    return output;
};

FSA.Base64 = {
  keys: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
};

// Based on http://www.webtoolkit.info/javascript-base64.html
FSA.Base64.encode = function(input) {
  var output = '';
  var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  var i = 0;

  input = FSA.UTF8.encode(input);

  while (i < input.length) {
    chr1 = input.charCodeAt(i++);
    chr2 = input.charCodeAt(i++);
    chr3 = input.charCodeAt(i++);

    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;

    if (isNaN(chr2)) {
        enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
        enc4 = 64;
    }

    output = output +
      this.keys.charAt(enc1) +
      this.keys.charAt(enc2) +
      this.keys.charAt(enc3) +
      this.keys.charAt(enc4);
  }

  return output;
};

FSA.Attributes = function(attrs) {
  // Perform a 'clone' of attrs as to not modify them
  var config = {};
  if (attrs) {
    config = FSA.JSON.parse(FSA.JSON.stringify(attrs));
  }

  this.attrs = config || {};
};

FSA.Attributes.prototype.get = function(attr) {
  if (!attr) {
    return null;
  }

  return attr in this.attrs ? this.attrs[attr] : null;
};

FSA.Attributes.prototype.set = function(attr, value) {
  if (!attr) {
    return;
  }

  this.attrs[attr] = value;
};

FSA.Attributes.prototype.increase = function(attr) {
  if (!attr) {
    return;
  }

  this.attrs[attr] = this.getInteger(attr, 0) + 1;
};

FSA.Attributes.prototype.getInteger = function(attr, dflt) {
  if (!attr) {
    return dflt;
  }

  var value = this.get(attr);
  return value === 0 || value === '' || !value || isNaN(value) ? dflt : value * 1;
};

FSA.Attributes.prototype.getString = function(attr, dflt) {
  if (!attr) {
    return dflt;
  }

  var value = this.get(attr);
  return value === 0 ? dflt : value + '';
};

FSA.Tracker = function() {
  if (window.FSATracker &&
    window.FSATracker.q &&
    window.FSATracker.q.length
  ) {
    this._initQueued(window.FSATracker.q);
  } else {
    window.FSATracker = {
      init: this.init.bind(this),
      ready: false
    };
  }
};

FSA.Tracker.prototype._initQueued = function(queue) {
  if (!queue || !queue.length) {
    return;
  }

  if (queue[0][0] != 'init') {
    throw "You have to init FS Analytics Tracker first";
  }

  var queueLength = queue.length;
  for (var i = 0; i < queueLength; i++) {
    var action = queue[i];

    if (this[action[0]] && typeof this[action[0]] == 'function') {
      this[action[0]].apply(this, action[1]);
    }
  }
};

FSA.Tracker.prototype.init = function(config) {
  // Throw an exception if we're missing the config
  if (!config) {
    throw "Missing tracker config argument";
  }

  // Convert config to object if it's just the account number
  if (typeof config == 'number' || typeof config == 'string') {
    config = {
      account: config
    };
  }

  // Generate an ID for this tracker
  this.id = (config.account + '') + this.getUniqueID();

  // Initialize the document and window references
  this.document = config.document || document;
  this.window = config.window || window;

  // Initialize endpoint
  this.endpoint = config.endpoint || 'https://analytics.formstack.com';

  // Initialize the attributes
  this.attrs = new FSA.Attributes(config);

  // Store the current timestamp to reference against cookie timestamps
  this.attrs.set('current_timestamp', Math.round((new Date()).getTime() / 1000));

  // Set the domain to store cookies on
  var domain = this.attrs.get('domain') || 'auto';
  this.setCookieDomain(domain);

  // Set the path to store cookies on
  var path = this.attrs.get('path') || '/';
  this.setCookiePath(path);

  // Organic source host and query parameters
  this.attrs.set('organic_sources', {
    '360.cn': 'q',
    'about': 'terms',
    'alice': 'qs',
    'aol': ['q', 'query'],
    'ask': 'q',
    'avg': 'q',
    'babylon': 'q',
    'baidu': 'wd',
    'biglobe': 'q',
    'bing': 'q',
    'cnn': 'query',
    'comcast': 'q',
    'conduit': 'q',
    'daum': 'q',
    'eniro': 'search_word',
    'go.mail.ru': 'q',
    'google': 'q',
    'goo.ne': 'MT',
    'images.google': 'q',
    'incredimail': 'q',
    'kvasir': 'q',
    'live': 'q',
    'lycos': ['q', 'query'],
    'mamma': 'q',
    'msn': 'q',
    'najdi': 'q',
    'naver': 'query',
    'netscape': 'query',
    'onet': 'qt',
    'ozu': 'q',
    'pchome': 'q',
    'rakuten': 'qt',
    'rambler': 'query',
    'search.centrum.cz': 'q',
    'search-results': 'q',
    'seznam': 'q',
    'startsiden': 'q',
    'terra': 'query',
    'virgilio': 'qs',
    'voila': 'rdata',
    'wp': 'szukaj',
    'yahoo': ['p', 'q'],
    'yam': 'k',
    'yandex': 'text'
  });

  // Set the page and title
  this.attrs.set('title', this.document.title);
  this.attrs.set('page', this.document.location.pathname + this.document.location.search);

  // Get the domain hash used for validating cookies
  this.getDomainHash();

  // Parse FSA cookies
  this.parseCookies();

  // Register this visit
  this.registerVisit();

  // Determine the campaign
  this.determineCampaign();

  // Save the FSA cookies
  this.saveCookies();

  // Init Browser Data
  this.initBrowser();

  // Init Event Listeners
  this.attrs.set('listeners', {
    pageview: [],
    formview: [],
    formevent: [],
    formbottleneck: []
  });

  this.ready = true;

  // Register this tracker
  window.FSATracker = this;
};

FSA.Tracker.prototype.log = function() {
  if (!this.window.console ||
    !this.window.console.log ||
    !this.attrs.getInteger('debug', 0)) {

    return;
  }

  console.log.apply(console, arguments);
};

FSA.Tracker.prototype.get = function(attr) {
  return this.attrs.get(attr);
};

FSA.Tracker.prototype.set = function(attr, value) {
  this.attrs.set(attr, value);
};

FSA.Tracker.prototype.getUniqueID = function() {
  // Return a random number between 0 and the max 32-bit signed integer value
  return Math.round(Math.random() * 2147483647);
};

FSA.Tracker.prototype.registerVisit = function() {
  if (this.attrs.getInteger('visit_code') === 0) {
    // Register a new visitor
    return this.initFirstVisit();
  } else if (this.attrs.get('invalid_fsa_visitor')) {
    // We had a FSA cookie, but it was invalid
    return this.initFirstVisit();
  } else {
    // Add a visit to an existing visitor
    this.addVisit();
    return this.attrs.getInteger('visit_count') > 1;
  }
};

FSA.Tracker.prototype.initFirstVisit = function() {
  var currentTimestamp = this.attrs.get('current_timestamp');

  // Generate a unique visitor code (and make sure we don't overflow a 32-bit signed integer)
  this.attrs.set('visit_code', this.getUniqueID() ^ this.getEnvironmentHash() & 2147483647);

  // Set the visitor timestamps
  this.attrs.set('first_timestamp', currentTimestamp);
  this.attrs.set('recent_timestamp', currentTimestamp);
  this.attrs.set('visitor_last_timestamp', currentTimestamp);

  // Set the visit count
  this.attrs.set('visit_count', 1);

  // Reset the invalid FSA Visitor cookie flag
  this.attrs.set('invalid_fsa_visitor', 0);
};

FSA.Tracker.prototype.addVisit = function() {
  // Set the recent timestamp to the last timestamp
  this.attrs.set('recent_timestamp', this.attrs.get('visitor_last_timestamp'));

  // Update the last timestamp to the current timestamp
  this.attrs.set('visitor_last_timestamp', this.attrs.get('current_timestamp'));

  // Increase the visit count
  this.attrs.increase('visit_count');
};

// MurmurHash3 alrgorithm used to hash string data. Pulled from https://github.com/garycourt/murmurhash-js
FSA.Tracker.prototype.encodeCookieData = function(key) {
  if (!key) {
    return 1;
  }

  /**
   * The seed is configurable, but shouldn't
   * change or it will invalidate previously
   * encoded cookies.
   */
  var seed = 1073741823;

  var h1b, c1b, c2b, k1;

  var remainder = key.length & 3;
  var bytes     = key.length - remainder;
  var h1        = seed;
  var c1        = 0xcc9e2d51;
  var c2        = 0x1b873593;
  var i         = 0;

  while (i < bytes) {
    k1 =
      ((key.charCodeAt(i) & 0xff)) |
      ((key.charCodeAt(++i) & 0xff) << 8) |
      ((key.charCodeAt(++i) & 0xff) << 16) |
      ((key.charCodeAt(++i) & 0xff) << 24);

    ++i;

    k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

    h1 ^= k1;
    h1  = (h1 << 13) | (h1 >>> 19);
    h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
    h1  = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
  }

  k1 = 0;

  switch (remainder) {
    case 3:
      k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
      /* falls through */
    case 2:
      k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
      /* falls through */
    case 1:
      k1 ^= (key.charCodeAt(i) & 0xff);
      k1  = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
      k1  = (k1 << 15) | (k1 >>> 17);
      k1  = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
      h1 ^= k1;
  }

  h1 ^= key.length;

  h1 ^= h1 >>> 16;
  h1  = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
  h1 ^= h1 >>> 13;
  h1  = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
};

FSA.Tracker.prototype.getDomain = function(url) {
  if (url.indexOf('www.') === 0) {
    url = url.substring(4);
  }

  return url.toLowerCase();
};

FSA.Tracker.prototype.setCookieDomain = function(domain) {
  var cookieDomain = '';
  if (domain == 'auto') {
    cookieDomain = this.getDomain(this.document.domain);
  } else if (!this.isEmpty(domain) && domain != 'none') {
    cookieDomain = domain.toLowerCase();
  }

  this.attrs.set('cookie_domain', cookieDomain);
};

FSA.Tracker.prototype.setCookiePath = function(path) {
  var cookiePath = '/';
  if (!this.isEmpty(path)) {
    cookiePath = path;
  }

  this.attrs.set('cookie_path', cookiePath);
};

FSA.Tracker.prototype.getDomainHash = function() {
  var domain = this.attrs.getString('cookie_domain', '');
  this.log('getDomainHash', 'domain', domain);
  this.attrs.set('domain_hash', this.encodeCookieData(domain));
};

// Go through each FSA cookie in the data array and return the matching cookie for this domain
FSA.Tracker.prototype.checkCookieDomainHash = function(hash, data) {
  this.log('checkCookieDomainHash', 'hash', hash);
  this.log('checkCookieDomainHash', 'data', data);

  if (!hash || !data) {
    return '-';
  }

  var dataLength = data.length;
  if (dataLength === 0) {
    return '-';
  }

  for (var i = 0; i < dataLength; i++) {
    if (hash == data[i] || data[i].indexOf(hash + '.') === 0) {
      return data[i];
    }
  }

  return '-';
};

FSA.Tracker.prototype.saveCookies = function() { // setUTMCookies
  var domain  = this.attrs.get('cookie_domain', '');
  var path    = this.attrs.getString('cookie_path', '/');
  var account = this.attrs.getString('account', '');

  this.setCookie('FSAV', this.getFSAVisitor(), path, domain, 63072000000);

  var campaign = this.getFSACampaign();
  this.log('saveCookies', 'campaign', campaign);
  if (!this.isEmpty(campaign)) {
    this.setCookie('FSAC', campaign, path, domain, 15768000000);
  } else {
    this.setCookie('FSAC', '', path, domain, -1);
  }
};

FSA.Tracker.prototype.parseCookies = function() {
  var domainHash = this.attrs.getInteger('domain_hash', 1);
  this.log('parseCookies', 'domain hash', domainHash);

  if (!this.parseFSAVisitor(this.checkCookieDomainHash(domainHash, this.getCookieData('FSAV')))) {
    this.log('parseCookies', 'invalid visitor cookie');
    this.attrs.set('invalid_fsa_visitor', 1);
    return 0;
  }

  this.parseFSACampaign(this.checkCookieDomainHash(domainHash, this.getCookieData('FSAC')));

  return 1;
};

FSA.Tracker.prototype.parseFSAVisitor = function(data) {
  this.log('parseFSAVisitor', 'data', data);
  if (!data) {
    return 0;
  }

  var visitor = data.split('.');
  if (visitor.length !== 6 && visitor.length !== 7) {
    return 0;
  }

  var visitCode        = visitor[1] * 1;
  var firstTimestamp   = visitor[2] * 1;
  var recentTimestamp  = visitor[3] * 1;
  var currentTimestamp = visitor[4] * 1;
  var visitCount       = visitor[5] * 1;
  var visitorUuid      = visitor[6];

  if (visitCode < 0 ||
    firstTimestamp <= 0 ||
    recentTimestamp <= 0 ||
    currentTimestamp <= 0 ||
    visitCount < 0) {

    return 0;
  }

  this.attrs.set('visit_code', visitCode);
  this.attrs.set('first_timestamp', firstTimestamp);
  this.attrs.set('recent_timestamp', recentTimestamp);
  this.attrs.set('visitor_last_timestamp', currentTimestamp);
  this.attrs.set('visit_count', visitCount);

  if (visitor.length === 7) {
    this.attrs.set('visitor_uuid', visitor[6]);
  }

  return 1;
};

FSA.Tracker.prototype.getFSAVisitor = function() {
  var visitCode = this.attrs.get('visit_code');

  var firstTimestamp   = this.attrs.get('first_timestamp');
  var recentTimestamp  = this.attrs.get('recent_timestamp');
  var currentTimestamp = this.attrs.get('current_timestamp');

  var visitCount = this.attrs.getInteger('visit_count', 1);

  return [
    this.attrs.get('domain_hash'),
    visitCode !== 0 ? visitCode : '-',
    firstTimestamp || '-',
    recentTimestamp || '-',
    currentTimestamp || '-',
    visitCount || '-',
    this.attrs.get('visitor_uuid')
  ].join('.');
};

FSA.Tracker.prototype.getVisitor = function() {
  return {
    visit_code: this.attrs.get('visit_code'),
    first_timestamp: this.attrs.get('first_timestamp'),
    recent_timestamp: this.attrs.get('recent_timestamp'),
    current_timestamp: this.attrs.get('current_timestamp'),
    visit_count: this.attrs.getInteger('visit_count', 1),
    uuid: this.attrs.get('visitor_uuid')
  };
};

FSA.Tracker.prototype.setCampaign = function(source, name, medium, term, content, cid, gclid, gclsrc, dclid) {
  this.attrs.set('campaign_source', source);
  this.attrs.set('campaign_name', name);
  this.attrs.set('campaign_medium', medium);
  this.attrs.set('campaign_term', term);
  this.attrs.set('campaign_content', content);

  this.attrs.set('utmcid', cid);
  this.attrs.set('gclid', gclid);
  this.attrs.set('gclsrc', gclsrc);
  this.attrs.set('dclid', dclid);
};

FSA.Tracker.prototype.getCampaign = function() {
  var attrs = [
    'campaign_source', 'campaign_name',
    'campaign_medium', 'campaign_term',
    'campaign_content', 'utmcid', 'gclid',
    'gclsrc', 'dclid'];

  var campaign = {};

  for (var i = 0; i < 9; i++) {
    var attr = attrs[i];

    var value = this.attrs.get(attr);
    if (!this.isEmpty(value)) {
      campaign[attr] = value;
    }
  }

  return campaign;
};

FSA.Tracker.prototype.parseFSACampaign = function(data) {
  this.log('parseFSACampaign', 'data', data);
  if (!data) {
    return 0;
  }

  var campaign = data.split('.');
  this.log('parseFSACampaign', 'campaign', campaign);

  if (campaign.length < 3) {
    this.setCampaign(
      0, // Source
      0, // Name
      0, // Medium
      0, // Term
      0, // Content
      0, // ID
      0, // GCLID
      0, // GLSRC
      0, // DCLID
      0  // DSID
    );

    this.attrs.set('campaign_last_timestamp', 0);
    return 0;
  }

  this.attrs.set('campaign_last_timestamp', campaign[1] * 1);
  this.parseCampaign(campaign.slice(2).join('.'));

  return 1;
};

FSA.Tracker.prototype.parseCampaign = function(campaign) {
  this.log('parseCampaign', 'start campaign', campaign);
  if (campaign && campaign.indexOf('=') === -1) {
    campaign = this.decode(campaign);
  }

  this.log('parseCampaign', 'end campaign', campaign);

  var decodeCampaignValue = function(value) {
    if (!value || value === '-') {
      return value;
    }

    return value.split('%20').join(' ');
  };

  this.setCampaign(
    decodeCampaignValue(this.getQueryValue(campaign, 'utmcsr')),    // Source
    decodeCampaignValue(this.getQueryValue(campaign, 'utmccn')),    // Name
    decodeCampaignValue(this.getQueryValue(campaign, 'utmcmd')),    // Medium
    decodeCampaignValue(this.getQueryValue(campaign, 'utmctr')),    // Term
    decodeCampaignValue(this.getQueryValue(campaign, 'utmcct')),    // Content
    decodeCampaignValue(this.getQueryValue(campaign, 'utmcid')),    // ID
    decodeCampaignValue(this.getQueryValue(campaign, 'utmgclid')),  // GCLID
    decodeCampaignValue(this.getQueryValue(campaign, 'utmgclsrc')), // GLSRC
    decodeCampaignValue(this.getQueryValue(campaign, 'utmdclid')),  // DCLID
    decodeCampaignValue(this.getQueryValue(campaign, 'utmdsid'))    // DSID
  );
};

FSA.Tracker.prototype.getFSACampaign = function() {
  var campaign = this.getFSACampaignData();
  if (this.isEmpty(campaign)) {
    return '';
  }

  return [
    this.attrs.getInteger('domain_hash', 0),
    this.attrs.getInteger('campaign_last_timestamp', 0),
    campaign
  ].join('.');
};

FSA.Tracker.prototype.getFSACampaignData = function() {
  var campaign = [];
  this.addQueryParam(campaign, 'utmcid', 'utmcid');           // ID
  this.addQueryParam(campaign, 'campaign_source', 'utmcsr');  // Source
  this.addQueryParam(campaign, 'gclid', 'utmgclid');          // GCLID
  this.addQueryParam(campaign, 'gclsrc', 'utmgclsrc');        // GCSRC
  this.addQueryParam(campaign, 'dclid', 'utmdclid');          // DCLID
  this.addQueryParam(campaign, 'dsid', 'utmdsid');            // DSID
  this.addQueryParam(campaign, 'campaign_name', 'utmccn');    // Name
  this.addQueryParam(campaign, 'campaign_medium', 'utmcmd');  // Medium
  this.addQueryParam(campaign, 'campaign_term', 'utmctr');    // Term
  this.addQueryParam(campaign, 'campaign_content', 'utmcct'); // Content
  return campaign.join('|');
};

FSA.Tracker.prototype.getCookieData = function(cookie) {
  var data = [];

  if (!cookie) {
    return data;
  }

  var cookieComponents = [];
  if (this.document.cookie) {
    cookieComponents = this.document.cookie.split(';');
  }

  var componentsLength = cookieComponents.length;

  var pattern = new RegExp("^\\s*" + cookie + "=\\s*(.*?)\\s*$");
  for (var i = 0; i < componentsLength; i++) {
    var matches = cookieComponents[i].match(pattern);
    if (matches) {
      data.push(matches[1]);
    }
  }

  this.log('getCookieData', 'data', data);

  return data;
};

FSA.Tracker.prototype.setCookie = function(key, value, path, domain, timeout) {
  if (!key) {
    return;
  }

  var cookie = encodeURIComponent(key) + '=' + encodeURIComponent(value) + '; path=' + path + '; ';

  if (timeout) {
    cookie += 'expires=' + (new Date((new Date()).getTime() + timeout)).toGMTString() + '; ';
  }

  if (domain) {
    cookie += 'domain=' + domain + ';';
  }

  this.document.cookie = cookie;
};

FSA.Tracker.prototype.isDiffCampaign = function(campaign) {
  campaign = campaign || {};

  var storedGCLID   = this.attrs.get('gclid') || '';
  var campaignGCLID = campaign.gclid || '';

  var storedDCLID   = this.attrs.get('dclid') || '';
  var campaignDCLID = campaign.dclid || '';

  // If GCLID or DCLID match, it's the same campaign
  if ((storedGCLID.length > 0 && storedGCLID == campaignGCLID) ||
    (storedDCLID.length > 0 && storedDCLID == campaignDCLID)) {

    return 0;
  }

  var check = [
    'utmcid', 'campaign_name', 'campaign_source',
    'campaign_medium', 'campaign_term', 'campaign_content'
  ];

  for (var i = 0; i < 6; i++) {
    var attr          = check[i];
    var storedValue   = this.attrs.get(attr) || '-';
    var campaignValue = campaign[attr] || '-';

    storedValue   = this.encodeAttr(storedValue);
    campaignValue = this.encodeAttr(campaignValue);

    if (campaignValue != storedValue) {
      return 1;
    }
  }

  return 0;
};

FSA.Tracker.prototype.determineCampaign = function() {
  var currentCampaign = this.getCampaign();
  var hasCampaign = !this.isEmpty(currentCampaign.utmcid) ||
    !this.isEmpty(currentCampaign.gclid) ||
    !this.isEmpty(currentCampaign.dclid) ||
    !this.isEmpty(currentCampaign.campaign_source);

  var campaign = {};
  if (hasCampaign) {
    campaign = currentCampaign;
  }

  var updateTimestamp = false;

  // Parse UTM query campaign
  if (!this.parseUtm()) {
    // Parse the referral
    this.parseReferral();

    if (!hasCampaign) {
      this.setCampaign(
        '(direct)', // Source
        '(direct)', // Name
        '(none)', // Medium
        0, // Term
        0, // Content
        0, // ID
        0, // GCLID
        0, // GLSRC
        0, // DCLID
        0  // DSID
      );

      // If the campaign has changed, update the campaign
      if (this.isDiffCampaign(campaign)) {
        updateTimestamp = 1;
      }
    } else {
      updateTimestamp = 1;
    }
  } else {
    updateTimestamp = 1;
  }

  if (updateTimestamp) {
    this.attrs.set('campaign_last_timestamp', this.attrs.get('current_timestamp'));
  }
};

FSA.Tracker.prototype.initBrowser = function() {
  if (this.browser) {
    return;
  }

  var browser = {};
  var nav     = this.window.navigator;
  var screen  = this.window.screen;

  browser.screen       = screen ? screen.width + 'x' + screen.height : '-';
  browser.color        = screen ? screen.colorDepth + '-bit' : '-';
  browser.language     = (nav && (nav.language || nav.browserLanguage) || '-').toLowerCase();
  browser.characterSet = this.document.characterSet || this.window.charset || '-';
  browser.size         = '-';

  try {
    var doc       = this.document.documentElement;
    var body      = this.document.body;
    var hasClient = body && body.clientWidth && body.clientHeight;
    var dimens    = [];

    if (doc && doc.clientWidth && doc.clientHeight && (this.document.compatMode == 'CSS1Compat' || !hasClient)) {
      dimens = [doc.clientWidth, doc.clientHeight];
    } else if (hasClient) {
      dimens = [body.clientWidth, body.cliengHeight];
    }

    var size = dimens[0] <= 0 || dimens[1] <= 0 ? '' : dimens.join('x');
    browser.size = size;
  } catch (err) {
    // Nothing
  }

  this.browser = browser;
};

FSA.Tracker.prototype.getEnvironmentHash = function() {
  this.initBrowser();

  var nav = this.window.navigator;
  if (!nav) {
    return null;
  }

  var browserString = nav.appName + nav.version + this.browser.language + nav.platform + nav.userAgent + this.browser.screen + this.browser.color;
  if (this.document.cookie) {
    browserString += this.document.cookie;
  }

  if (this.document.referrer) {
    browserString += this.document.referrer;
  }

  for (var browserLen = browserString.length, histLen = this.window.history.length; histLen > 0;) {
    browserString += histLen-- ^ browserLen++;
  }

  return this.encodeCookieData(browserString);
};

FSA.Tracker.prototype.addListener = function(type, callback) {
  this.log('addListener', type);

  var listeners = this.attrs.get('listeners')[type];
  if (listeners) {
    listeners.push(callback);
  }
};

FSA.Tracker.prototype.removeListener = function(type, callback) {
  this.log('removeListener', type);

  var listeners = this.attrs.get('listeners')[type];
  if (!listeners) {
    return;
  }

  for (var i = 0, length = listeners.length; i < length; i++) {
    if (listeners[i] == listener) {
      listeners.splice(i, 1);
      break;
    }
  }
};

FSA.Tracker.prototype.callListeners = function(type) {
  this.log('callListeners', type);
  if (!type) {
    return;
  }

  var listeners = this.attrs.get('listeners')[type];
  if (!listeners || listeners.length === 0) {
    return;
  }

  this.log('callListeners', type, listeners.length);

  for (var i = 0, length = listeners.length; i < length; i++) {
    listeners[i].call(this);
  }
};

FSA.Tracker.prototype.getQueryParams = function(data, query) {
  this.log('getQueryParams', 'data', data);
  this.log('getQueryParams', 'query', query);

  if (!data) {
    return;
  }

  var params = this.trim(query).split('&');
  if (!params) {
    return;
  }

  var paramsLength = params.length;
  for (var i = 0; i < paramsLength; i++) {
    if (!params[i]) {
      continue;
    }

    var equalPos = params[i].indexOf('=');
    if (equalPos < 0) {
      if (!(params[i] in data)) {
        data[params[i]] = [];
      }

      data[params[i]].push('1');
    } else {
      var key = params[i].substring(0, equalPos);
      if (!(key in data)) {
        data[key] = [];
      }

      data[key].push(params[i].substring(equalPos + 1));
    }
  }
};

FSA.Tracker.prototype.getLocation = function(url) {
  this.log('getLocation', 'url', url);

  var loc = {
    url: url || '',
    protocol: 'http',
    host: '',
    path: '',
    data: {},
    anchor: ''
  };

  if (!url) {
    return loc;
  }

  var protocolPos = url.indexOf('://');
  if (protocolPos >= 0) {
    loc.protocol = url.substring(0, protocolPos);
    url = url.substring(protocolPos + 3);
  }

  var hostPos = url.search("/|\\?|#");
  if (hostPos >= 0) {
    loc.host = url.substring(0, hostPos).toLowerCase();
    url = url.substring(hostPos);
  } else {
    loc.host = url.toLowerCase();
    return loc;
  }

  var hashPos = url.indexOf('#');
  if (hashPos >= 0) {
    loc.anchor = url.substring(hashPos + 1);
    url = url.substring(0, hashPos);
  }

  var queryPos = url.indexOf('?');
  if (queryPos >= 0) {
    this.getQueryParams(loc.data, url.substring(queryPos + 1));
    url = url.substring(0, queryPos);
  }

  if (loc.anchor) {
    this.getQueryParams(loc.data, loc.anchor);
  }

  if (url && url.charAt(0) == '/') {
    url = url.substring(1);
  }

  loc.path = url;

  return loc;
};

FSA.Tracker.prototype.getReferrer = function(url, path) {
  if (this.isEmpty(url)) {
    return '-';
  }

  var domain = this.document.domain;
  path = path && path != '/' ? path : '';

  var pos = 0;
  if (url.indexOf('http://') === 0) {
    pos = 7;
  } else if (url.indexOf('https://') === 0) {
    pos = 8;
  }

  return url.indexOf(domain + path) == pos ? '0' : url;
};

FSA.Tracker.prototype.parseOrganic = function(loc) {
  if (!loc) {
    return null;
  }

  this.log('parseOrganic', 'loc', loc);

  var organicSources = this.attrs.get('organic_sources');
  if (!organicSources) {
    return null;
  }

  this.log('parseOrganic', 'organic sources', organicSources);

  for (var host in organicSources) {
    if (!organicSources.hasOwnProperty(host)) {
      continue;
    }

    var queryParams = organicSources[host];
    if (typeof queryParams === 'string') {
      queryParams = [queryParams];
    }

    var queryParamsLength = queryParams.length;

    if (loc.host.indexOf(host) === -1) {
      continue;
    }

    this.log('parseOrganic', 'checking query params', host, queryParams);
    for (var i = 0; i < queryParamsLength; i++) {
      var queryParam = queryParams[i];
      if (!(queryParam in loc.data)) {
        continue;
      }

      var query = loc.data[queryParam];
      if (!query) {
        continue;
      }

      if (query.length === 0) {
        continue;
      }

      query = query[0];
      if (!query && loc.host.indexOf('google.') > -1) {
        query = '(not provided)';
      }

      return [host, query];
    }
  }

  return null;
};

FSA.Tracker.prototype.parseUtm = function() {
  var utm = {
    utmcid: '-',
    dclid: '-',
    dsid: '',
    gclsrc: '-',
    gclid: '-',
    campaign_source: '-',
    campaign_medium: '(not set)',
    campaign_term: '',
    campaign_content: '',
    campaign_name: '(not set)'
  };

  this.log('parseUtm', 'start utm', utm);

  var queryKeys = {
    utmcid: 'utm_id',
    dclid: 'dclid',
    dsid: 'dsid',
    gclsrc: 'gclsrc',
    gclid: 'gclid',
    campaign_source: 'utm_source',
    campaign_medium: 'utm_medium',
    campaign_term: 'utm_term',
    campaign_content: 'utm_content',
    campaign_name: 'utm_campaign'
  };

  var queryParams = this.getLocation(this.document.location.href).data;

  this.log('parseUtm', 'queryParams', queryParams);

  for (var queryKey in queryKeys) {
    if (!queryKeys.hasOwnProperty(queryKey)) {
      continue;
    }

    var queryAttr = queryKeys[queryKey];

    if (queryAttr in queryParams) {
      var value = this.getLastItem(queryParams[queryAttr]);
      if (value && value !== '-') {
        utm[queryKey] = this.decode(value);
      }
    }
  }

  this.log('parseUtm', 'end utm', utm);

  if (this.isEmpty(utm.utmcid) &&
    this.isEmpty(utm.gclid) &&
    this.isEmpty(utm.dclid) &&
    this.isEmpty(utm.campaign_source)) {

    this.log('parseUtm', 'campaign', 'false');

    return 0;
  }

  this.log('parseUtm', 'campaign', 'true');

  var fromAdwords = this.isEmpty(utm.campaign_source) &&
    (!this.isEmpty(utm.dclid) ||
      (!this.isEmpty(utm.gclid) &&
        !this.isEmpty(utm.gclsrc)));

  this.log('parseUtm', 'fromAdwords', fromAdwords);

  var noTerm = this.isEmpty(utm.campaign_term);
  this.log('parseUtm', 'noTerm', noTerm);

  if (fromAdwords || noTerm) {
    var referrer = this.getReferrer(this.document.referrer, this.attrs.get('cookie_path'));
    var loc = this.getLocation(referrer);

    var organic = this.parseOrganic(loc);
    if (organic && !this.isEmpty(organic[1])) {
      if (fromAdwords) {
        utm.campaign_source = organic[0];
      }

      if (noTerm) {
        utm.campaign_term = organic[1];
      }
    }
  }

  this.setCampaign(
    utm.campaign_source,  // Source
    utm.campaign_name,    // Name
    utm.campaign_medium,  // Medium
    utm.campaign_term,    // Term
    utm.campaign_content, // Content
    utm.utmcid,           // ID
    utm.gclid,            // GCLID
    utm.gclsrc,           // GCLSRC
    utm.dclid,            // DCLID
    utm.dsid              // DSID
  );

  return 1;
};

FSA.Tracker.prototype.parseReferral = function() {
  this.log('parseReferral', 'doc referrer', this.document.referrer);

  var referrer = this.getReferrer(this.document.referrer, this.attrs.get('cookie_path'));
  this.log('parseReferral', 'referrer', referrer);

  var loc = this.getLocation(referrer);
  this.log('parseReferral', 'loc', loc);

  if (this.isEmpty(referrer) || referrer.indexOf('://') === -1) {
    return 0;
  }

  var organic = this.parseOrganic(loc);
  this.log('parseReferral', 'organic', organic);
  if (organic) {
    this.setCampaign(
      organic[0],  // Source
      '(organic)', // Name
      'organic',   // Medium
      organic[1],  // Term
      0,           // Content
      0,           // ID
      0,           // GCLID
      0,           // GLSRC
      0,           // DCLID
      0            // DSID
    );

    return 1;
  }

  this.setCampaign(
    this.getDomain(loc.host), // Source
    '(referral)',             // Name
    'referral',               // Medium
    0,                        // Term
    '/' + loc.path,           // Content
    0,                        // ID
    0,                        // GCLID
    0,                        // GLSRC
    0,                        // DCLID
    0                         // DSID
  );

  return 1;
};

FSA.Tracker.prototype.track = function() {
  if (!arguments || !arguments.length) {
    return;
  }

  var args = Array.prototype.slice.call(arguments);
  var event = args.shift();

  var method = 'track' + event.charAt(0).toUpperCase() + event.slice(1);

  if (!this[method] || typeof this[method] != 'function') {
    return;
  }

  this[method].apply(this, args);
};

FSA.Tracker.prototype.trackPageView = function() {
  this.attrs.set('pageview_id', this.getUniqueID());

  var pageview = {
    id: this.attrs.get('pageview_id'),
    account: this.attrs.get('account'),
    'location': this.window.location + '',
    browser: this.browser,
    visitor: this.getVisitor(),
    campaign: this.getCampaign(),
    user_id: this.attrs.get('user_id', null)
  };

  var queryParams = this.getLocation(this.document.location.href).data;

  if (queryParams &&
      queryParams['fsa-tracking-test'] &&
      queryParams['fsa-tracking-test'].length === 1
  ) {
    pageview.verify = queryParams['fsa-tracking-test'][0];
  }

  if (this.document.referrer) {
    pageview.referrer = this.document.referrer;
  }

  var nav = this.window.navigator;
  if (nav) {
    pageview.app        = nav.appName;
    pageview.version    = nav.appVersion;
    pageview.platform   = nav.platform;
    pageview.user_agent = nav.userAgent;
  }

  this.log('trackPageView', 'pageview', pageview);

  var json = FSA.JSON.stringify(pageview);
  this.log('trackPageView', 'json', json);

  var encoded = FSA.Base64.encode(json);
  this.log('trackPageView', 'encoded', encoded);

  var trackingEndpoint = this.endpoint + '/tracking/pageview' +
    '?callback=window.FSATracker.trackedPageView' +
    '&data=' + encodeURIComponent(encoded);

  this.addScript(trackingEndpoint);
};

FSA.Tracker.prototype.trackedPageView = function(result) {
  this.log('trackedPageView', 'result', result);
  this.attrs.set('tracked_pageview', result && result.success);

  if (!result || !result.success) {
    return;
  }

  if (result.uuid) {
    this.attrs.set('page_view_uuid', result.uuid);
  }

  // Update exisitng visitor cookie with UUID
  if (result.visitor_uuid && !this.attrs.get('visitor_uuid')) {
    this.attrs.set('visitor_uuid', result.visitor_uuid);
    this.saveCookies();
  }

  this.callListeners('pageview');
};

FSA.Tracker.prototype.trackFormView = function(formData) {
  if (!formData) {
    return;
  }

  if (!this.attrs.get('formview_id')) {
    this.attrs.set('formview_id', this.getUniqueID());
  }

  if (!this.attrs.get('tracked_pageview')) {
    this.addListener('pageview', function() {
      this.trackFormView(formData);
    });

    return this.attrs.get('formview_id');
  }

  formData.id              = this.attrs.get('formview_id');
  formData.account         = this.attrs.get('account');
  formData.pageview        = this.attrs.get('pageview_id');
  formData.page_view_uuid  = this.attrs.get('page_view_uuid');
  formData.timestamp       = Math.round((new Date()).getTime() / 1000);

  this.log('trackFormView', 'formData', formData);

  var json = FSA.JSON.stringify(formData);
  this.log('trackFormView', 'json', json);

  var encoded = FSA.Base64.encode(json);
  this.log('trackFormView', 'encoded', encoded);

  var trackingEndpoint = this.endpoint + '/tracking/formview' +
    '?callback=window.FSATracker.trackedFormView' +
    '&data=' + encodeURIComponent(encoded);

  this.addScript(trackingEndpoint);

  return this.attrs.get('formview_id');
};

FSA.Tracker.prototype.trackedFormView = function(result) {
  this.log('trackedFormView', 'result', result);
  this.attrs.set('tracked_formview', result && result.success);

  if (!result || !result.success) {
    return;
  }

  if (result.uuid) {
    this.attrs.set('formview_uuid', result.uuid);
  }

  this.callListeners('formview');
};

FSA.Tracker.prototype.trackFormEvent = function(category, action, label, value) {
  if (!category || !action) {
    return;
  }

  if (!this.attrs.get('tracked_formview')) {
    this.addListener('formview', function() {
      this.trackFormEvent(category, action, label, value);
    });

    return;
  }

  var data = {
    id: this.getUniqueID(),
    account: this.attrs.get('account'),
    formview: this.attrs.get('formview_id'),
    category: category,
    action: action,
    timestamp: Math.round((new Date()).getTime() / 1000)
  };

  if (label) {
    data.label = label;
  }

  if (value) {
    data.value = value;
  }

  this.log('trackFormEvent', 'data', data);

  var json = FSA.JSON.stringify(data);
  this.log('trackFormEvent', 'json', json);

  var encoded = FSA.Base64.encode(json);
  this.log('trackFormEvent', 'encoded', encoded);

  var trackingEndpoint = this.endpoint + '/tracking/formevent' +
    '?callback=window.FSATracker.trackedFormEvent' +
    '&data=' + encodeURIComponent(encoded);

  this.addScript(trackingEndpoint);
};

FSA.Tracker.prototype.trackedFormEvent = function(result) {
  this.log('trackedFormEvent', 'result', result);

  if (result && result.success) {
    this.callListeners('formevent');
  }
};

FSA.Tracker.prototype.trackFormBottleneck = function(bottleneckData) {
  if (!bottleneckData) {
    return;
  }

  if (!this.attrs.get('tracked_formview')) {
    this.addListener('formview', function() {
      this.trackFormBottleneck(bottleneckData);
    });

    return;
  }

  bottleneckData.account   = this.attrs.get('account');
  bottleneckData.formview  = this.attrs.get('formview_id');
  bottleneckData.timestamp = Math.round((new Date()).getTime() / 1000);

  this.log('trackFormBottleneck', 'bottleneckData', bottleneckData);

  var json = FSA.JSON.stringify(bottleneckData);
  this.log('trackFormBottleneck', 'json', json);

  var encoded = FSA.Base64.encode(json);
  this.log('trackFormBottleneck', 'encoded', encoded);

  var trackingEndpoint = this.endpoint + '/tracking/formbottleneck' +
    '?callback=window.FSATracker.trackedFormBottleneck' +
    '&data=' + encodeURIComponent(encoded);

  this.addScript(trackingEndpoint);
};

FSA.Tracker.prototype.trackedFormBottleneck = function(result) {
  this.log('trackedFormBottleneck', 'result', result);

  if (result && result.success) {
    this.callListeners('formbottleneck');
  }
};

FSA.Tracker.prototype.isEmpty = function(value) {
  return !value || value === 0 || value == '-' || value === '';
};

FSA.Tracker.prototype.trim = function(value) {
  if (!value) {
    return '';
  }

  if (!String.prototype.trim) {
    // Taken from jQuery's implementation of trim
    return (value + '').replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  } else {
    return (value + '').trim();
  }
};

FSA.Tracker.prototype.getFirstItem = function(arr) {
  if (Object.prototype.toString.call(arr) !== '[object Array]') {
    return '';
  }

  return arr && arr.length > 0 ? arr[0] : '';
};

FSA.Tracker.prototype.getLastItem = function(arr) {
  if (Object.prototype.toString.call(arr) !== '[object Array]') {
    return '';
  }

  var len = arr ? arr.length : 0;
  return len > 0 ? arr[len - 1] : '';
};

FSA.Tracker.prototype.getQueryValue = function(query, key) {
  if (!query || !key) {
    return 0;
  }

  var components = query.match(key + "=(.*?)(?:\\|utm|$)");
  return components && components.length == 2 ? components[1] : 0;
};

FSA.Tracker.prototype.addQueryParam = function(data, attr, query) {
  if (!data || !attr || !query) {
    return;
  }

  if (Object.prototype.toString.call(data) !== '[object Array]') {
    return '';
  }

  if (this.isEmpty(this.attrs.get(attr))) {
    return;
  }

  var value = this.attrs.getString(attr, '');
  value = this.encodeAttr(value);
  data.push(query + '=' + value);
};

FSA.Tracker.prototype.encodeAttr = function(attr) {
  if (!attr) {
    return '';
  }

  return attr.split('+').join('%20').split(' ').join('%20');
};

FSA.Tracker.prototype.decode = function(value) {
  if (!value) {
    return '';
  }

  return decodeURIComponent(value.split('+').join(' '));
};

FSA.Tracker.prototype.addScript = function(src) {
  var script = document.createElement('script');
  script.src = src;
  document.getElementsByTagName('head')[0].appendChild(script);
};

// Expose FSA to the global scope
window.FSA = FSA;

new FSA.Tracker();

}());
