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
import crypto from 'crypto';
import SimpleSchema from 'simpl-schema';
import { Organizations } from '../organizations.js';
import { Projects } from '../projects.js';
import { nameToCollection } from '../helpers.js';
import { SchemasActionsRest } from '../actions.js';
import { Citoyens } from '../citoyens.js';

function bin2hex(bytesLength) {
  const bin = crypto.randomBytes(bytesLength);
  return new Buffer(bin).toString('hex');
}

const generateToken = function (userId, tokenName) {
  const citoyenOne = Citoyens.findOne({ _id: new Mongo.ObjectID(userId), 'loginTokens.name': tokenName, 'loginTokens.type': 'personalAccessToken' });
  if (!citoyenOne) {
    const token = bin2hex(16);
    const tokenHash = crypto.createHmac('sha256', userId).update(token).digest("bin");
    const buf = Buffer.from(tokenHash);
    const tokenHashBase64 = buf.toString('base64');
    const loginToken = {};
    loginToken.createdAt = Math.floor(new Date().getTime() / 1000);
    loginToken.hashedToken = tokenHashBase64;
    loginToken.type = 'personalAccessToken';
    loginToken.name = tokenName;
    loginToken.lastTokenPart = tokenHashBase64.substr(-6);
    const modifier = {};
    modifier.$addToSet = { loginTokens: loginToken };
    Citoyens.update({ _id: new Mongo.ObjectID(userId) }, modifier);
    return token;
  }
  return false;
}

const userNotConnected = function (userId, tokenName) {
  const citoyenOne = Citoyens.findOne({ _id: new Mongo.ObjectID(userId) });
  const userM = Meteor.users.findOne({ _id: userId });

  if (citoyenOne) {
    if (userM) {
      const token = generateToken(userId, tokenName);
      if (token) {
        const profile = {};
        profile.token = token;
        Meteor.users.update(userId, { $set: { profile } });
      }
      // Meteor.users.update(userId, { $set: { emails: [citoyenOne.email] } });
    } else {
      Meteor.users.insert({ _id: userId, emails: [citoyenOne.email] });
      const token = generateToken(userId, tokenName);
      if (token) {
        const profile = {};
        profile.token = token;
        Meteor.users.update(userId, { $set: { profile } });
      }
    }

    /* const stampedToken = Accounts._generateStampedLoginToken();
    Meteor.users.update(userId,
      { $push: { 'services.resume.loginTokens': stampedToken } },
    ); */
    return true;
  }
  return false;
};

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
  // const userOne = Meteor.users.findOne({ _id: userId });
  const userOne = userNotConnected(userId, 'comobi');
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

  const body = {
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
    if (parentType === 'organizations') {
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
  /* Todo
  verifier si user deja connecter ou pas à l'application
  */
  runAsUser(userId, function () {
    try {
      const actionPost = SchemasActionsRest.clean(req.body);

      const synchroRetour = synchroAdmin({ parentId: req.body.parentId, parentType: req.body.parentType });

      const retourCall = Meteor.call('insertAction', actionPost);
      // console.log(retourCall);
      const valid = {
        status: true,
        msg: 'action created',
        id: retourCall.data.id,
      };
      res.status(200).json(valid);
    } catch (e) {
      // console.log(e);
      handleErrorAsJson(e, req, res);
    }
  });
  //
});

app.post('/api/action/assign', verifyToken, function (req, res) {
  const userId = req.headers['x-user-id'];
  runAsUser(userId, function () {
    try {

      new SimpleSchema({
        id: { type: String },
        memberId: { type: String },
        parentId: { type: String },
        parentType: { type: String },
      }).validate(req.body);

      const synchroRetour = synchroAdmin({ parentId: req.body.parentId, parentType: req.body.parentType });

      const retourCall = Meteor.call('assignMemberActionRooms', { id: req.body.id, memberId: req.body.memberId });
      // console.log(retourCall);
      const valid = {
        status: true,
        msg: 'member assign',
      };
      res.status(200).json(valid);
    } catch (e) {
      // console.log(e);
      handleErrorAsJson(e, req, res);
    }
  });
  //
});

app.post('/api/action/finishMe', verifyToken, function (req, res) {
  const userId = req.headers['x-user-id'];
  runAsUser(userId, function () {
    try {

      new SimpleSchema({
        id: { type: String },
      }).validate(req.body);

      const retourCall = Meteor.call('finishAction', { id: req.body.id });
      // console.log(retourCall);
      const valid = {
        status: true,
        msg: 'action finish',
      };
      res.status(200).json(valid);
    } catch (e) {
      // console.log(e);
      handleErrorAsJson(e, req, res);
    }
  });
  //
});

app.post('/api/action/listElement', verifyToken, function (req, res) {
  const userId = req.headers['x-user-id'];
  runAsUser(userId, function () {
    try {

      new SimpleSchema({
        parentId: { type: String },
        parentType: { type: String },
      }).validate(req.body);

      const synchroRetour = synchroAdmin({ parentId: req.body.parentId, parentType: req.body.parentType });

      const collection = nameToCollection(req.body.parentType);
      const query = {};
      query._id = new Mongo.ObjectID(req.body.parentId);
      const scope = collection.findOne(query);
      if (scope) {
        const actions = scope.listActionsCreator('all', 'todo').fetch();
        // console.log(actions);
        const valid = {
          status: true,
          actions,
          msg: 'action element list',
        };
        res.status(200).json(valid);
      } else {
        const valid = {
          status: false,
          msg: 'no element',
        };
        res.status(200).json(valid);
      }

    } catch (e) {
      // console.log(e);
      handleErrorAsJson(e, req, res);
    }
  });
  //
});

app.get('/api/action/listMe', verifyToken, function (req, res) {
  const userId = req.headers['x-user-id'];
  runAsUser(userId, function () {
    try {
      // const synchroRetour = synchroAdmin({ parentId: req.body.parentId, parentType: req.body.parentType });

      const query = {};
      query._id = new Mongo.ObjectID(userId);
      const scope = Citoyens.findOne(query);
      if (scope) {
        const actions = [];
        const listOrga = scope.listOrganizationsCreator();
        listOrga.forEach((orgaOne) => {
          const actionOrga = orgaOne.actionsUserAll(userId, 'aFaire').fetch();
          actions.push(...actionOrga);
        });

        // console.log(actions);
        const valid = {
          status: true,
          actions,
          msg: 'action user list',
        };
        res.status(200).json(valid);
      } else {
        const valid = {
          status: false,
          msg: 'no user',
        };
        res.status(200).json(valid);
      }

    } catch (e) {
      // console.log(e);
      handleErrorAsJson(e, req, res);
    }
  });
  //
});

app.post('/api/action/listMe', verifyToken, function (req, res) {
  const userId = req.headers['x-user-id'];
  runAsUser(userId, function () {
    try {

      new SimpleSchema({
        search: { type: String }
      }).validate(req.body);

      const query = {};
      query._id = new Mongo.ObjectID(userId);
      const scope = Citoyens.findOne(query);
      if (scope) {
        const actions = [];
        const listOrga = scope.listOrganizationsCreator();
        listOrga.forEach((orgaOne) => {
          const actionOrga = orgaOne.actionsUserAll(userId, 'aFaire', req.body.search).fetch();
          actions.push(...actionOrga);
        });

        // console.log(actions);
        const valid = {
          status: true,
          actions,
          msg: 'action user list',
        };
        res.status(200).json(valid);
      } else {
        const valid = {
          status: false,
          msg: 'no user',
        };
        res.status(200).json(valid);
      }

    } catch (e) {
      // console.log(e);
      handleErrorAsJson(e, req, res);
    }
  });
  //
});

app.post('/api/generatetokenchat', verifyToken, function (req, res) {
  const userId = req.headers['x-user-id'];
  runAsUser(userId, function () {
    try {

      new SimpleSchema({
        username: { type: String },
        tokenName: { type: String },
      }).validate(req.body);

      const citoyenOne = Citoyens.findOne({ username: req.body.username });
      let valid;
      if (citoyenOne) {
        const token = generateToken(citoyenOne._id._str, req.body.tokenName);
        if (token) {
          valid = {
            _id: citoyenOne._id._str,
            username: citoyenOne.username,
            name: citoyenOne.name,
            email: citoyenOne.email,
            token,
            status: true,
            msg: `generate token chat: ${req.body.username}`,
          };
        } else {
          valid = {
            status: false,
            msg: `not token: ${req.body.username}`,
          };
        }
      } else {
        valid = {
          status: false,
          msg: `not user : ${req.body.username}`,
        };
      }
      // console.log(valid);
      res.status(200).json(valid);
    } catch (e) {
      // console.log(e);
      handleErrorAsJson(e, req, res);
    }
  });
  //
});
