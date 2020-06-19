import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Lists = new Mongo.Collection('lists', { idGeneration: 'MONGO' });

export const Tags = new Mongo.Collection('tags', { idGeneration: 'MONGO' });

if (Meteor.isServer) {
// Index
  Lists.rawCollection().createIndex(
    { name: 1 },
    { name: 'contextId', partialFilterExpression: { name: { $exists: true } }, background: true }
    , (e) => {
      if (e) {
        // console.log(e);
      }
    });
  Lists.rawCollection().createIndex(
    { list: 'text' },
    { name: 'list_text', background: true }
    , (e) => {
      if (e) {
        // console.log(e);
      }
    });
}
