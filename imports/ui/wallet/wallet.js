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
    Meteor.subscribe('notificationsUser');
    Meteor.subscribe('user.actions','5de9df6d064fca0d008b4568')
    
})
Template.buttonActionFinish.onCreated(function(){
  this.autorun(function() {

    // pageSession.set('scopeId', "5deb282c064fca0c008b4569");
    pageSession.set('scope', "projects");
    pageSession.set('roomId',"5dedd02f064fca0d008b4568");
  });
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


Template.wallet.helpers({
    actionsInWaiting() {
      const id = "links.contributors."+Meteor.userId()
      const finished = "finishedBy."+Meteor.userId()
      return Actions.find({$and:[{[id]:{ '$exists' : 1 }}, {[finished]:{ '$exists' : false }}] } )
    },
    actionsToValidate(){
      const id = "links.contributors."+Meteor.userId()
      const finished = "finishedBy."+Meteor.userId()
      return Actions.find({$and:[{[id]:{ '$exists' : 1 }}, {[finished]:{ '$exists' : true }}] } )
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



