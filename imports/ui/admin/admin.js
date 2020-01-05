import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';
import './admin.html'

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
    this.subscribe('action.to.admin','5de9df6d064fca0d008b4568')
    this.subscribe('scopeDetail', 'organizations', '5de9df6d064fca0d008b4568')
})
Template.adminDashboard.events({
    'click .admin-validation-js'(event, instance) {
        event.preventDefault();
        const usrId = $(event.currentTarget).attr('usrId')
        const actionId= $(event.currentTarget).attr('actionId')
        Meteor.call('ValidateAction',{
            actId: actionId , usrId: usrId
            }, (err, res) => {
            if (err) {
              alert(err);
            } else {
              console.log("succesw")
            }
          })
    }
})

Template.adminDashboard.helpers({
    actionToaccept(){
    //     let res = []
    //    Actions.find({finishedBy : {$exists:true}}).forEach(function (document) {
    //        res.push(document.finishedBy.getOwnPropertyNames())
    //    })
       return Actions.find({finishedBy : {$exists:true}})
    },
    numberTovalidate( actions){
        return Reflect.ownKeys(actions).length
    },
    userTovalidate(actions){
        const idArray = Reflect.ownKeys(actions)
        const objIdArray= idArray.map(id=> id = new Mongo.ObjectID(id) )
        return Citoyens.find({_id : {$in: objIdArray}})
    },   
})



