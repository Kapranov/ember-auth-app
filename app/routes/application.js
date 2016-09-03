import Ember from 'ember';

export default Ember.Route.extend({

  // model() {
  //   return this.store.findAll('code');
  // }

  actions: {
    error: function() {
      this.transitionTo('/login');
      return false;
    }
  }

});
