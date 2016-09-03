const bodyParser = require('body-parser');

module.exports = function(app) {

  app.use(bodyParser.urlencoded({ extended: true }));

  app.get('/api/codes', function (req, res) {

    if (req.headers['authorization'] !== "holy moly these staff") {
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
      res.send({ access_token: "these staff" });
    } else {
      res.status(400).send({ error: "invalid_grant" });
    }
  });

};
