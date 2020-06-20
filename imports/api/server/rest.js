/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
import express from 'express';
import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { Random } from 'meteor/random';
import { DDPCommon } from 'meteor/ddp-common';
import { DDP } from 'meteor/ddp';
import { Mongo } from 'meteor/mongo';
import bodyParser from 'body-parser';
import { Organizations } from '../organizations.js';
import { Projects } from '../projects.js';
import { nameToCollection } from '../helpers.js';
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
  // const DDPCommon = Package['ddp-common'].DDPCommon;
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

const synchroAdmin = function ({ parentId, parentType }) {
  const collectionScope = nameToCollection(parentType);
  const scopeOne = collectionScope.findOne({
    _id: new Mongo.ObjectID(parentId),
  });

  if (scopeOne) {
    if (parentType === 'organizatOrganizationsions') {
      const testConnectAdminRetour = Meteor.call('testConnectAdmin', { id: scopeOne._id._str });
      return testConnectAdminRetour;
    } else if (parentType === 'projects') {
      const project = `links.projects.${scopeOne._id._str}`;
      const organizationOne = Organizations.findOne({ [project]: { $exists: 1 }, oceco: { $exists: 1 } });
      const testConnectAdminRetour = Meteor.call('testConnectAdmin', { id: organizationOne._id._str });
      return testConnectAdminRetour;
    } else if (parentType === 'events') {
      const event = `links.events.${scopeOne._id._str}`;
      const projectOne = Projects.findOne({ [event]: { $exists: 1 } });
      if (projectOne) {
        const project = `links.projects.${projectOne._id._str}`;
        const organizationOne = Organizations.findOne({ [project]: { $exists: 1 }, oceco: { $exists: 1 } });
        const testConnectAdminRetour = Meteor.call('testConnectAdmin', { id: organizationOne._id._str });
        return testConnectAdminRetour;
      }
    }
  }
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

      const synchroRetour = synchroAdmin({ parentId: req.body.parentId, parentType: req.body.parentType });

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

