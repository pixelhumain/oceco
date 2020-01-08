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
import '../home/home.js';
import './polesView.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;

Template.polesView.onCreated(function() {
  const poleName = Router.current().params.pole;
  Meteor.subscribe('notificationsUser');
  this.subscribe('poles.actions', Meteor.settings.public.orgaCibleId, poleName);
// this.subscribe('scopeDetail', 'organizations', Meteor.settings.public.orgaCibleId);
// this.subscribe('directoryList', 'organizations', Meteor.settings.public.orgaCibleId);
// this.subscribe('directoryListProjects', 'organizations', Meteor.settings.public.orgaCibleId);
});
Template.polesView.helpers({
  poleName() {
    const poleName = Router.current().params.pole;
    return poleName;
  },
  poleProjects() {
    const poleName = Router.current().params.pole;
    const query = {};
    query.tags = poleName;
    query[`parent.${Meteor.settings.public.orgaCibleId}.type`] = 'organizations';
    const poleProjectsCursor = Projects.find(query);
    return poleProjectsCursor;
  },
  projectNbActions(projectObjectId) {
    const projectId = projectObjectId.valueOf();
    return Actions.find({ parentId: projectId }).count();
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
});

