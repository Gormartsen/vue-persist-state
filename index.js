import { reactive } from "vue";

function VuePersistState(prefix, setDefenition) {
  this.setDefenition = setDefenition;
  this.prefix = prefix;
  this.isStorage = typeof Storage !== "undefined";
  var self = this;
  self.state = {};
  if (this.isStorage) {
    try {
      // Test if torage Available
      localStorage.setItem(this.prefix + "-testStorage", true);
      localStorage.removeItem(this.prefix + "-testStorage");
      window.addEventListener("storage", function (e) {
        if (e.oldValue == e.newValue) {
          return;
        }
        if (e.key.indexOf(self.prefix) !== 0) {
          return;
        }
        var key = e.key.substring(self.prefix.length + 1);
        if (key == "testStorage") {
          return;
        }
        var newValue = self.convertValue(key, e.newValue);
        self.state[key] = newValue;
      });
    } catch (e) {
      this.isStorage = false;
      setInterval(function () {
        for (var state in self.setDefenition) {
          var newValue = self.getItem(state);
          var definition = self.setDefenition[state];
          var changed = false;
          switch (definition.type) {
            case "array":
            case "object": {
              var origin = JSON.stringify(self.state[state]);
              var newValueHash = JSON.stringify(newValue);
              changed = newValueHash != origin;
              if (changed) {
                //add missing origin properties
                for (var i in self.state[state]) {
                  if (!newValue[i]) {
                    newValue[i] = self.state[state][i];
                  }
                }
              }
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
  for (var state in this.setDefenition) {
    var newValue = self.getItem(state);
    var definition = self.setDefenition[state];
    switch (definition.type) {
      case "array":
      case "object": {
        for (var i in definition.default) {
          if (!newValue[i]) {
            newValue[i] = definition.default[i];
          }
        }
        break;
      }
    }
    self.state[state] = newValue;
  }
  return self;
}

/**
 * Set cookie.
 */
VuePersistState.prototype.setCookie = function (cname, cvalue, exdays) {
  var d = new Date();
  if (!exdays) {
    exdays = 100;
  }
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie =
    this.prefix +
    "-" +
    cname +
    "=" +
    encodeURIComponent(cvalue) +
    ";" +
    expires;
};

/**
 * Get cookie.
 */
VuePersistState.prototype.getCookie = function (cname) {
  var name = this.prefix + "-" + cname + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return decodeURIComponent(c.substring(name.length, c.length));
    }
  }
  return undefined;
};

/**
 * Get Item.
 */
VuePersistState.prototype.getItem = function (state) {
  var definition = this.setDefenition[state];
  var value;
  if (!definition) {
    return undefined;
  }
  if (this.isStorage) {
    value = localStorage.getItem(this.prefix + "-" + state);
  } else {
    value = this.getCookie(this.prefix + "-" + state);
  }

  if (typeof value !== "string") {
    // No data stored yet
    if (typeof definition.default !== "undefined") {
      return definition.default;
    }
    return undefined;
  }
  switch (definition.type) {
    case "boolean": {
      return value == "true";
    }
    case "number": {
      return parseInt(value);
    }
    case "float": {
      return parseFloat(value);
    }
    case "array": {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error("ARRAY: failed to parse ", value);
        return [];
      }
    }
    case "object": {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error("Object: failed to parse ", value);
        return {};
      }
    }
  }
  return value;
};

VuePersistState.prototype.convertValue = function (state, value) {
  var definition = this.setDefenition[state];
  if (!definition) {
    return undefined;
  }
  if (typeof value !== "string") {
    // No data stored yet
    if (typeof definition.default !== "undefined") {
      return definition.default;
    }
    return undefined;
  }
  switch (definition.type) {
    case "boolean": {
      return value == "true";
    }
    case "number": {
      return parseInt(value);
    }
    case "float": {
      return parseFloat(value);
    }
    case "array": {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error("ARRAY: failed to parse ", value);
        return [];
      }
    }
    case "object": {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error("Object: failed to parse ", value);
        return {};
      }
    }
  }
  return value;
};

/**
 * set Item.
 */
VuePersistState.prototype.setItem = function (state, newValue) {
  var definition = this.setDefenition[state];
  switch (definition.type) {
    case "array":
    case "object": {
      newValue = JSON.stringify(newValue);
    }
  }
  if (this.isStorage) {
    try {
      localStorage.setItem(this.prefix + "-" + state, newValue);
    } catch (e) {
      console.error("Failed to store into localStorage", e);
      return;
    }
  } else {
    this.setCookie(this.prefix + "-" + state, newValue);
  }
};

/**
 * Init watching to save value.
 */
function getWatch(stateStorage, setDefenition) {
  var watch = {};
  var setWatcher = function (watch, name, stateStorage) {
    if (setDefenition[name].persist === false) {
      return;
    }
    var watchName = "$state." + name;
    if (setDefenition[name].type == "object") {
      watch[watchName] = {
        deep: true,
        handler: function (newValue) {
          stateStorage.setItem(name, newValue);
        },
      };
      return;
    }
    watch[watchName] = function (newValue) {
      stateStorage.setItem(name, newValue);
    };
  };
  for (var name in stateStorage.state) {
    if (setDefenition[name]) {
      setWatcher(watch, name, stateStorage);
    }
  }
  return watch;
}

export default {
  install: (app, prefix, setDefenition) => {
    app._PersistState = false;

    var stateStorage = new VuePersistState(prefix, setDefenition);
    app.config.globalProperties["$state"] = reactive(stateStorage.state);
    app.mixin({
      created: function beforeCreate() {
        if (!app._PersistState) {
          app._PersistState = true;
          app.$state = this.$state;
          var watchers = getWatch(stateStorage, setDefenition);
          for (var name in watchers) {
            this.$watch(name, watchers[name]);
          }
        }
      },
    });
  },
};
