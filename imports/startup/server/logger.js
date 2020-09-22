/* eslint-disable no-unused-vars */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-underscore-dangle */
/* console */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Logger } from 'meteor/ostrio:logger';
import { LoggerMongo } from 'meteor/ostrio:loggermongo';
import { Push } from 'meteor/raix:push';

// Initialize Logger:
const log = new Logger();

const AppLogs = new Mongo.Collection('AppLogsOceco');

// Initialize LoggerMongo with collection instance:
const LogMongo = new LoggerMongo(log, {
  collection: AppLogs,
});

// Enable LoggerMongo with default settings:
LogMongo.enable();

// Catch-all Server's errors example: [Server]
/* const bound = Meteor.bindEnvironment((callback) => { callback(); });
process.on('uncaughtException', function (err) {
  bound(() => {
    log.error('Server Crashed!', err);
    // eslint-disable-next-line no-console
    console.error(err.stack);
    process.exit(7);
  });
}); */

// Catch-all Meteor's errors example: [Server]
// store original Meteor error
/* const originalMeteorDebug = Meteor._debug;
Meteor._debug = (message, stack) => {
  const error = new Error(message);
  error.stack = stack;
  log.error('Meteor Error!', error);
  return originalMeteorDebug.apply(this, arguments);
}; */

// push log
// Push.Log = log.debug;

export default log;
