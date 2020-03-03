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
  this.ready = new ReactiveVar(false);
  this.autorun(function () {
    const poleName = Router.current().params.pole;
    const handle = this.subscribe('poles.actions2', Session.get('orgaCibleId'), poleName);
    const handleEvents = this.subscribe('poles.events', Session.get('orgaCibleId'), poleName)
    if (handle.ready()&&handleEvents.ready()) {
      this.ready.set(handle.ready());
    }
  }.bind(this));
// this.subscribe('scopeDetail', 'organizations', Session.get('orgaCibleId'));
// this.subscribe('directoryList', 'organizations', Session.get('orgaCibleId'));
// this.subscribe('directoryListProjects', 'organizations', Session.get('orgaCibleId'));
});

Template.projectList.onCreated(function(){
  this.scroll= new ReactiveVar(false);
});
Template.eventsList.onCreated(function(){
  this.scrollAction= new ReactiveVar(false);
});

Template.projectList.helpers({
  projectEvents(projectObjectId) {
    const projectId = projectObjectId.valueOf();
    return Events.find({ organizerId: projectId }).fetch()
  },
  scroll(){
    return Template.instance().scroll.get()
  }
});
Template.eventsList.helpers({
  scrollAction(){
    return Template.instance().scrollAction.get()
  }
});
Template.polesView.helpers({
  poleName() {
    const poleName = Router.current().params.pole;
    return poleName;
  },
 
  poleProjects2() {
    const poleName = Router.current().params.pole;
    const queryProjectId = `parent.${Session.get('orgaCibleId')}`;
    const projectId = Projects.find({[queryProjectId]:{$exists: 1}}).fetch();
    let projectsId = [];
    projectId.forEach(element => {
      projectsId.push(element._id);
    });
    const poleProjectsCursor = Projects.find({$and:[{tags : poleName}, {_id :{$in: projectsId}}]})
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
Template.projectList.events({ 
  'click .button-see-event-js': function(event, instance) { 
     event.preventDefault()
     if (Template.instance().scroll.get() ){
      Template.instance().scroll.set(false)

     }
     else  Template.instance().scroll.set(true);

  } 
});
Template.eventsList.events({ 
  'click .button-see-actions-js': function(event, instance) { 
     event.preventDefault()
     if (Template.instance().scrollAction.get() ){
      Template.instance().scrollAction.set(false)

     }
     else  Template.instance().scrollAction.set(true);

  } 
});
Template.eventsList.helpers({
  eventAction(eventId) {
    const userAddedAction = `links.contributors.${Meteor.userId()}`;
    return Actions.find({ $and: [{ parentId: eventId},{ [userAddedAction]: { $exists: false } }] })
  }
});
