/* eslint-disable import/prefer-default-export */
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';

import { Actions } from './actions';
import { Citoyens } from './citoyens.js';


export const LogUserActions = new Mongo.Collection('loguseractions', { idGeneration: 'MONGO' });

export const SchemasLogUserActionsRest = new SimpleSchema({
  userId: {
    type: String,
  },
  organizationId: {
    type: String,
  },
  actionId: {
    type: String,
    optional: true,
  },
  credits: {
    type: SimpleSchema.Integer,
  },
  commentaire: {
    type: String,
  },
}, {
  tracker: Tracker,
  clean: {
    filter: true,
    autoConvert: true,
    removeEmptyStrings: true,
    trimStrings: true,
    getAutoValues: true,
    removeNullsFromArrays: true,
  },
});

LogUserActions.helpers({
  action() {
    return Actions.findOne({ _id: new Mongo.ObjectID(this.actionId) });
  },
  citoyen() {
    return Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) });
  },
  formatCreatedDate() {
    return moment(this.createdAt).format('DD/MM/YYYY HH:mm');
  },
});
