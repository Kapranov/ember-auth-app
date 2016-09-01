import Ember from 'ember';

export default Ember.Route.extend({
  // model (param) {
  //   return this.store.findRecord('code', param.code_id);
  // }
  model() {
    return this.store.findAll('code');
  }
});
