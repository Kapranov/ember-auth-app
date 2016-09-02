module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'ember-auth-app',
    environment: environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // FEATURE flags are only available in canary builds
        // enableAllFeatures: true,
        // contentSecurityPolicy: {
        //   'style-src': "'self' 'unsafe-inline'",
        //   'script-src': "'self' 'unsafe-eval' 127.0.0.1:35729",
        //   'connect-src': "'self' ws://127.0.0.1:35729"
        // }
      }
    },

    APP: {
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    ENV.locationType = 'none';

    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  return ENV;
};
