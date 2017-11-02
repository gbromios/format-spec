;(function(){
  'use strict';
  define(function() {
    var __og_String_prototype_format = {};

    var Substitution = function(sub, naturalPos) {
      // TODO - conversion flags? probably won't bother.

      var fStr = '';
      var nStr = sub;
      var colon = sub.indexOf(':');
      if (colon >= 0) {
        fStr = sub.slice(colon + 1);
        nStr = sub.slice(0, colon);
      }

      this.index = null;
      this.nParts = nStr.split('.');
      var k = this.nParts.shift();

      if (k.match(/^[0-9]+$/)) {
        // key is an explicit integer
        this.index = parseInt(k, 10);
      } else if (k === '') {
        // key is empty string...
        if (this.nParts.length) {
          // ...followed by . separated names: treat it as a prop of the first arg.
          this.index = 0
        } else {
          // ...with nothing after it: use natural Position
          this.index = naturalPos;
        }
      } else {
        // key was some other identfier: treat it as attribute of first arg
        this.index = 0;
        this.nParts.unshift(k)
      }

      this.fspec = {
        type: null,
        fill: ' ',
        align: null,
        sign: null,
        width: null,
        precision: null
      };

    };

    Substitution.prototype.getValue = function(args) {
      var val = args[this.index];
      if (typeof val === 'function') {
        val = val();
      }
      var parent;

      //console.log('--', val);
      this.nParts.forEach(function(n){
        parent = val;
        val = val[n];
        if (typeof val === 'function') {
          val = val.apply(parent);
        }
      });

      // TODO - actually format it.
      return val;

    };

    var FormatSpecification = function(fmt) {
      this._fmt = fmt;
      this._len = fmt.length;
      this.parts = [];
      this.substitutions = 0;


      var pos = 0;

      while (true) {
        var literal = this.getLiteral(pos);

        if (literal.value) {
          this.parts.push(literal.value);
        }

        if (literal.end_pos >= this._len) {
          break;
        } else {
          pos = literal.end_pos;
          var subst = this.getSubstitution(pos);
          this.parts.push(subst.obj);
          pos = subst.end_pos;
        }
      }

      return this;

    };

    FormatSpecification.prototype.getLiteral = function(start_pos) {
      var i = start_pos;

      var _val = function() {
        return this._fmt.slice(start_pos, i)
          .replace(/{{/g, '{')
          .replace(/}}/g, '}');
      };

      while (i < this._len) {
        switch (this._fmt[i]) {
          case '{':
            // start of a substitution or just a literal open-curly?
            if (this._fmt[i+1] === '{') {
              i += 2; // literal
            } else if (i+1 >= this._len) {
              throw this.getError('hit EOF while opening substitution', i);
            } else {
              return {
                value: _val.apply(this),
                end_pos: i + 1
              };
            }
          break;
          case '}':
            // literal close curly?
            if (this._fmt[i+1] === '}') {
              i += 2;
            } else {
              throw this.getError('can\'t close a substitution if you\'re not' +
              'inside of one; use }} for a literal close-curly-brace', i);
            }
          break;
          default:
            i++;
          break;
        }
      }
      // got to EOF without hitting a substitution
      return {
        value: _val.apply(this),
        end_pos: i
      };
    };

    FormatSpecification.prototype.getSubstitution = function(start_pos) {
      // go until htting a }
      var i = start_pos;
      while (i < this._len) {
        switch (this._fmt[i]) {
          case '{':
            throw this.getError("{ is illegal inside a substitution", i);
          break;
          case '}':
            return {
              obj: new Substitution(this._fmt.slice(start_pos, i), this.substitutions++),
              end_pos: i + 1
            };
          break;
          default:
            i++;
          break;
        }
      }
      // got to EOF without closing substitution
     throw this.getError("got to EOF without ending substitution", i);
    };

    FormatSpecification.prototype.getError = function(error, pos) {
      var message =  'Error parsing format spec : ' + error;
      message += '\nformat : ' +  this._fmt
      if (pos !== undefined && pos < this._len) {
        message += '\n        ' + ('').repeat(pos) + '^';
      }
      return new Error(message);
    };

    FormatSpecification.prototype.debug = function() {
      //console.log('FormatSpec => "'+this._fmt+'"');
      for (var i = 0; i < this.parts.length; i++) {
        var x = this.parts[i];
        //console.log(i, x);
      }
    };

    FormatSpecification.prototype.getValue = function(args) {
      return this.parts.reduce(function(result, s) {
        //console.log(s, (s instanceof Substitution));
        if (s instanceof Substitution) {
          //console.log(s.getValue(args));
        }
        return result + ((s instanceof Substitution) ? s.getValue(args) : s);
      }, '');
    };

    var format = function() {
      var spec = new FormatSpecification(this);

      //spec.debug();

      return spec.getValue(arguments);
      

    };

    var _format = function(formatString) {
      return format.apply(formatString, Array.prototype.slice.call(arguments, 1));
    }

    _format.unbindGlobal = function(name) {
      // sorry about ur builtin String prototype :(
      name = name || 'format';
      window.String.prototype[name] = __og_String_prototype_format[name];
      delete __og_String_prototype_format[name];
    };

    _format.bindGlobal = function(name) {
      name = name || 'format';
      // dont store the original function twice :I
      if (__og_String_prototype_format === undefined) {
        __og_String_prototype_format[name] = window.String.prototype[name]
      }
      window.String.prototype[name] = format;
    }

    // so we can "foo".format() 
    _format.bindGlobal();
    return _format;
  
  });
  })();
