# README

This is part 1 of a series on authentication.

This reading is recommended before heading to part 2:
Real-world Authentication with Ember Simple Auth

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
> [https://github.com/kapranov](a technique discussed here)
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

We will create a very [https://github.com/kapranov](simple and quick backend server)

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
[https://github.com/kapranov](custom
adapter). Simply adding the namespace for our API will suffice.
