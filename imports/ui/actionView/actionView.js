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
import { Actions } from '../../api/actions';
import { moment } from 'meteor/momentjs:moment';
import { arrayLinkProper } from '../../api/helpers';

import './actionView.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;
window.Actions = Actions;


Template.actionView.onCreated(function() {
  this.ready = new ReactiveVar(false);
  this.autorun(function () {
    const handle = this.subscribe('projects.actions', Meteor.settings.public.orgaCibleId);
    const handleMenbers = this.subscribe('raffinerie.members', Meteor.settings.public.orgaCibleId);
    if (handle.ready() && handleMenbers.ready()) {
      this.ready.set(handle.ready());
    }
  }.bind(this));
});

Template.actionView.helpers({
  thisAction() {
    const actionId = Router.current().params.id;
    const actionObjectId = new Mongo.ObjectID(actionId);
    return Actions.findOne({ _id: actionObjectId });
  },
  actionParticipantsNbr() {
    const actionId = Router.current().params.id;
    const actionObjectId = new Mongo.ObjectID(actionId);
    const actionCursor = Actions.findOne({ _id: actionObjectId });
    return arrayLinkProper(actionCursor.links.contributors).length;
  },
  actionParticipantsId() {
    const actionId = Router.current().params.id;
    const actionObjectId = new Mongo.ObjectID(actionId);
    const actionContributorCursor = Actions.findOne({ _id: actionObjectId }).links.contributors;
    const arrayActionParticipantsId = arrayLinkProper(actionContributorCursor);
    console.log(arrayActionParticipantsId);
    return Citoyens.find({ _id: { $in: arrayActionParticipantsId } });
  },
  projectDay(date) {
    return moment(date).format(' dddd Do MMM ');
  },
  projectHour(date) {
    return `${moment(date).format(' hh')} H${moment(date).format(' mm')}`;
  },
  projectDuration(start, end) {
    const startDate = moment(start);
    const endDate = moment(end);
    return Math.round(endDate.diff(startDate, 'minutes') / 60);
  },
  dataReady() {
    return Template.instance().ready.get();
  },
})
;
