# vue-persist-state
Vue.$state that is capable to be watched.

State is common for all tabs.
If value changes in one window/tab - it will be updated in others.

`persist:false` variables are available on $state but is not persistent between windows/tabs or page reload.

# usage

```
import PersistState from "vue-persist-state";

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
  isPersistVariable: {
    type: 'boolean',
    default: true,
    persist: false,
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
