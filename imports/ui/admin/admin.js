import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
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


window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;
window.Actions = Actions;


Template.adminDashboard.onCreated(function() {
  this.ready = new ReactiveVar(false);
  this.autorun(function () {
    const handle = this.subscribe('action.to.admin', Meteor.settings.public.orgaCibleId);
    const handleScope = this.subscribe('scopeDetail', 'organizations', Meteor.settings.public.orgaCibleId);
    if (handle.ready() && handleScope.ready()) {
      this.ready.set(handle.ready());
    }
  }.bind(this));
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
});

Template.adminDashboard.helpers({

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

