import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import { Router } from 'meteor/iron:router';
import { _ } from 'meteor/underscore';

import { Citoyens } from '../../../api/citoyens.js';
import { Events } from '../../../api/events.js';

import { listEventsSubs } from '../../../api/client/subsmanager.js';
import { pageDirectory } from '../../../api/client/reactive.js';

import './attendees.html';

Template.listAttendees.onCreated(function () {
  const self = this;
  self.ready = new ReactiveVar();

  self.autorun(function() {
    const handle = listEventsSubs.subscribe('listAttendees', Router.current().params._id);
    self.ready.set(handle.ready());
  });
});

Template.listAttendees.helpers({
  events () {
    return Events.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
  },
  isFollowsAttendees (followId) {
    if (Meteor.userId() === followId) {
      return true;
    }
    const citoyen = Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }, { fields: { links: 1 } });
    return citoyen.links && citoyen.links.follows && citoyen.links.follows[followId];
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.listAttendeesView.onCreated(function() {
  pageDirectory.set('search', null);
  pageDirectory.set('view', 'all');
  pageDirectory.set('selectorga', null);
});

Template.listAttendeesView.helpers({
  search () {
    return pageDirectory.get('search');
  },
  view () {
    return pageDirectory.get('view');
  },
});

Template.listAttendeesSearch.helpers({
  search () {
    return pageDirectory.get('search');
  },
});

Template.listAttendeesSearch.events({
  'keyup #search, change #search': _.debounce((event) => {
    if (event.currentTarget.value.length > 0) {
      // console.log(event.currentTarget.value);
      pageDirectory.set('search', event.currentTarget.value);
    } else {
      pageDirectory.set('search', null);
    }
  }, 500),
});

Template.listAttendeesButtonBar.helpers({
  search () {
    return pageDirectory.get('search');
  },
  view () {
    return pageDirectory.get('view');
  },
});

Template.listAttendeesButtonBar.events({
  'click .all' (event) {
    event.preventDefault();
    pageDirectory.set('view', 'all');
  },
  'click .citoyens' (event) {
    event.preventDefault();
    pageDirectory.set('view', 'citoyens');
  },
  'click .organizations' (event) {
    event.preventDefault();
    pageDirectory.set('view', 'organizations');
  },
  'click .invite' (event) {
    event.preventDefault();
    pageDirectory.set('view', 'invite');
  },
});

Template.listAttendeesValidate.helpers({
  search () {
    return pageDirectory.get('search');
  },
});

Template.listAttendeesOrgaValidate.helpers({
  search () {
    return pageDirectory.get('search');
  },
});

Template.listAttendeesIsInviting.helpers({
  search () {
    return pageDirectory.get('search');
  },
});
