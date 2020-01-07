import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';
import { pageSession } from '../../api/client/reactive.js';

// collection
import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';
import { Actions } from '../../api/actions.js';
import { Rooms } from '../../api/rooms.js';


window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;
window.Actions = Actions;
window.Rooms = Rooms;

import './wallet.html'

Template.wallet.onCreated(function(){
  this.ready = new ReactiveVar(false);
  this.autorun(function () {
    this.subscribe('notificationsUser');
    this.subscribe('user.actions','5de9df6d064fca0d008b4568')
  }.bind(this));
  this.scroll1 = new ReactiveVar(false);
  this.scroll2 = new ReactiveVar(false);
  this.scroll3 = new ReactiveVar(false);
  this.scroll4 = new ReactiveVar(false);
  this.displayValidateActions = new ReactiveVar(true);
  this.displaySpendActions = new ReactiveVar(false)
})


Template.buttonActionFinish.events({
    'click .finish-action-js' (event, instance) {
      event.preventDefault();
      const actionId = this.action._id._str
      Meteor.call('finishAction',{
        id: actionId ,
        }, (err, res) => {
        if (err) {
          alert(err);
        } else {
          console.log("succesw")
        }
      })
    },
  });

  Template.wallet.events({
    'click #scroll-1-js'(event, instance) {
      event.preventDefault();
      if (!Template.instance().scroll1.get()) {
        Template.instance().scroll1.set(true);
      }
      else Template.instance().scroll1.set(false)
    },
    'click #scroll-2-js'(event, instance) {
      event.preventDefault();
      if (!Template.instance().scroll2.get()) {
        Template.instance().scroll2.set(true);
      }
      else Template.instance().scroll2.set(false)
    },
    'click #scroll-3-js'(event, instance) {
      event.preventDefault();
      if (!Template.instance().scroll3.get()) {
        Template.instance().scroll3.set(true);
        if (Template.instance().scroll4.get()) { 
          Template.instance().scroll4.set(false);
        }
      }
      else Template.instance().scroll3.set(false)
    },
    'click #scroll-4-js'(event, instance) {
      event.preventDefault();
      if (!Template.instance().scroll4.get()) {
        Template.instance().scroll4.set(true);
      }
      if (Template.instance().scroll3.get()) { 
        Template.instance().scroll3.set(false);
      }
      else Template.instance().scroll4.set(false)
    },
    'click .action-validate-js'(event, instance) {
      event.preventDefault();
      if (!Template.instance().displayValidateActions.get()) {
        if (Template.instance().displaySpendActions.get()) { 
          Template.instance().displaySpendActions.set(false);
        }
        Template.instance().displayValidateActions.set(true);
      }
    },
    'click .action-spend-js'(event, instance) {
      event.preventDefault();
      if (!Template.instance().displaySpendActions.get()) {
        if (Template.instance().displayValidateActions.get()) {  
          Template.instance().displayValidateActions.set(false);
        }
        Template.instance().displaySpendActions.set(true);
      }
    }
  })


Template.wallet.helpers({
    actionsInWaiting() {
      const id = "links.contributors."+Meteor.userId()
      const finished = "finishedBy."+Meteor.userId()
      return Actions.find({$and:[{[id]:{ '$exists' : 1 }}, {[finished]:{ '$exists' : false }}] } )
    },
    actionsToValidate(){
      const id = "links.contributors."+Meteor.userId()
      const finished = "finishedBy."+Meteor.userId()
      return Actions.find({$and:[{[id]:{ '$exists' : 1 }}, {[finished]:'toModerate'}] } )
    },
    actionsValidate(){
      const id = "links.contributors."+Meteor.userId()
      const finished = "finishedBy."+Meteor.userId()
      return Actions.find({$and:[{[id]:{ '$exists' : 1 }}, {[finished]:'validated'}, {credits: {$gt: "-1"} }] } )
    },
    userCredits(){
      const finish = 'finishedBy.'+ Meteor.userId()
      let credits = 0
      Actions.find({[finish]: 'validated' }).forEach(function (u) {credits += parseInt(u.credits,10)})
      return credits
    },
    actionsSpend(){
      const id = "links.contributors."+Meteor.userId()
      const finished = "finishedBy."+Meteor.userId()
      return Actions.find({$and:[{[id]:{ '$exists' : 1 }}, {[finished]:'validated'}, {credits: {$lt: "0"} }] } )
    },

    scroll1(){
      return Template.instance().scroll1.get()
    },
    scroll2(){
      return Template.instance().scroll2.get()
    },
    scroll3(){
      return Template.instance().scroll3.get()
    },
    scroll4(){
      return Template.instance().scroll4.get()
    },
    selectSpend(){
      return Template.instance().displaySpendActions.get()
    }
});

Template.buttonActionFinish.helpers({
  options() {
    let actionStates = [{
      'finihed': 'Fini',
      'unsubscribe': "Annuler",
    }]
    return actionStates    
  }
})

Template.WhalletInputAction.onCreated(function() {
  this.autorun(function () {
  }.bind(this));
  this.displayDesc = new ReactiveVar(false);
});

Template.WhalletInputAction.events({
  'click .display-desc-js'(event, instance) {

    event.preventDefault();
    if (!Template.instance().displayDesc.get()) {
      Template.instance().displayDesc.set(true);
    }
    else  {
      Template.instance().displayDesc.set(false)
    }     
  },
})
Template.WhalletInputAction.helpers({
  displayDesc(){
    return Template.instance().displayDesc.get()
  }
})



