import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';
import './home.html'
import { arrayLinkProper } from '../../api/helpers';

// collection
import { Events } from '../../api/events.js';
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';
import { Citoyens } from '../../api/citoyens.js';
import { Actions } from '../../api/actions';
import { moment } from 'meteor/momentjs:moment';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;
window.Actions = Actions;

Template.home.onCreated(function(){
    let poleName = Router.current().params.pole
    Meteor.subscribe('notificationsUser');
    this.subscribe('projects.actions','5de9df6d064fca0d008b4568' )
    this.subscribe('poles.actions','5de9df6d064fca0d008b4568', poleName )
    // this.subscribe('scopeDetail', 'organizations', '5de9df6d064fca0d008b4568');
    // this.subscribe('directoryList', 'organizations', '5de9df6d064fca0d008b4568');
    // this.subscribe('directoryListProjects', 'organizations', '5de9df6d064fca0d008b4568');
    this.sortByDate = new ReactiveVar (false)
    this.sortByDay = new ReactiveVar (false)
})

Template.home.events({
    'click #sortByDate '(event, instance){
        Template.instance().sortByDate.set(true)
    },
     'change #sortByDay'(event, instance){
         let selectedDay = event.currentTarget.value
         Template.instance().sortByDay.set(selectedDay)
     },
})

Template.buttonSubscribeAction.events({
    'click .assign-action-js' (event, instance) {
        event.preventDefault();
        actionID = event.currentTarget.id
        Meteor.call('assignmeActionRooms', { id: this.id }, (error) => {
          if (error) {
            IonPopup.alert({ template: i18n.__(error.reason) });
          }
        });
      }
})

    
Template.actionDuration.helpers({   
    projectDuration(start,end){
        let startDate = moment(start) 
        let endDate = moment(end)
        return Math.round(endDate.diff(startDate, 'minutes')/60)
    }
})

Template.actionParticipantNeeded.helpers({
    actionParticipantsNbr(actionId){
        // const actionId = Router.current().params.id
        // const actionObjectId = new Mongo.ObjectID(actionId)
        let actionCursor = Actions.findOne({_id: actionId})
        if (actionCursor.links != undefined) {
            let numberParticipant = arrayLinkProper(actionCursor.links.contributors).length
            return numberParticipant
        }
        else{
            return 0
        }
    }
})
Template.actionDate.helpers({
    projectDay(date){
        return moment(date).format(' ddd Do MMM ')
    }
})
Template.home.helpers({
    projectAction(){
        if (Template.instance().sortByDate.get()) {
            if (Template.instance().sortByDay.get()) {
                let dayWanted = Template.instance().sortByDay.get()
                let actionCursor =  Actions.find()
                let arrayActionToDisplay = []
                actionCursor.forEach((action) => {
                   let day = moment(action.startDate).format('dddd')
                   if (day === dayWanted) {
                      arrayActionToDisplay.push(action._id)
                   }
                })
                return Actions.find({_id: {$in: arrayActionToDisplay}}, {sort: {startDate: 1}})
            }
            return Actions.find({}, {sort: {startDate: -1}})
        }
        if (Template.instance().sortByDay.get()) {
            let dayWanted = Template.instance().sortByDay.get()
            let actionCursor =  Actions.find()
            let arrayActionToDisplay = []
            actionCursor.forEach((action) => {
               let day = moment(action.startDate).format('dddd')
               if (day === dayWanted) {
                  arrayActionToDisplay.push(action._id)
               }
            })
            return Actions.find({_id: {$in: arrayActionToDisplay}})
        }
        return Actions.find()
    },
    returnId(id){
         return id.valueOf()
    },
    
    
})