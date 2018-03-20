'use strict';

function VuePersistState(prefix, setDefenition) {
  this.setDefenition = setDefenition;
  this.prefix = prefix;
  this.isStorage = typeof(Storage) !== "undefined";
  var self = this;
  self.state = {}


  var wrapSetGet = function(state, value, definition, settingSetters) {
    var _initValue = value;
    var _state = state;
    if(definition.type == 'array') {
      var origin = {
        push: _initValue.push,
        pop: _initValue.pop,
        shift: _initValue.shift,
        unshift: _initValue.unshift,
        splice: _initValue.splice,
      }
      _initValue.push = function(){
        origin.push.apply(this, arguments);
        self.setItem(_state, _initValue);
      };
      _initValue.pop = function(){
        origin.pop.apply(this, arguments);
        self.setItem(_state, _initValue);
      };
      _initValue.shift = function(){
        origin.shift.apply(this, arguments);
        self.setItem(_state, _initValue);
      };
      _initValue.unshift = function(){
        origin.unshift.apply(this, arguments);
        self.setItem(_state, _initValue);
      };
      _initValue.splice = function(){
        origin.splice.apply(this, arguments);
        self.setItem(_state, _initValue);
      }; 
    }
    if(definition.type == 'object') {
      var _originValue = _initValue;
      _initValue = new Proxy(_initValue,{
        set: function(obj, prop, value) {
          obj[prop] = value;
          self.setItem(_state, obj);
        }
      });
    }
    settingSetters[state] = {
      configurable: true,
      enumerable: true,
      get: function reactiveGet(){
        return _initValue;
      },
      set: function reactiveSet(newVal){
        self.setItem(_state, newVal);
        _initValue = newVal;
      } 
    }
  }
  var settingSetters = {}
 
  for (var state in this.setDefenition){
    var storedValue = this.getItem(state);
    wrapSetGet(state, storedValue, this.setDefenition[state], settingSetters);
  }
  Object.defineProperties(self.state, settingSetters);

  if (this.isStorage) {
    try {
      // Test if torage Available
      localStorage.setItem(this.prefix + '-test', true);
      localStorage.removeItem(this.prefix + '-test');
      window.addEventListener('storage', function(e) {
        var key = e.key.substring(self.prefix.length + 1);
        var newValue = self.convertValue(key, e.newValue);
        self.state[key] = newValue;
      });
    } catch (e) {
      this.isStorage = false;
      setInterval(function(){
        for (var state in self.setDefenition) {
          var newValue = self.getItem(state);
          var definition = self.setDefenition[state];
          var changed = false;
          switch (definition.type){
            case 'array': 
            case 'object': {
              var origin = JSON.stringify(self.state[state]);
              var newValueHash = JSON.stringify(newValue);
              changed = newValueHash != origin;
              break;
            }
            default: {
              changed = self.state[state] != newValue;
            }
          } 
          if (changed) {
            self.state[state] = newValue;
          }
        }
      }, 500);
    }
  }

  return self.state;
}

/**
 * Set cookie.
 */
VuePersistState.prototype.setCookie = function(cname, cvalue, exdays) {
  var d = new Date();
  if (!exdays) {
    exdays = 100;
  }
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = this.prefix + '-' + cname + "=" + encodeURIComponent(cvalue) + ";" + expires;
}

/**
 * Get cookie.
 */
VuePersistState.prototype.getCookie = function(cname) {
  var name = this.prefix + '-' + cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
        c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
        return decodeURIComponent(c.substring(name.length, c.length));
    }
  }
  return undefined;
}

/**
 * Get Item.
 */
VuePersistState.prototype.getItem = function(state) {
  var definition = this.setDefenition[state];
  var value;
  if (!definition) {
    return undefined;
  }
  if (this.isStorage) {
    value = localStorage.getItem(this.prefix + '-' + state);
  } else {
    value = this.getCookie(this.prefix + '-' + state);
  }

  if (typeof(value) !== "string") {
    // No data stored yet
    if (typeof(definition.default) !== "undefined"){
      return definition.default;
    }
    return undefined;
  }
  switch (definition.type){
    case 'boolean': {
      return value == 'true';
    }
    case 'number': {
      return parseInt(value);
    }
    case 'float': {
      return parseFloat(value);
    }
    case 'array': {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error('ARRAY: failed to parse ', value);
        return []
      }
    }
    case 'object': {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error('Object: failed to parse ', value);
        return {}
      }
    }
  }
  return value;
}

VuePersistState.prototype.convertValue = function(state, value) {
  var definition = this.setDefenition[state];
  if (!definition) {
    return undefined;
  }
  if (typeof(value) !== "string") {
    // No data stored yet
    if (typeof(definition.default) !== "undefined"){
      return definition.default;
    }
    return undefined;
  }
  switch (definition.type){
    case 'boolean': {
      return value == 'true';
    }
    case 'number': {
      return parseInt(value);
    }
    case 'float': {
      return parseFloat(value);
    }
    case 'array': {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error('ARRAY: failed to parse ', value);
        return []
      }
    }
    case 'object': {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error('Object: failed to parse ', value);
        return {}
      }
    }
  }
  return value;
}


/**
 * set Item.
 */
VuePersistState.prototype.setItem = function(state, newValue) {
  var definition = this.setDefenition[state];
  switch (definition.type){
    case 'array':
    case 'object': {
      newValue = JSON.stringify(newValue);
    }
  }
  if (this.isStorage) {
    try {
      localStorage.setItem(this.prefix + '-' + state, newValue);
    } catch (e) {
      console.error('Failed to store into localStorage', e);
      return;
    }
  } else {
    this.setCookie(this.prefix + '-' + state, newValue);
  }
}

function install (Vue, prefix, setDefenition) {
  var state = new VuePersistState(prefix, setDefenition);
  Vue.util.defineReactive(this, '$state', state);
  Vue.mixin({
    beforeCreate: function beforeCreate () {
      this.$state = state;
    },
  });
}

VuePersistState.install = install;

module.exports = VuePersistState;
