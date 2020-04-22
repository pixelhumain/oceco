/* eslint-disable consistent-return */
/* eslint-disable meteor/no-session */
/* global Session */
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';

import './home.html';

// collection
import { Organizations } from '../../api/organizations.js';

window.Organizations = Organizations;

Template.homeView.onCreated(function () {

});

Template.homeView.helpers({
  RaffineriePoles() {
    const id = new Mongo.ObjectID(Session.get('orgaCibleId'));
    const raffinerieCursor = Organizations.findOne({ _id: id });
    if (raffinerieCursor) {
      const raffinerieArray = raffinerieCursor.listProjectsCreator();
      const raffinerieTags = raffinerieArray ? raffinerieArray.map(tag => tag.tags && tag.tags[0]).filter(tag => typeof tag !== 'undefined') : null;
      const uniqueRaffinerieTags = raffinerieTags ? Array.from(new Set(raffinerieTags)) : null;
      return uniqueRaffinerieTags || {};
    }
  },
});

