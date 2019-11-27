import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';

// collection
import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';

// submanager
// import { singleSubs } from '../../api/client/subsmanager.js';

import { nameToCollection } from '../../api/helpers.js';

import './dashboard.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;

Template.dashboard.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();

  this.autorun(function () {
    const handle = Meteor.subscribe('scopeDetail', Meteor.settings.public.scope.type, Meteor.settings.public.scope._id);
    const handleList = Meteor.subscribe('directoryList', Meteor.settings.public.scope.type, Meteor.settings.public.scope._id);
    const handleListProjects = Meteor.subscribe('directoryListProjects', Meteor.settings.public.scope.type, Meteor.settings.public.scope._id);
    if (handle.ready() && handleList.ready() && handleListProjects.ready()) {
      template.ready.set(handle.ready());
    }
  });
});

Template.dashboard.helpers({
  scope() {
    if (Template.instance().ready.get()) {
      const collection = nameToCollection(Meteor.settings.public.scope.type);
      return collection.findOne({ _id: new Mongo.ObjectID(Meteor.settings.public.scope._id) });
    }
    return undefined;
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});