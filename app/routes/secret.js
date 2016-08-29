import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this.score.findAll('code');
  }
});
