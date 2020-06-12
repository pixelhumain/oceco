/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import express from 'express';
import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import bodyParser from 'body-parser';
import { SchemasActionsRest } from '../actions.js';

function verifyToken(req, res, next) {
  const token = req.headers['x-access-token'];
  const userId = req.headers['x-user-id'];
  if (!token) {
    return res.status(403).json({ auth: false, message: 'No token provided.' });
  }

  if (token !== Meteor.settings.ocecoApiToken) {
    return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
  }
  if (!userId) {
    return res.status(403).json({ auth: false, message: 'No userId provided.' });
  }
  const userOne = Meteor.users.findOne({ _id: userId });
  if (!userOne) {
    return res.status(403).json({ auth: false, message: 'user not exist' });
  }
  next();
}

const runAsUser = function (userId, func) {
  const DDPCommon = Package['ddp-common'].DDPCommon;
  // put whatever you want in these properties
  const invocation = new DDPCommon.MethodInvocation({
    isSimulation: false,
    userId,
    setUserId: () => { },
    unblock: () => { },
    connection: {},
    randomSeed: Random.id(),
  });

  return DDP._CurrentInvocation.withValue(invocation, () => func());
};

const handleErrorAsJson = function (err, req, res) {
  if (err.sanitizedError && err.sanitizedError.errorType === 'Meteor.Error') {
    if (!err.sanitizedError.statusCode) {
      err.sanitizedError.statusCode = err.statusCode || 400;
    }

    err = err.sanitizedError;
  } else if (err.errorType === 'Meteor.Error') {
    if (!err.statusCode) err.statusCode = 400;
  } else {
    const statusCode = err.statusCode;
    err = new Error();
    err.statusCode = statusCode;
  }

  let body = {
    error: err.error || 'internal-server-error',
    reason: err.reason || 'Internal server error',
    details: err.details,
    data: err.data,
  };

  return res.status(err.statusCode || 500).json(body);
};

const app = express();
WebApp.connectHandlers.use(bodyParser.json());
WebApp.connectHandlers.use(bodyParser.urlencoded({ extended: false }));
WebApp.connectHandlers.use(Meteor.bindEnvironment(app));

app.post('/api/action/create', verifyToken, function (req, res) {
  const userId = req.headers['x-user-id'];
  // console.log(req.body);
  runAsUser(userId, function () {
    try {
      const actionPost = SchemasActionsRest.clean(req.body);
      const retourCall = Meteor.call('insertAction', actionPost);
      // console.log(retourCall);
      const valid = {
        status: true,
        msg: 'action created',
      };
      res.status(200).json(valid);
    } catch (e) {
      // console.log(e);
      handleErrorAsJson(e, req, res);
    }
  });
  //
});

