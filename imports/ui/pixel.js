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
import { Projects } from '../api/projects';
import { Organizations } from '../api/organizations';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;

Template.layout.onCreated(function() {
  Meteor.subscribe('notificationsUser');
  this.subscribe('projects.inscription', '5de9df6d064fca0d008b4568')
  this.subscribe('projects.actions','5de9df6d064fca0d008b4568' )
  this.subscribe('scopeDetail', 'organizations', '5de9df6d064fca0d008b4568');
  this.subscribe('directoryList', 'organizations', '5de9df6d064fca0d008b4568');
  this.subscribe('directoryListProjects', 'organizations', '5de9df6d064fca0d008b4568');
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
  RaffineriePoles(){
    let id = new Mongo.ObjectID("5de9df6d064fca0d008b4568")
    let raffinerieCursor = Organizations.findOne({_id: id })
    let raffinerieArray = raffinerieCursor.listProjectsCreator().fetch()
    let raffinerieTags = raffinerieArray.map(tag => tag.tags[0] )
    let uniqueRaffinerieTags = Array.from(new Set(raffinerieTags))
    return uniqueRaffinerieTags
   },
   //A revoir pour les actions par projets
  //  nbAction(poles){
  //   let polesProjectsArray = Projects.find({tags: poles}).fetch()
  //   // Penser à vérifier que le projet appartient bien à la Raffinerie
  //   let polesProjectsObjectId = polesProjectsArray.map(project => project._id)
  //   let polesProjectsId = []
  //   polesProjectsObjectId.forEach(ObjectId => { polesProjectsId.push(ObjectId.valueOf())});
  //   console.log(Actions.find({parentId: {$in: polesProjectsId}}).fetch())

  //  },
  nbActionPoles(poles){
    let id = new Mongo.ObjectID("5de9df6d064fca0d008b4568")
    let raffinerieCursor = Organizations.findOne({_id: id })
    let raffProjectsArray  = raffinerieCursor.listProjectsCreator().fetch()
    let raffProjectsObjectId = raffProjectsArray.map(project => project._id)
    let raffProjectsId = []
    raffProjectsObjectId.forEach(ObjectId => { raffProjectsId.push(ObjectId.valueOf())});
    let nbActions = Actions.find({parentId: {$in: raffProjectsId}, tags: poles}).count()
    return nbActions

    // console.log(Actions.find({parentId: {$in: polesProjectsId}}).fetch())

  }

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