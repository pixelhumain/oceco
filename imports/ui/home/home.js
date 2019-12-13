import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';
import './home.html'

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
                console.log(arrayActionToDisplay)

                return Actions.find({_id: {$in: arrayActionToDisplay}}, {sort: {startDate: -1}})
            }
            return Actions.find({}, {sort: {startDate: -1}})
        }
        return Actions.find()
    },
})