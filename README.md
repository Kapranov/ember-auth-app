# Ember-auth-app

This README outlines the details of collaborating on this Ember
application. A short introduction of this app could easily go here.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)

## Installation

* `git clone <repository-url>` this repository
* change into the new directory
* `npm install`
* `bower install`

## Running / Development

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Code Generators

Make use of the many generators for code, try `ember help generate` for
more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

Specify what it takes to deploy your app.

### Implementing Authentication with Ember Services

Security is an essential aspect of most real-world applications.

At some point, apps need to be partially (or entirely) protected –
typically enforcing a user to be logged in. When the user tries to
access a specific protected ``URL``, the app will prompt for credentials.

These credentials can be checked against a number of identity providers,
usually backend servers but also services like Facebook, Google, Github
and many others.

Implementing authentication in Ember may not be as straight-forward as
it seems. You may have been dabbling with messy implementations or
outdated resources that are difficult to get running.

### Security as cross-cutting concern

The aim of this article is to explore "best practices" for
authentication in Ember 2.x. We will leverage the power of Services to
address security as a cross-cutting concern.

Before flat-out jumping to a library, we will look into a hand-rolled
approach. The idea is to understand, at a very basic level, how an
authentication library for Ember works. Once we get to use the library,
it won’t overwhelm us or look like magic.

### Ember Service: right tool for the job?

Services are objects that live throughout the span of an Ember
application. Yes, they are singletons.

An ``Ember.Service`` is nothing more than an ``Ember.Object``.
The name is used as convention. If services are placed in a specific
Ember CLI folder (``app/services``) they will be automatically registered
and available for injection in any other Ember object.

These objects can:

1. keep state around for the duration of an app (state won’t survive
   page-reloads),
2. be used from anywhere in the application

As such, they are ideal for cross-cutting concerns like logging or
authentication.

### Token-based authentication

Whether your backend enables session-based authentication (stateful in
the server) or token-based authentication (stateless in the server),
from a client’s perspective that doesn’t change much. Both strategies
have to send secret information with every backend/API request.

In this article, we will create a token-based authentication system.
Once we give the server valid credentials (username & password) it will
return a token for us to use. This is basic OAuth2.
Typically, username/password authentication gives us permanent and
unrestricted access to an app. On the other hand, tokens may give access
to restricted functionality on the backend (i.e. authorization) and they
may expire or be revoked.

Without further ado, let’s roll out our own authentication.

### EmberAuthApp

Our sample app will be called ember-auth-app.

Its home page lists secrets that users can only access when
authenticated. If the user is not logged in, he will be redirected to
the ``/login`` page.

First off, we will create a screen to display the secret codes.

Then, we will whip up a server and load data (the secret codes) into our
recently-created template.

Lastly, we will protect the secrets with a token-based authentication
mechanism.

Let’s start by generating our app and all necessary resources we can
think of! Fire up a terminal and run the following commands:

```bash
  $ ember new ember-auth-app
  $ cd ember-auth-app
  $ ember generate route secret --path "/"
  $ ember g route login
  $ ember g route application
  $ ember g component secret-page
  $ ember g component login-page
  $ ember g model code description:string
  $ ember g adapter application
```

Done!

The next step is to include our ``secret-page`` component in
the ``secret.hbs`` template.

> Basically, the template will be used as a shim layer,
> [a technique discussed
> here](https://github.com/Kapranov/ember-auth-app/blob/master/should_we_use_controllers_in_ember.md)
> whereby we only use templates to include a "top-level" component.

```javascript
  {{! app/templates/secret.hbs }}

  {{secret-page model=model}}
```

And proceed to build our secret list:

```javascript
  {{! app/templates/components/secret-page.hbs }}

  <h1>Ember Auth App!!</h1>

  <ul>
  {{#each model as |code|}}
    <li><strong>{{code.description}}</strong></li>
  {{/each}}
  </ul>
```

Cool, but we have no actual data yet to show!

### Loading backend data

We will create a very [simple and quick backend server](https://github.com/kapranov)

```bash
  $ ember generate server
  $ npm install
  $ npm install body-parser --save-dev
```

Great. We now open ``index.js`` and make it look exactly like this:

```javascript
  // server/index.js

  const bodyParser = require('body-parser');

  module.exports = function(app) {

    app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/api/codes', function (req, res) {
      return res.status(200).send({
        codes: [
          { id: 1, description: 'Obama Nuclear Missile Launching Code is: lovedronesandthensa' },
          { id: 2, description: 'Putin Nuclear Missile Launching Code is: invasioncoolashuntingshirtless' }
        ]
      });
    });

  };
```

In order to load that data into our app, let’s update our
[custom adapter](https://github.com/kapranov).
Simply adding the namespace for our API will suffice.

```javascript
  // app/adapters/application.js

  export default DS.RESTAdapter.extend({
    namespace: 'api'
  });
```

All ready now to load them in our route’s ``model()`` hook!

```javascript
  // app/routes/secret.js

  export default Ember.Route.extend({
    model() {
      return this.store.findAll('code');
    }
  });
```

Finally, we can launch our app!

```bash
  $ ember server
```

``http://localhost:4200`` should display our secrets!

> Ember CLI keeps including the Content Security Policies add-on by
> default. I personally find it silly to welcome someone to Ember with a
> bunch of red stuff in their console "by default". In order to remove
> these warnings, please read [How to Modify the Content Security Policy
> on a new Ember CLI > app](https://emberigniter.com/modify-content-security-policy-on-new-ember-cli-app/).

### Protecting the State secrets from Evil

First things first, let’s protect data at the source:

```javascript
  // server/index.js

  const bodyParser = require('body-parser');

  module.exports = function(app) {

    app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/api/codes', function (req, res) {

      if (req.headers['authorization'] !== "Bearer some bs") {
        return res.status(401).send('Unauthorized');
      }

      return res.status(200).send({
        codes: [
          { id: 1, description: 'Obama Nuclear Missile Launching Code is: lovedronesandthensa' },
          { id: 2, description: 'Putin Nuclear Missile Launching Code is: invasioncoolashuntingshirtless' }
        ]
      });
    });

  };
```

The ``/api/codes`` endpoint is now shielded against intruders. Any
client wanting to access the secret codes must prove, by way of a token,
that he possesses the appropriate clearence level.

That makes sense! The question is, how does a user get hold of an access
token?

We will introduce an endpoint named ``/token`` through which clients can
obtain a token (in order to query the API):

```javascript
  // server/index.js

  const bodyParser = require('body-parser');

  module.exports = function(app) {

    app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/api/codes', function (req, res) {

      if (req.headers['authorization'] !== "Bearer some bs") {
        return res.status(401).send('Unauthorized');
      }

      return res.status(200).send({
        codes: [
          { id: 1, description: 'Obama Nuclear Missile Launching Code is: lovedronesandthensa' },
          { id: 2, description: 'Putin Nuclear Missile Launching Code is: invasioncoolashuntingshirtless' }
        ]

      });
    });

    app.post('/token', function(req, res) {

      if (req.body.username == 'login' && req.body.password == 'ok') {
        res.send({ access_token: "some bs" });
      } else {
        res.status(400).send({ error: "invalid_grant" });
      }

    });
  };
```

It would have been strange for this ludicrous sample app to have a
sensible login/password combo! That’s right, anyone can obtain an access
token (the same token) with ``login/ok``.

On to Ember-land, my friends!

The challenge now is to create the user flow. Same as with
``secret-page``, we must create the shim layer for ``login``.

```javascript
  {{! app/templates/login.hbs }}

  {{login-page}}
```

And the login page component…

```javascript
  {{! app/templates/components/login-page.hbs }}

  {{link-to "Secret codez here" 'secret'}}

  <h2>Login page</h2>
  <p>Use login / ok</p>

  <form {{action 'authenticate' on='submit'}}>
    {{input value=login placeholder='Login'}}<br>
    {{input value=password placeholder='Password' type='password'}}<br>
    <button type="submit">Login</button>
  </form>
```

This page will be used for username and password submission.

The ``authenticate`` action will have to be declared in the component
itself:

```javascript
  // app/components/login-page.js

  export default Ember.Component.extend({

    authManager: Ember.inject.service(),

    actions: {
      authenticate() {
        const { login, password } = this.getProperties('login', 'password');
        this.get('authManager').authenticate(login, password).then(() => {
          alert('Success! Click the top link!');
        }, (err) => {
          alert('Error obtaining token: ' + err.responseText);
        });
      }
    }

  });
```

Whoa! ``authManager`` ?! What’s that?

Remember we said authentication was a cross-cutting concern? We will use
an Ember Service to keep functions and state related to authentication.

Above, we injected ``authManager`` to which we delegate the
``authenticate()`` method. Let’s see what’s all this about:

```bash
  $ ember generate service auth-manager
```

We make it look like this…

```javascript
  // app/services/auth-manager.js

  export default Ember.Service.extend({

    accessToken: null,

    authenticate(login, password) {
      return Ember.$.ajax({
        method: "POST",
        url: "/token",
        data: { username: login, password: password }
      }).then((result) => {
        this.set('accessToken', result.access_token);
      });
    },

    invalidate() {
      this.set('accessToken', null);
    },

    isAuthenticated: Ember.computed.bool('accessToken')

  });
```

The ``authenticate()`` method will call the backend at ``/token``.
Upon successful authentication, it will store the token in the
``accessToken`` property to use it in every subsequent backend request.
We will see how this works in a minute.

There’s also the ``isAuthenticated`` computed property that is a
boolean-ized version of ``accessToken``. Handy for using in templates.

Lastly, ``invalidate()`` simply resets the access token. Any further
requests to the API will result in a ``01 Unauthorized`` response since
``null`` is an invalid token.

If we were to run our app at this point, we wouldn’t be able to retrieve
the secret codes. Why? Well, we are not yet sending the access token in
our API requests.

As our data requests go through Ember Data, we will upgrade our adapter
to make sure the access token is included in the XHR request headers:

```javascript
  // app/adapter/application.js

  export default DS.RESTAdapter.extend({
    namespace: 'api',

    authManager: Ember.inject.service(),

    headers: Ember.computed('authManager.accessToken', function() {
      return {
        "Authorization": `Bearer ${this.get("authManager.accessToken")}`
      };
    })

  });
```

if we logged in (in other words, received a token) we are now able to see
the secret codes! Isn’t that super cool?!

For completeness’ sake, we will add the final touch. As visiting ``/``
initially will have us logged out, we need to catch that ``401 Unauthorized``
and turn it into a redirect to ``/login``. The ``application`` route is
a reasonable place to do that:

```javascript
  // app/routes/application.js

  export default Ember.Route.extend({

    actions: {
      error: function(reason, transition) {
        this.transitionTo('/login');
        return false;
      }
    }
  });
```

Lets ``ember server`` again and check out our app!

If login succeeded (read the alert message) click on the top link to
access the secrets.

We have created something functional! Alas, it is far from a real-world
scenario.

### Shortcomings?

Our sample app is lacking proper:

* pluggable authenticators/authorizers
* error handling
* events, interception and redirection
* cross-tab communication
* session persistence across reloads
* authorization
* a lot more!

This might be stating the obvious; if you ever heard the advice
don’t roll your own authentication, follow it.

We don’t have to reinvent the wheel! In part 2, we will meet
[Ember Simple Auth](http://ember-simple-auth.com/): a nifty auth
framework.

Still, it was important to understand the underlying mechanism of an
Ember authorization solution. Curious about the code?
[It’s up on Github!](htpp://github.com/kapranov).

I hope this was helpful! Did you manage to run the app? Any roadblocks
along the way? Let me know everything in the comments below!
