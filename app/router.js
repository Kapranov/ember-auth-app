import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  // this.route('secret', {path: '/secret/:code_id'});
  // this.route('secret', { path: '/:code_id' });
  this.route('login');
  this.route('secret', { path: '/' });
});

export default Router;
