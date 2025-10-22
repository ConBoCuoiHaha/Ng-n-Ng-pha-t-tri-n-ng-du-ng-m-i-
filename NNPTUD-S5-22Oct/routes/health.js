var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let { Response } = require('../utils/responseHandler');

// Map Mongoose readyState to text
const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

router.get('/db', async function (req, res, next) {
  try {
    const conn = mongoose.connection;
    const name = conn && conn.db ? conn.db.databaseName : null;
    const state = conn ? states[conn.readyState] : 'unknown';
    let collections = [];
    if (conn && conn.db) {
      const cols = await conn.db.listCollections().toArray();
      collections = cols.map(c => c.name).sort();
    }
    Response(res, 200, true, { state, database: name, collections });
  } catch (error) {
    Response(res, 500, false, error.message || error);
  }
});

module.exports = router;

