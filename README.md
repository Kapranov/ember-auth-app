# Ember Authentication Application

<table>
  <tr>
    <td>
      <img src="https://cloud.githubusercontent.com/assets/119117/14939460/966c23d0-0f0d-11e6-89b1-59d673ac28ee.png" />
    </td>
  </tr>
</table>

This README outlines the details of collaborating on this Ember
application.

A short introduction of this app could easily go here.

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

## Part I - Implementing Authentication with Ember Services

Security is an essential aspect of most real-world applications.

At some point, apps need to be partially (or entirely) protected –
typically enforcing a user to be logged in. When the user tries to
access a specific protected **``URL``**, the app will prompt for credentials.

These credentials can be checked against a number of identity providers,
usually backend servers but also services like **Facebook**, **Google**,
**Github** and many others.

Implementing authentication in Ember may not be as straight-forward as
it seems. You may have been dabbling with messy implementations or
outdated resources that are difficult to get running.

### Security as cross-cutting concern

The aim of this article is to explore **"best practices"** for
authentication in **Ember 2.x**. We will leverage the power of Services to
address security as a cross-cutting concern.

Before flat-out jumping to a library, we will look into a hand-rolled
approach. The idea is to understand, at a very basic level, how an
authentication library for Ember works. Once we get to use the library,
it won’t overwhelm us or look like magic.

### Ember Service: right tool for the job?

Services are objects that live throughout the span of an Ember
application. Yes, they are singletons.

An **``Ember.Service``** is nothing more than an **``Ember.Object``**.
The name is used as convention. If services are placed in a specific
**Ember CLI** folder (**``app/services``**) they will be automatically
registered and available for injection in any other Ember object.

These objects can:

**1**. **keep state around for the duration of an app (state won’t survive page-reloads)**,

**2**. **be used from anywhere in the application**

As such, they are ideal for cross-cutting concerns like logging or
authentication.

### Token-based authentication

Whether your backend enables **session-based authentication** (stateful in
the server) or **token-based authentication** (stateless in the server),
from a client’s perspective that doesn’t change much. Both strategies
have to send secret information with every **backend/API** request.

In this article, we will create a **token-based authentication** system.
Once we give the server valid credentials (**username & password**) it will
return a token for us to use. This is basic **OAuth2**.
Typically, **username/password** authentication gives us permanent and
unrestricted access to an app. On the other hand, **tokens** may give access
to restricted functionality on the backend (i.e. authorization) and they
may expire or be revoked.

Without further ado, let’s roll out our own authentication.

### EmberAuthApp

Our sample app will be called ember-auth-app.

Its home page lists secrets that users can only access when
authenticated. If the user is not logged in, he will be redirected to
the **``/login``** page.

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

**Done!**

The next step is to include our **``secret-page``** component in
the **``secret.hbs``** template.

> Basically, the template will be used as a shim layer,
> [a technique discussed here](https://github.com/Kapranov/ember-auth-app/blob/master/should_we_use_controllers_in_ember.md)
> whereby we only use templates to include a **"top-level"** component.

```handlebars
  {{! app/templates/secret.hbs }}

  {{secret-page model=model}}
```

And proceed to build our secret list:

```handlebars
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

We will create a very [simple and quick backend server](https://github.com/Kapranov/ember-auth-app/blob/master/simple_and_quick_backend_server.md)

```bash
  $ ember generate server
  $ npm install
  $ npm install body-parser --save-dev
```

**Great**. We now open **``index.js``** and make it look exactly like this:

```js
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
[custom adapter](https://github.com/Kapranov/ember-auth-app/blob/master/custom_adapter.md).
Simply adding the namespace for our **API** will suffice.

```js
  // app/adapters/application.js

  export default DS.RESTAdapter.extend({
    namespace: 'api'
  });
```

All ready now to load them in our route’s **``model()``** hook!

```js
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

**``http://localhost:4200``** should display our secrets!

> **Ember CLI** keeps including the Content Security Policies add-on by
> default. I personally find it silly to welcome someone to Ember with a
> bunch of red stuff in their console **"by default"**. In order to remove
> these warnings, please read [How to Modify the Content Security Policy on a new Ember CLI app](https://github.com/Kapranov/ember-auth-app/blob/master/modify_content_security_policy.md).

### Protecting the State secrets from Evil

First things first, let’s protect data at the source:

```js
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

The **``/api/codes``** endpoint is now shielded against intruders. Any
client wanting to access the secret codes must prove, by way of a token,
that he possesses the appropriate clearence level.

That makes sense! The question is, how does a user get hold of an access
token?

We will introduce an endpoint named **``/token``** through which clients can
obtain a token (in order to query the **API**):

```js
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
sensible **login/password** combo! That’s right, anyone can obtain an access
token (the same token) with **``holymoly/somebs``**.

On to Ember-land, my friends!

The challenge now is to create the user flow. Same as with
**``secret-page``**, we must create the shim layer for **``login``**.

```handlebars
  {{! app/templates/login.hbs }}

  {{login-page}}
```

And the login page component…

```handlebars
  {{! app/templates/components/login-page.hbs }}

  {{link-to "Secret codez here" 'secret'}}

  <h2>Login page</h2>
  <p>Use holymoly / somebs</p>

  <form {{action 'authenticate' on='submit'}}>
    {{input value=login placeholder='Login'}}<br>
    {{input value=password placeholder='Password' type='password'}}<br>
    <button type="submit">Login</button>
  </form>
```

This page will be used for **username** and **password** submission.

The **``authenticate``** action will have to be declared in the component
itself:

```js
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

Whoa! **``authManager``** ?! What’s that?

Remember we said authentication was a cross-cutting concern? We will use
an Ember Service to keep functions and state related to authentication.

Above, we injected **``authManager``** to which we delegate the
**``authenticate()``** method. Let’s see what’s all this about:

```bash
  $ ember generate service auth-manager
```

We make it look like this…

```js
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

The **``authenticate()``** method will call the backend at
**``/token``**. Upon successful authentication, it will store
the token in the **``accessToken``** property to use it in every
subsequent backend request. We will see how this works in a minute.

There’s also the **``isAuthenticated``** computed property that is a
boolean-ized version of **``accessToken``**. Handy for using in templates.

Lastly, **``invalidate()``** simply resets the **access token**. Any further
requests to the **API** will result in a **``01 Unauthorized``** response since
**``null``** is an **invalid token**.

If we were to run our app at this point, we wouldn’t be able to retrieve
the secret codes. Why? Well, we are not yet sending the **access token** in
our **API** requests.

As our data requests go through **Ember Data**, we will upgrade our **adapter**
to make sure the **access token** is included in the **XHR request headers**:

```js
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

if we logged in (in other words, received a **token**) we are now able to see
the secret codes! Isn’t that super cool?!

For completeness’ sake, we will add the final touch. As visiting
**``/``** initially will have us logged out, we need to catch that
**``401 Unauthorized``** and turn it into a **redirect** to **``/login``**.
The **``application``** route is a reasonable place to do that:

```js
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

Lets **``ember server``** again and check out our app!

If login succeeded (read the alert message) click on the top link to
access the secrets.

We have created something functional! Alas, it is far from a real-world
scenario.

### Shortcomings?

Our sample app is lacking proper:

* pluggable **authenticators/authorizers**
* error handling
* events, interception and redirection
* cross-tab communication
* session persistence across reloads
* authorization
* a lot more!

This might be stating the obvious; if you ever heard the advice
don’t roll your own authentication, follow it.

We don’t have to reinvent the wheel! In next part, we will meet
[Ember Simple Auth](http://ember-simple-auth.com/): a nifty auth
framework.

Still, it was important to understand the underlying mechanism of an
Ember authorization solution. Curious about the code?
[It’s up on Github!](https://github.com/Kapranov/ember-auth-app).

I hope this was helpful! Did you manage to run the app? Any roadblocks
along the way? Let me know everything in the comments below!

## Part II - Real-world Authentication with Ember Simple Auth

Getting authentication up and running in Ember can be overwhelming.

Now that we understand how **Services** and **token-based authentication**
work, we are ready to get started with a simple –yet powerful– framework
called [Ember Simple Auth](http://ember-simple-auth.com/).

In this episode, we will enhance our existing "Ember-Auth-App" application.

Good news: since we essentially created a dumbed-down version of Ember
Simple Auth (using the same concepts), the upgrade will be very smooth.

### Using Ember Simple Auth

Let’s begin by installing the add-on:

```bash
  $ ember install ember-simple-auth
```

That’s it. We are ready to tackle the upgrade of our sample app!

> If you haven’t gone through part 1 but would still like to follow this
> guide, make sure you get the code:
>
> ```bash
>   $ git clone https://github.com/Kapranov/ember-auth-app.git
>   $ git checkout master
> ```
>
> Some files listed below will be modified substantially. Most of the
> time you can copy that code onto your own app, replacing previous
> content.

### Ember-Auth-App version rest-auth

To recap: Ember-Auth-App is a silly app that displays nuclear missile
activation codes only to logged in users. It requests an **OAuth2** token
from a [small embedded web server](https://github.com/Kapranov/ember-auth-app/blob/master/simple_and_quick_backend_server.md)
in order to show the codes.

The core concept in the authentication mechanism is the Ember Service.
In Ember-Auth-App we called it **``authManager``**. Ember Simple Auth (ESA)
has its own service, named **``session``**. We are going drop ours and use
ESA’s – but we’ll keep the **``authManager``** variable name.

Bust the service!

```bash
  $ rm app/services/auth-manager.js
```

Meanwhile, in the login page component…

```js
  // app/components/login-page.js

  export default Ember.Component.extend({

    authManager: Ember.inject.service('session'),

    actions: {
      authenticate() {
        const { login, password } = this.getProperties('login', 'password');
        this.get('authManager').authenticate('authenticator:oauth2', login, password).then(() => {
          alert('Success! Click the top link!');
        }, (err) => {
          alert('Error obtaining token: ' + err.responseText);
        });
      }
    }

  });
```

(Note that we are now passing in an **``Authenticator``**,
**``authenticator:oauth2``**.)

An **``Authenticator``** is defined by ESA as:

> The authenticator authenticates the session. The actual mechanism used
> to do this might e.g. be posting a set of credentials to a server and
> in exchange retrieving an access token, initiating authentication
> against an external provider like **Facebook** etc. and depends on the
> specific authenticator.

So let’s create our **OAuth2** authenticator:

```bash
  $ mkdir app/authenticators
  $ touch app/authenticators/oauth2.js
```

With the following content:

```js
  // app/authenticators/oauth2.js

  import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';

  export default OAuth2PasswordGrant.extend();
```

This strategy effectively replaces our **``Ember.$.ajax``** call to fetch
the token at **``/token``**! All the heavy work is now done by Ember Simple
Auth!

> If you needed to override the token endpoint, here’s how:
>
> ```js
>   // app/authenticators/oauth2.js
>   export default OAuth2PasswordGrant.extend({
>     serverTokenEndpoint: "/path/to/token"
>   });

At the moment, if no token is available when the **``secret``** route is
accessed, a **``401 Unauthorized``** error will be thrown (you can probably
notice it in your console). This will happen during the **``findAll``** call
to the **backend**.

By mixing in **``AuthenticatedRouteMixin``** we get that check for free:

```js
  // app/routes/secret.js

  import Ember from 'ember';
  import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

  export default Ember.Route.extend(AuthenticatedRouteMixin, {
    model() {
      return this.store.findAll('code');
    }
  });
```

The **application route** was used to catch those errors and transition to
the **``login``** route. With ESA, we simply mix in **``ApplicationRouteMixin``**
and it will be handled for us.

```js
  // app/routes/application.js

  import Ember from 'ember';
  import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

  export default Ember.Route.extend(ApplicationRouteMixin);
```

Finally, the **application adapter** had the **``authManager``** injected
and sent an **``Authorization``** header. Again, ESA takes care of this for us:

```js
  // app/adapter/application.js

  import RESTAdapter from 'ember-data/adapters/rest';
  import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

  export default DS.RESTAdapter.extend(DataAdapterMixin, {
    namespace: 'api',
    authorizer: 'authorizer:application'
  });
```

Which brings us to **``Authorizer``**s. What are they?

> Authorizers use the session data aqcuired by an authenticator when
> authenticating the session to construct authrorization data that can
> e.g. be injected into outgoing network requests etc. Depending on the
> authorization mechanism the authorizer implements, that authorization
> data might be an HTTP header, query string parameters, a cookie etc.

In order to replace our **``Authorization: Bearer "some token"``**
header, we will leverage ESA’s **``OAuth2Bearer``** authorizer. Let’s
create:

```bash
  $ mkdir app/authorizers
  $ touch app/authorizers/application.js
```

With…

```js
  // app/authorizers/application.js

  import OAuth2Bearer from 'ember-simple-auth/authorizers/oauth2-bearer';

  export default OAuth2Bearer.extend();
```

That’s it for the upgrade!

If we restart **``ember server``** and check it out… the application behaves
exactly the same! (Except it’s much more solid.) We are now delegating a
great deal of complexity to Ember Simple Auth!

> Any **OAuth2**** provider for my backend? Check these out for
>
> * **Rails**:   [https://github.com/doorkeeper-gem/doorkeeper](https://github.com/doorkeeper-gem/doorkeeper)
> * **PHP**:     [https://github.com/bshaffer/oauth2-server-php](https://github.com/bshaffer/oauth2-server-php)
> * **Express**: [https://github.com/thomseddon/node-oauth2-server](https://github.com/thomseddon/node-oauth2-server)
>

### Set the current user

Those of us familiar with [Devise](https://github.com/plataformatec/devise)
(the Rails authentication solution) will recall the **``current_user``**
variable available to Rails's controllers.

We know a user has authenticated when the **``isAuthenticated``** property
becomes **``true``**. The plan is to fetch the current user whenever that
happens.

Let’s whip up a custom **``session``** service (as well as a **``User``**
model to represent our user):

```bash
  $ ember g service session
  $ ember g model user email:string
```

We will extend ESA’s **``Session``** service and add a (computed) property
called **``currentUser``**:

```js
  // app/services/session.js

  import Ember from 'ember';
  import DS from 'ember-data';
  import ESASession from "ember-simple-auth/services/session";

  export default ESASession.extend({

    store: Ember.inject.service(),

    currentUser: Ember.computed('isAuthenticated', function() {
      if (this.get('isAuthenticated')) {
        const promise = this.get('store').queryRecord('user', {})
        return DS.PromiseObject.create({ promise: promise })
      }
    })

  });
```

Since querying the backend for a user involves a promise, we return a
**``PromiseObject``** that will update our template when the promise
resolves.

Neat! But… hold your horses! It’s not as if we had an **API** endpoint
for the current logged in user.

Typically this response depends on a cookie and a DB lookup. But let’s
quickly create a dummy response, which for now will live at
**``/api/users``**.

```js
  // server/index.js

  app.get('/api/users', function (req, res) {
    return res.status(200).send({ user: { id: 1, email: 'lugatex@yahoo.com' }});
  });

  //...

```

It’s high time to make use of the feature! We will prepend a snippet to
the secret page:

```handlebars
  {{! app/templates/components/secret-page.hbs }}

  {{#if authManager.currentUser}}
    Logged in as {{authManager.currentUser.email}}
  {{/if}}

  <h1>Ember Auth App!!</h1>

  <ul>
  {{#each model as |code|}}
    <li><strong>{{code.description}}</strong></li>
  {{/each}}
  </ul>
```

Naturally –you guessed it– we need to inject the service into our secret
page component:

```js
  // app/components/secret-page.js

  import Ember from 'ember';

  export default Ember.Component.extend({
    authManager: Ember.inject.service('session')
  });
```

Loading our app, this is what we see:

Great, it works!

### Wrapping up

We have covered a fair amount of ground regarding authentication. I hope
this has been useful enough for you to apply on your projects!

Remember the [source code is on Github](https://github.com/Kapranov/ember-auth-app):

* branch **``master``** has the empty app and full tutorial
* branch **``rest``** vs **``jsonapi``** has the app finished in **part 1**
* branch **``rest-auth``** vs **``jsonapi-auth``** has the app **finished** here!

For further information and docs, do head over to the **Ember Simple Auth**
[website](http://ember-simple-auth.com/).

A future installment may bring authorization with external **OAuth2**
providers.

Did this guide help you? Where you able to run the sample app?

