/* eslint-disable import/prefer-default-export */
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';

export const LogEmailOceco = new Mongo.Collection('logemailoceco', { idGeneration: 'MONGO' });

export const SchemasMessagesRest = new SimpleSchema({
  parentType: { type: String, allowedValues: ['projects', 'organizations', 'events'] },
  parentId: { type: String },
  actionId: { type: String, optional: true },
  subject: { type: String },
  text: { type: String },
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

const SchemasLogEmailOceco = new SimpleSchema({
  parentType: { type: String, allowedValues: ['projects', 'organizations', 'events'] },
  parentId: { type: String },
  actionId: { type: String, optional: true },
  subject: { type: String },
  text: { type: String },
  userId: { type: String },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      }
      this.unset();
    },
  },
}, {
  clean: {
    filter: true,
    autoConvert: true,
    removeEmptyStrings: true,
    trimStrings: true,
    getAutoValues: true,
    removeNullsFromArrays: true,
  },
});

LogEmailOceco.attachSchema(SchemasLogEmailOceco);
