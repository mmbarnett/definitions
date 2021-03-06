const Router = require('express-promise-router');
const router = new Router();

const db_url = "postgres://cvbxymodwgcdog:6ca64c4362716069e239320eec8ae06097e66f573126ae33027e5e593fe663d2@ec2-54-243-235-153.compute-1.amazonaws.com:5432/d6i5mdoncrqtm0";
const { Client } = require('pg');

module.exports = router;

router.get('/', async (req, res) => {
  const client = new Client({ connectionString: db_url, ssl: true });
  client.connect();

  var query = {text:'SELECT * FROM requested WHERE fulfilled=0', rowMode: 'array'};

  try {
    const { rows } = await client.query(query);
    res.send(rows.map(term_array => {return term_array[0]}));
  } catch (err) {
    console.log(err.stack);
  }

  client.end(); 
})

router.post('/:term', async (req, res) => {
  const client = new Client({ connectionString: db_url, ssl: true });
  client.connect();

  var term = req.params.term;

  var queryString = 'INSERT INTO requested(term, fulfilled) SELECT CAST($1 AS VARCHAR),0 WHERE NOT EXISTS (SELECT 1 FROM requested WHERE term = $1);';

  try {
    const { rows } = await client.query(queryString, [term]);
    res.send("added requested term: " + term);
  } catch (err) {
    console.error(err.stack);
    res.status(500).send('Error while inserting requested term: ' + term); //could make more specific
  }

  client.end();
})
