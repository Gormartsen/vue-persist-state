# vue-persist-state
Vue.$state that is capable to be watched.

State is common for all tabs.
If value changes in one window/tab - it will be updated in others.

Using global mixin to watch variable changes is not good option.
To avoid performance degradation new function has been implemented:
```
PersistState.initWatch(this);
```

You need to add it to mounted or created for you App section. See below. 

# usage

```
var PersistState = require('vue-persist-state');
// Init global this.$state variable
Vue.use(PersistState.plugin, 'myapp-prefix', {
  message: {
    type: 'string',
    default: 'test',
  },
  expireAt: {
    type: 'number',
    default: 0,
  },
  isFirstTime: {
    type: 'boolean',
    default: true,
  }
});

...

new Vue({
  el: '#app',
  created: function(){
    // Add watchers to application. Reuired.
    PersistState.initWatch(this);
  },

....


this.$state.message = 'new message';

...

watch: {
  '$state.message': function(newMessage) {
    console.log(newMessage);
  }
}
```
