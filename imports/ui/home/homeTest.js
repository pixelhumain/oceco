import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';
import { moment } from 'meteor/momentjs:moment';

// collection
import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';
import { Actions } from '../../api/actions.js';

// submanager
// import { singleSubs } from '../../api/client/subsmanager.js';

import { nameToCollection } from '../../api/helpers.js';
import './homeTest.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;

Template.homeView.onCreated(function() {
  this.ready = new ReactiveVar(false);
  this.autorun(function () {
    this.poleName = new ReactiveVar('');
    const handle = this.subscribe('poles.actions2', Meteor.settings.public.orgaCibleId);
    const handleEvents = this.subscribe('poles.events', Meteor.settings.public.orgaCibleId);
    if (handle.ready()&& handleEvents.ready()) {
      this.ready.set(handle.ready());
    }
  }.bind(this));
// this.subscribe('scopeDetail', 'organizations', Meteor.settings.public.orgaCibleId);
// this.subscribe('directoryList', 'organizations', Meteor.settings.public.orgaCibleId);
// this.subscribe('directoryListProjects', 'organizations', Meteor.settings.public.orgaCibleId);
});

Template.projectList2.onCreated(function() {
  this.scroll = new ReactiveVar(false);
});
Template.eventsList2.onCreated(function() {
  this.scrollAction = new ReactiveVar(false);
});

Template.projectList2.helpers({
  projectEvents(projectObjectId) {
    const projectId = projectObjectId.valueOf();
    return Events.find({ organizerId: projectId }).fetch();
  },
  scroll() {
    return Template.instance().scroll.get();
  },
});
Template.eventsList2.helpers({
  scrollAction() {
    return Template.instance().scrollAction.get();
  },
});
Template.homeView.helpers({
  poleName() {
    const poleName = Template.instance().poleName.get();
    return poleName;
  },
  RaffineriePoles() {
    const id = new Mongo.ObjectID(Meteor.settings.public.orgaCibleId);
    const raffinerieCursor = Organizations.findOne({ _id: id });
    if (raffinerieCursor) {
      const raffinerieArray = raffinerieCursor.listProjectsCreator();
      const raffinerieTags = raffinerieArray ? raffinerieArray.map(tag => tag.tags && tag.tags[0]) : null;
      const uniqueRaffinerieTags = raffinerieTags ? Array.from(new Set(raffinerieTags)) : null;
      return uniqueRaffinerieTags || {};
    }
  },

  poleProjects2() {
    const poleName = Template.instance().poleName.get();
    const queryProjectId = `parent.${Meteor.settings.public.orgaCibleId}`;
    const projectId = Projects.find({ [queryProjectId]: { $exists: 1 } }).fetch();
    const projectsId = [];
    projectId.forEach((element) => {
      projectsId.push(element._id);
    });
    const poleProjectsCursor = Projects.find({ $and: [{ tags: poleName }, { _id: { $in: projectsId } }] });
    return poleProjectsCursor;
  },

  projectAction(projectObjectId) {
    const projectId = projectObjectId.valueOf();
    return Actions.find({ parentId: projectId });
  },
  projectDay(date) {
    return moment(date).format(' dddd Do MMM ');
  },

  projectDuration(start, end) {
    const startDate = moment(start);
    const endDate = moment(end);
    return Math.round(endDate.diff(startDate, 'minutes') / 60);
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});
Template.projectList2.events({
  'click .button-see-event-js'(event, instance) {
    event.preventDefault();
    if (Template.instance().scroll.get()) {
      Template.instance().scroll.set(false);
    } else Template.instance().scroll.set(true);
  },
});
Template.eventsList2.events({
  'click .button-see-actions-js'(event, instance) {
    event.preventDefault();
    if (Template.instance().scrollAction.get()) {
      Template.instance().scrollAction.set(false);
    } else Template.instance().scrollAction.set(true);
  },
});
Template.eventsList2.helpers({
  eventAction(eventId) {
    const userAddedAction = `links.contributors.${Meteor.userId()}`;
    return Actions.find({ $and: [{ parentId: eventId }, { [userAddedAction]: { $exists: false } }] });
  },
});

Template.homeView.events({
  'change #selectPole'(event, instance) {
    const query = event.currentTarget.value;
    Template.instance().poleName.set(query);
  },
});
