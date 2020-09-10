/* eslint-disable consistent-return */
/* eslint-disable meteor/no-session */
/* global Session  cordova */
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';

import { ActivityStream } from '../api/activitystream.js';

import { singleSubs } from '../api/client/subsmanager.js';


// import './settings/settings.js';
import './notifications/notifications.js';

import './pixel.html';
import { Projects } from '../api/projects.js';
import { Organizations } from '../api/organizations.js';
import { Actions } from '../api/actions.js';
import { Citoyens } from '../api/citoyens.js';
import '../ui/components/scope/item.js';


// window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;
window.Actions = Actions;

Template.layout.onCreated(function() {
  // Meteor.subscribe('notificationsUser');
  Meteor.subscribe('notificationsCountUser');

  this.ready = new ReactiveVar(false);
  this.autorun(function () {
    if (Session.get('orgaCibleId')) {
      const handleScopeDetail = Meteor.subscribe('scopeDetail', 'organizations', Session.get('orgaCibleId'));
      const handleDirectoryListProjects = Meteor.subscribe('directoryListProjects', 'organizations', Session.get('orgaCibleId'));
      const handleCitoyen = Meteor.subscribe('citoyen');
      if (handleScopeDetail.ready() && handleDirectoryListProjects.ready() && handleCitoyen.ready()) {
        /* "oceco" : {
        "pole" : true,
        "organizationAction" : false,
        "projectAction" : false,
        "eventAction" : true,
        "commentsAction": false,
        "memberAuto" : false,
        "agenda" : true,
        "costum" : {
            "projects" : {
                "form" : {
                    "geo" : false
                }
            },
            "events" : {
                "form" : {
                    "geo" : false
                }
            }
        },
        account: {
          textVotreCreditTemps:'Votre crédit temps',
          textUnite : 'R'
        },
        home: {
          textTitre: 'Choix du pole',
          textInfo: 'Sur cette page vous devrez choisir parmis les differents poles de votre organisation afin de voir les évenements et les actions qui en font partie. Si vous voulez voir les évenement par date merci de vous rendre dans "agenda"'
        },
        wallet: {
          textBouton: 'Espace temps',
          textTitre: 'Espace temps',
          textInfo: 'Votre éspace temps vous permet de voire à la fois vos crédits temps gagné ou dépensés et vos actions futur et à venir',
          coupDeMain: {
            textBouton: 'Coup de main',
            textTitre: 'Coup de main',
            textInfo: 'C\'est la liste de toute vos actions à faire au quels vous êtes inscrit'
          },
          enAttente: {
            textBouton: 'En attente',
            textTitre: 'En attente',
            textInfo: 'C\'est la liste de toute vos actions finis qui doivent êtres validé par un administrateur'
          },
          valides: {
            textBouton: 'Validés',
            textTitre: 'Validés',
            textInfo: 'C\'est la liste de vos 100 dernières anciennes actions qui vous ont rapporté ou qui vous ont couté des crédits'
          }
        }
    } */
        const orgaOne = Organizations.findOne({
          _id: new Mongo.ObjectID(Session.get('orgaCibleId')),
        });
        if (orgaOne && orgaOne.oceco) {
          Session.setPersistent('settingOceco', orgaOne.oceco);
          this.ready.set(handleScopeDetail.ready());
        }
        if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.pixelhumain && Session.get('orgaCibleId')) {
          if (orgaOne && orgaOne.isAdmin()) {
            Session.setPersistent(`isAdmin${Session.get('orgaCibleId')}`, true);
            Session.setPersistent(`isAdminOrga${Session.get('orgaCibleId')}`, true);
          } else {
            const userC = Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }, { fields: { pwd: 0 } });
            if (orgaOne.links && orgaOne.links.projects && userC && userC.links && userC.links.projects) {
              // eslint-disable-next-line no-unused-vars
              const arrayIds = Object.keys(orgaOne.links.projects)
                .filter(k => userC.links.projects[k] && userC.links.projects[k].isAdmin && !userC.links.projects[k].toBeValidated && !userC.links.projects[k].isAdminPending && !userC.links.projects[k].isInviting)
                // eslint-disable-next-line array-callback-return
                .map(k => k);
              // console.log(arrayIds);
              const isAdmin = !!(arrayIds && arrayIds.length > 0);
              Session.setPersistent(`isAdmin${Session.get('orgaCibleId')}`, isAdmin);
              Session.setPersistent(`isAdminOrga${Session.get('orgaCibleId')}`, false);
            }
          }
        }
      }
    }
  }.bind(this));
});

Template.layout.events({
  'click [target=_blank]'(event) {
    event.preventDefault();
    const url = $(event.currentTarget).attr('href');
    if (Meteor.isCordova) {
      cordova.InAppBrowser.open(url, '_system');
    } else {
      window.open(url, '_blank');
    }
  },
  'click [target=_system]'(event) {
    event.preventDefault();
    const url = $(event.currentTarget).attr('href');
    if (Meteor.isCordova) {
      cordova.InAppBrowser.open(url, '_system');
    } else {
      window.open(url, '_system');
    }
  },
  'change .all-read input'() {
    Meteor.call('allSeen');
    Meteor.call('allRead');
  },
  'click .all-seen'() {
    Meteor.call('allSeen');
  },
});

Template.layout.helpers({
  scope() {
    return Organizations.findOne({
      _id: new Mongo.ObjectID(Session.get('orgaCibleId')),
    });
  },
  allReadChecked (notificationsCount) {
    if (notificationsCount === 0) {
      return 'checked';
    }
    return undefined;
  },
  notifications() {
    return ActivityStream.api.isUnread();
  },
  routeSwitch() {
    return Router.current().route.getName() !== 'switch';
  },
});

Template.forceUpdateAvailable.events({
  'click .positive-url'(event) {
    event.preventDefault();
    const url = event.currentTarget.getAttribute('href');
    window.open(url, '_system');
  },
});

