/* eslint-disable import/prefer-default-export */
import { Mongo } from 'meteor/mongo';

export const Cities = new Mongo.Collection('cities', { idGeneration: 'MONGO' });
