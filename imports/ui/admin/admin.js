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
    const handleScope = this.subscribe('scopeDetail', 'organizations', Session.get('orgaCibleId'));
    if (handleScope.ready()) {
      this.ready.set(handleScope.ready());
    }
  }.bind(this));
  this.selectview = new ReactiveVar('aValider');
});

Template.actionToValidate.onCreated(function(){
  this.scrollValidateAction = new ReactiveVar(false);;

})

Template.actionToValidate.events({
  'click .button-validate-js'(event,instance) {
    event.preventDefault();
    if (!Template.instance().scrollValidateAction.get()) {
      Template.instance().scrollValidateAction.set(true);
    } else {
      Template.instance().scrollValidateAction.set(false);
    }
  },
})
Template.adminDashboard.events({
  // 'click .admin-validation-js'(event, instance) {
  //   event.preventDefault();
  //   const usrId = $(event.currentTarget).attr('usrId');
  //   const actionId = $(event.currentTarget).attr('actionId');
  //   Meteor.call('ValidateAction', {
  //     actId: actionId, usrId,orgId: Session.get('orgaCibleId'),

  //   }, (err, res) => {
  //     if (err) {
  //       alert(err);
  //     } else {
  //     }
  //   });
  // },
  'click .change-selectview-js'(event, instance) {
    event.preventDefault();
    Template.instance().selectview.set(event.currentTarget.id);
  },
});

Template.adminDashboard.helpers({
  scope() {
    return Organizations.findOne({
      _id: new Mongo.ObjectID(Session.get('orgaCibleId')),
    });
  },
  actionToaccept() {
    let actionArray =[];
    Actions.find({ finishedBy: { $exists: true } }).forEach(action => {
      if (action.finishedBy ) {
        $.each(action.finishedBy, function( index, value ) {
          if (value === 'toModerate') {
            actionArray.push(action._id)
          }
        });
      }
    });
    return Actions.find({_id: {$in: actionArray}})
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
    pageSession.set('scopeId', Session.get('orgaCibleId'));
    pageSession.set('scope', 'organizations');
  });

  this.autorun(function () {
    const handle = this.subscribe('directoryProjectsListEventsActions', 'organizations', Session.get('orgaCibleId'), 'todo');
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
        orgId: Session.get('orgaCibleId')
      }, (err, res) => {
        if (err) {
          alert(err);
        } else {
        }
      });
    }
    
  },
});

Template.listProjectsRaf.onCreated(function () {
  this.ready = new ReactiveVar();

  this.autorun(function () {
    pageSession.set('scopeId', Session.get('orgaCibleId'));
    pageSession.set('scope', 'organizations');
  });

  this.autorun(function () {
    const handle = this.subscribe('directoryProjectsListEvents', 'organizations', Session.get('orgaCibleId'));
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
   pageSession.set('scopeId', Session.get('orgaCibleId'));
   pageSession.set('scope', 'organizations');
  });

  this.autorun(function () {
    const handle = this.subscribe('directoryProjectsListEvents', 'organizations', Session.get('orgaCibleId'));
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
   pageSession.set('scopeId', Session.get('orgaCibleId'));
   pageSession.set('scope', 'organizations');
  });

  this.autorun(function () {
    const handle = this.subscribe('directoryProjectsListEventsActions', 'organizations', Session.get('orgaCibleId'));
    this.ready.set(handle.ready());
  }.bind(this));
});

Template.listProjectsEventsActionsRaf.helpers({
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.actionToValidate.helpers({
  numberTovalidate(action){
    let actionArray =[];
      if (action.finishedBy ) {
        $.each(action.finishedBy, function( index, value ) {
          if (value === 'toModerate') {
            let usrId = new Mongo.ObjectID(index)
            actionArray.push(usrId)
          }
        });
      }
    return Citoyens.find({ _id: { $in: actionArray } }).count()
  },
  buttonActivate(){
    return Template.instance().scrollValidateAction.get();
  },
  userTovalidate(action){
    let actionArray =[];
      if (action.finishedBy ) {
        $.each(action.finishedBy, function( index, value ) {
          if (value === 'toModerate') {
            let usrId = new Mongo.ObjectID(index)
            actionArray.push(usrId)
          }
        });
      }
    return Citoyens.find({ _id: { $in: actionArray } })
  }
})

