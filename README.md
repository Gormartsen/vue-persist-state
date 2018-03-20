# vue-persist-state
Vue.$state that is capable to be watched 

# usage

```
var PersistState = require('vue-persist-state');
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
