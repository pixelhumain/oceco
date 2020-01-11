import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';
import './admin.html';

// collection
import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';
import { Actions } from '../../api/actions';

import '../components/directory/list.js';
import '../components/news/button-card.js';
//import '../components/news/card.js';

import { arrayLinkToModerate, arrayLinkValidated } from '../../api/helpers.js';


const pageSession = new ReactiveDict('pageAdmin');

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;
window.Actions = Actions;


Template.adminDashboard.onCreated(function() {
  this.ready = new ReactiveVar(false);
  this.autorun(function () {
    const handleScope = this.subscribe('scopeDetail', 'organizations', Meteor.settings.public.orgaCibleId);
    if (handleScope.ready()) {
      this.ready.set(handleScope.ready());
    }
  }.bind(this));
  this.selectview = new ReactiveVar('aValider');
});

Template.adminDashboard.events({
  'click .admin-validation-js'(event, instance) {
    event.preventDefault();
    const usrId = $(event.currentTarget).attr('usrId');
    const actionId = $(event.currentTarget).attr('actionId');
    Meteor.call('ValidateAction', {
      actId: actionId, usrId,
    }, (err, res) => {
      if (err) {
        alert(err);
      } else {
        console.log('succesw');
      }
    });
  },
  'click .change-selectview-js'(event, instance) {
    event.preventDefault();
    Template.instance().selectview.set(event.currentTarget.id);
  },
});

Template.adminDashboard.helpers({
  scope() {
    return Organizations.findOne({
      _id: new Mongo.ObjectID(Meteor.settings.public.orgaCibleId),
    });
  },
  actionToaccept() {
    //     let res = []
    //    Actions.find({finishedBy : {$exists:true}}).forEach(function (document) {
    //        res.push(document.finishedBy.getOwnPropertyNames())
    //    })
    return Actions.find({ finishedBy: { $exists: true } });
  },
  numberTovalidate(actions) {
    return Reflect.ownKeys(actions).length;
  },
  userTovalidate(actions) {
    const idArray = Reflect.ownKeys(actions);
    const objIdArray = idArray.map(id => new Mongo.ObjectID(id));
    return Citoyens.find({ _id: { $in: objIdArray } });
  },
  dataReady() {
    return Template.instance().ready.get();
  },
  selectview() {
    return Template.instance().selectview.get();
  },
});

Template.listProjectsAValiderRaf.onCreated(function () {
  this.ready = new ReactiveVar();

  this.autorun(function () {
    pageSession.set('scopeId', Meteor.settings.public.orgaCibleId);
    pageSession.set('scope', 'organizations');
  });

  this.autorun(function () {
    const handle = this.subscribe('directoryProjectsListEventsActions', 'organizations', Meteor.settings.public.orgaCibleId, 'finishedBy');
    this.ready.set(handle.ready());
  }.bind(this));
});

Template.listProjectsAValiderRaf.helpers({
  actionToaccept() {
    return Actions.find({ finishedBy: { $exists: true } });
  },
  numberTovalidate(actions) {
    return arrayLinkToModerate(actions).length;
  },
  userTovalidate(actions) {
    const objIdArray = arrayLinkToModerate(actions);
    console.log(objIdArray);
    return Citoyens.find({ _id: { $in: objIdArray } });
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.listProjectsAValiderRaf.events({
  'click .admin-validation-js'(event, instance) {
    event.preventDefault();
    const usrId = $(event.currentTarget).attr('usrId');
    const actionId = $(event.currentTarget).attr('actionId');
    if (usrId && actionId) {
      Meteor.call('ValidateAction', {
        actId: actionId,
        usrId,
      }, (err, res) => {
        if (err) {
          alert(err);
        } else {
          console.log('succesw');
        }
      });
    }
    
  },
});

Template.listProjectsRaf.onCreated(function () {
  this.ready = new ReactiveVar();

  this.autorun(function () {
    pageSession.set('scopeId', Meteor.settings.public.orgaCibleId);
    pageSession.set('scope', 'organizations');
  });

  this.autorun(function () {
    const handle = this.subscribe('directorylistProjectsRaf', 'organizations', Meteor.settings.public.orgaCibleId);
    this.ready.set(handle.ready());
  }.bind(this));
});

Template.listProjectsRaf.helpers({
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.listProjectsEventsRaf.onCreated(function () {
  this.ready = new ReactiveVar();

  this.autorun(function () {
   pageSession.set('scopeId', Meteor.settings.public.orgaCibleId);
   pageSession.set('scope', 'organizations');
  });

  this.autorun(function () {
    const handle = this.subscribe('directoryProjectsListEvents', 'organizations', Meteor.settings.public.orgaCibleId);
    this.ready.set(handle.ready());
  }.bind(this));
});

Template.listProjectsEventsRaf.helpers({
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.listProjectsEventsActionsRaf.onCreated(function () {
  this.ready = new ReactiveVar();

  this.autorun(function () {
   pageSession.set('scopeId', Meteor.settings.public.orgaCibleId);
   pageSession.set('scope', 'organizations');
  });

  this.autorun(function () {
    const handle = this.subscribe('directoryProjectsListEventsActions', 'organizations', Meteor.settings.public.orgaCibleId);
    this.ready.set(handle.ready());
  }.bind(this));
});

Template.listProjectsEventsActionsRaf.helpers({
  dataReady() {
    return Template.instance().ready.get();
  },
});

