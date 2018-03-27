# vue-persist-state
Vue.$state that is capable to be watched.

State is common for all tabs.
If value changes in one window/tab - it will be updated in others.

# usage

```
var PersistState = require('vue-persist-state');
// Init global this.$state variable
Vue.use(PersistState, 'myapp-prefix', {
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

....


this.$state.message = 'new message';

...

watch: {
  '$state.message': function(newMessage) {
    console.log(newMessage);
  }
}
```
