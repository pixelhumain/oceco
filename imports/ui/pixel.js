import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import i18n from 'meteor/universe:i18n';
import { IonPopup } from 'meteor/meteoric:ionic';
import { Mongo } from 'meteor/mongo';
import { ReactiveVar } from 'meteor/reactive-var';

import { ActivityStream } from '../api/activitystream.js';

import './settings/settings.js';
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
  Meteor.subscribe('notificationsUser');

  this.ready = new ReactiveVar(false);
  this.autorun(function () {
    const handle = Meteor.subscribe('projects.actions', Meteor.settings.public.orgaCibleId);
    const handleScopeDetail = Meteor.subscribe('scopeDetail', 'organizations', Meteor.settings.public.orgaCibleId);
    const handleDirectoryList = Meteor.subscribe('directoryList', 'organizations', Meteor.settings.public.orgaCibleId);
    const handleDirectoryListProjects = Meteor.subscribe('directoryListProjects', 'organizations', Meteor.settings.public.orgaCibleId);
    if (handle.ready() && handleScopeDetail.ready() && handleDirectoryList.ready() && handleDirectoryListProjects.ready()) {
      this.ready.set(handle.ready());
    }
  }.bind(this));
});

Template.layout.events({
  'click [target=_blank]'(event) {
    event.preventDefault();
    if (Meteor.isCordova) {
      const url = $(event.currentTarget).attr('href');
      cordova.InAppBrowser.open(url, '_system');
    }
  },
  'click [target=_system]'(event) {
    event.preventDefault();
    if (Meteor.isCordova) {
      const url = $(event.currentTarget).attr('href');
      cordova.InAppBrowser.open(url, '_system');
    }
  },
  'change .all-read input'() {
    Meteor.call('allRead');
  },
  'click .all-seen'() {
    Meteor.call('allSeen');
  },
  'click .scanner'(event) {
    event.preventDefault();
    if (Meteor.isCordova) {
      cordova.plugins.barcodeScanner.scan(
        function (result) {
          if (result.cancelled === false && result.text && result.format === 'QR_CODE') {
            // console.log(result.text);
            // en fonction de ce qu'il y a dans le qr code
            // ex {type:"events",_id:""} ou url
            // alert(result.text);
            let qr = {};
            if (result.text.split('#').length === 2) {
              const urlArray = result.text.split('#')[1].split('.');
              if (urlArray && urlArray.length === 4) {
                qr.type = urlArray[0];
                qr._id = urlArray[3];
              } else if (urlArray && urlArray.length === 5) {
                qr.type = urlArray[2];
                qr._id = urlArray[4];
              }
            } else {
              qr = JSON.parse(result.text);
            }

            if (qr && qr.type && qr._id) {
              if (qr.type === 'citoyens') {
                Router.go('detailList', { scope: qr.type, _id: qr._id });
                IonPopup.confirm({ title: i18n.__('Scanner QRcode'),
                  template: i18n.__('would you like to connect to this'),
                  onOk() {
                    Meteor.call('followPersonExist', qr._id, function (error) {
                      if (!error) {
                        window.alert(i18n.__('successful connection'));
                      // Router.go('detailList', {scope:qr.type,_id:qr._id});
                      } else {
                        window.alert(error.reason);
                        // console.log('error', error);
                      }
                    });
                  },
                  onCancel() {
                    // Router.go('detailList', {scope:qr.type,_id:qr._id});
                  },
                  cancelText: i18n.__('no'),
                  okText: i18n.__('yes'),
                });
              } else if (qr.type === 'events') {
                Router.go('detailList', { scope: qr.type, _id: qr._id });
                IonPopup.confirm({ title: i18n.__('Scanner QRcode'),
                  template: i18n.__('would you like to connect to this'),
                  onOk() {
                    Meteor.call('saveattendeesEvent', qr._id, function (error) {
                      if (!error) {
                        window.alert(i18n.__('successful connection'));
                      // Router.go("detailList",{scope:qr.type,_id:qr._id});
                      } else {
                        window.alert(error.reason);
                        // console.log('error', error);
                      }
                    });
                  },
                  onCancel() {
                    // Router.go('detailList', {scope:qr.type,_id:qr._id});
                  },
                  cancelText: i18n.__('no'),
                  okText: i18n.__('yes'),
                });
              } else if (qr.type === 'organizations') {
                Router.go('detailList', { scope: qr.type, _id: qr._id });
                IonPopup.confirm({ title: i18n.__('Scanner QRcode'),
                  template: i18n.__('would you like to connect to this'),
                  onOk() {
                    Meteor.call('connectEntity', qr._id, qr.type, function (error) {
                      if (!error) {
                        window.alert(i18n.__('successful connection'));
                      // Router.go("detailList",{scope:qr.type,_id:qr._id});
                      } else {
                        window.alert(error.reason);
                        // console.log('error', error);
                      }
                    });
                  },
                  onCancel() {
                    // Router.go('detailList', {scope:qr.type,_id:qr._id});
                  },
                  cancelText: i18n.__('no'),
                  okText: i18n.__('yes'),
                });
              } else if (qr.type === 'projects') {
                Router.go('detailList', { scope: qr.type, _id: qr._id });

                IonPopup.confirm({ title: i18n.__('Scanner QRcode'),
                  template: i18n.__('would you like to connect to this'),
                  onOk() {
                    Meteor.call('connectEntity', qr._id, qr.type, function (error) {
                      if (!error) {
                        window.alert(i18n.__('successful connection'));
                      // Router.go("detailList",{scope:qr.type,_id:qr._id});
                      } else {
                        window.alert(error.reason);
                        // console.log('error', error);
                      }
                    });
                  },
                  onCancel() {
                    // Router.go('detailList', {scope:qr.type,_id:qr._id});
                  },
                  cancelText: i18n.__('no'),
                  okText: i18n.__('yes'),
                });
              }
            } else {
            // Router.go("detailList",{scope:'events',_id:result.text});
            }
          }
        },
        function (error) {
          window.alert(`Scanning failed: ${error}`);
        },
      );
    }
  },
});

Template.layout.helpers({
  allReadChecked (notificationsCount) {
    if (notificationsCount === 0) {
      return 'checked';
    }
    return undefined;
  },
  notifications() {
    return ActivityStream.api.isUnread();
  },
  RaffineriePoles() {
    if (Template.instance().ready.get()) {
      const id = new Mongo.ObjectID(Meteor.settings.public.orgaCibleId);
      const raffinerieCursor = Organizations.findOne({ _id: id });
      if (raffinerieCursor) {
        const raffinerieArray = raffinerieCursor.listProjectsCreator();
        const raffinerieTags = raffinerieArray.map(tag => tag.tags[0]);
        const uniqueRaffinerieTags = Array.from(new Set(raffinerieTags));
        return uniqueRaffinerieTags;
      }
    }
  },
  // A revoir pour les actions par projets
  //  nbAction(poles){
  //   let polesProjectsArray = Projects.find({tags: poles}).fetch()
  //   // Penser à vérifier que le projet appartient bien à la Raffinerie
  //   let polesProjectsObjectId = polesProjectsArray.map(project => project._id)
  //   let polesProjectsId = []
  //   polesProjectsObjectId.forEach(ObjectId => { polesProjectsId.push(ObjectId.valueOf())});
  //   console.log(Actions.find({parentId: {$in: polesProjectsId}}).fetch())

  //  },
  nbActionPoles(poles) {
    if (Template.instance().ready.get()) {
      const id = new Mongo.ObjectID(Meteor.settings.public.orgaCibleId);
      const raffinerieCursor = Organizations.findOne({ _id: id });
      if (raffinerieCursor) {
        const raffProjectsArray = raffinerieCursor.listProjectsCreator();
        if (raffProjectsArray.count() > 0) {
          const raffProjectsObjectId = raffProjectsArray.map(project => project._id);
          const projectInPole = Projects.find({_id: {$in: raffProjectsObjectId},tags: poles}).map(project => project._id._str)
          const nbActions = Actions.find({ parentId: { $in: projectInPole }}).count();
          return nbActions;
        }
      }
      return 0;
    // console.log(Actions.find({parentId: {$in: polesProjectsId}}).fetch())
    }
  },

  //  Comptage(poleId){
  //   // let id = poleId.valueOf()
  //   let poleCursor = Projects.findOne({_id: poleId})
  //   return poleCursor
  //  }
});

Template.forceUpdateAvailable.events({
  'click .positive-url'(event) {
    event.preventDefault();
    const url = event.currentTarget.getAttribute('href');
    window.open(url, '_system');
  },
});
