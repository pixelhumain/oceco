/* eslint-disable consistent-return */
/* eslint-disable meteor/no-session */
/* global Session */
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { ReactiveVar } from 'meteor/reactive-var';

import './home.html';

// collection
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';

window.Organizations = Organizations;
window.Projects = Projects;

Template.homeView.onCreated(function () {

});

Template.homeView.helpers({
  scope() {
    return Organizations.findOne({
      _id: new Mongo.ObjectID(Session.get('orgaCibleId')),
    });
  },
  RaffineriePoles() {
    if (Session.get('settingOceco').pole === true) {
      const id = new Mongo.ObjectID(Session.get('orgaCibleId'));
      const raffinerieCursor = Organizations.findOne({ _id: id });
      if (raffinerieCursor) {
        const raffinerieArray = raffinerieCursor.listProjectsCreator();
        const raffinerieTags = raffinerieArray ? raffinerieArray.map(tag => tag.tags && tag.tags[0]).filter(tag => typeof tag !== 'undefined') : null;
        const uniqueRaffinerieTags = raffinerieTags ? Array.from(new Set(raffinerieTags)) : null;
        return uniqueRaffinerieTags || {};
      }
    } else {
      const id = new Mongo.ObjectID(Session.get('orgaCibleId'));
      const raffinerieCursor = Organizations.findOne({ _id: id });
      return raffinerieCursor.listProjectsCreator();
    }
  },
});

Template.projectsView.onCreated(function () {
  this.ready = new ReactiveVar(false);
  this.autorun(function () {
    const handle = this.subscribe('all.actions2', Session.get('orgaCibleId'));
    const handleEvents = this.subscribe('poles.events', Session.get('orgaCibleId'));
    if (handle.ready() && handleEvents.ready()) {
      this.ready.set(handle.ready());
    }
  }.bind(this));
});

Template.projectsView.helpers({
  poleProjects2() {
    const queryProjectId = `parent.${Session.get('orgaCibleId')}`;
    return Projects.find({ [queryProjectId]: { $exists: 1 } });
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});