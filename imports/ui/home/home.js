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

import { searchAction } from '../../api/client/reactive.js';

window.Organizations = Organizations;
window.Projects = Projects;

Template.homeView.onCreated(function () {
  searchAction.set('search', null);
});

Template.homeView.helpers({
  scope() {
    return Organizations.findOne({
      _id: new Mongo.ObjectID(Session.get('orgaCibleId')),
    });
  },
  allTags() {
    const orgaOne = Organizations.findOne({ _id: new Mongo.ObjectID(Session.get('orgaCibleId')) });
    if (!orgaOne) {
      return null;
    }

    const arrayAll = orgaOne.actionsAll().map(action => action.tags);
    const mergeDedupe = (arr) => {
      return [...new Set([].concat(...arr))];
    };
    const arrayAllMerge = mergeDedupe(arrayAll);
    console.log('output', arrayAllMerge);
    return arrayAllMerge;
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
  search() {
    return searchAction.get('search');
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

Template.searchActions.helpers({
  search() {
    return searchAction.get('search');
  },
});

Template.searchActions.events({
  'keyup #search, change #search': _.throttle((event) => {
    if (event.currentTarget.value.length > 0) {
      // console.log(event.currentTarget.value);
      searchAction.set('search', event.currentTarget.value);
    } else {
      searchAction.set('search', null);
    }
  }, 500),
});