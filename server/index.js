const bodyParser = require('body-parser');

module.exports = function(app) {

  app.use(bodyParser.urlencoded({ extended: true }));

  app.get('/api/codes', function (req, res) {
    return res.status(200).send({
      "data": [
        {
          "id": "1",
          "type": "codes",
          "attributes": {
            "description": "Obama Nuclear Missile Launching Code is: lovedronesandthensa"
          }
        },
        {
          "id": "2",
          "type": "codes",
          "attributes": {
            "description": "Putin Nuclear Missile Launching Code is: invasioncoolashuntingshirtless"
          }
        }
      ]
    });
  });

};
