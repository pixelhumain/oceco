/* global Session IonPopup IonActionSheet */
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { Counter } from 'meteor/natestrauser:publish-performant-counts';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';

import './card.html';
import IOlazy from '../iolazyload.js';
import { Citoyens } from '../../../api/citoyens';
import { Organizations } from '../../../api/organizations';

Template.scopeCard.onRendered(function () {
  // eslint-disable-next-line no-new
  new IOlazy({
    image: 'img',
    threshold: 1,
  });
});

Template.scopeCard.helpers({
  preferenceTrue (value) {
    return !!((value === true || value === 'true'));
  },
  listMembers() {
    // eslint-disable-next-line meteor/no-session
    return Organizations.findOne({ _id: new Mongo.ObjectID(Session.get('orgaCibleId')) }).membersPopMap();
  },
});

Template.scopeBoardActions.onCreated(function () {
  this.autorun(function () {
    Meteor.subscribe('scopeActionIndicatorCount', this.data.scope, this.data._id, 'all');
  }.bind(this));
});

Template.scopeBoardActions.helpers({
  countActionsStatus(status) {
    return Counter.get(`countScopeAction.${Template.instance().data._id}.${Template.instance().data.scope}.${status}`);
  },
});

Template.scopeBoardActionsItem.onCreated(function () {
  this.autorun(function () {
    Meteor.subscribe('scopeActionIndicatorCount', this.data.scope, this.data._id, this.data.status);
  }.bind(this));
});

Template.scopeBoardActionsItem.helpers({
  countActionsStatus(status) {
    return Counter.get(`countScopeAction.${Template.instance().data._id}.${Template.instance().data.scope}.${status}`);
  },
  pourActionsStatus(totalStatus, status) {
    const total = Counter.get(`countScopeAction.${Template.instance().data._id}.${Template.instance().data.scope}.${totalStatus}`);
    const count = Counter.get(`countScopeAction.${Template.instance().data._id}.${Template.instance().data.scope}.${status}`);
    if (total === 0) {
      return 0;
    }
    const pourcentage = (100 * count) / total;
    if (Number.isInteger(pourcentage)) {
      return pourcentage;
    }
    return parseFloat(pourcentage).toFixed(2);
  },
});

Template.scopeBoardUserActions.onCreated(function () {
  this.autorun(function () {
    Meteor.subscribe('citoyenLight', this.data.userId);
    Meteor.subscribe('scopeUserActionIndicatorCount', this.data.scope, this.data._id, 'all', this.data.userId);
  }.bind(this));
});

Template.scopeBoardUserActions.helpers({
  userItem() {
    return Citoyens.findOne({ _id: new Mongo.ObjectID(Template.instance().data.userId) });
  },
  countUserActionsStatus(status, userId) {
    return Counter.get(`countScopeUserAction.${userId}.${Template.instance().data._id}.${Template.instance().data.scope}.${status}`);
  },
});


Template.scopeBoardUserActionsItem.onCreated(function () {
  this.autorun(function () {
    Meteor.subscribe('scopeUserActionIndicatorCount', this.data.scope, this.data._id, this.data.status, this.data.userId);
  }.bind(this));
});

Template.scopeBoardUserActionsItem.helpers({
  countUserActionsStatus(status, userId) {
    return Counter.get(`countScopeUserAction.${userId}.${Template.instance().data._id}.${Template.instance().data.scope}.${status}`);
  },
  pourUserActionsStatus(totalStatus, status, userId) {
    const total = Counter.get(`countScopeUserAction.${userId}.${Template.instance().data._id}.${Template.instance().data.scope}.${totalStatus}`);
    const count = Counter.get(`countScopeUserAction.${userId}.${Template.instance().data._id}.${Template.instance().data.scope}.${status}`);
    if (total === 0) {
      return 0;
    }
    const pourcentage = (100 * count) / total;
    if (Number.isInteger(pourcentage)) {
      return pourcentage;
    }
    return parseFloat(pourcentage).toFixed(2);
  },
});


Template.actionSheet.events({
  'click .action-card-citoyen' (event) {
    event.preventDefault();
    // info,description,contact
    IonActionSheet.show({
      titleText: i18n.__('Actions Citoyens'),
      buttons: [
        { text: `${i18n.__('edit info')} <i class="icon ion-edit"></i>` },
        { text: `${i18n.__('edit network')} <i class="icon ion-edit"></i>` },
        { text: `${i18n.__('edit description')} <i class="icon ion-edit"></i>` },
        { text: `${i18n.__('edit address')} <i class="icon ion-edit"></i>` },
        { text: `${i18n.__('edit privacy settings')} <i class="icon ion-edit"></i>` },
        { text: `${i18n.__('edit notification oceco')} <i class="icon ion-edit"></i>` },
      ],
      cancelText: i18n.__('cancel'),
      cancel() {
        // console.log('Cancelled!');
      },
      buttonClicked(index) {
        if (index === 0) {
          // console.log('Edit!');
          Router.go('citoyensBlockEdit', { _id: Router.current().params._id, block: 'info' });
        }
        if (index === 1) {
          // console.log('Edit!');
          Router.go('citoyensBlockEdit', { _id: Router.current().params._id, block: 'network' });
        }
        if (index === 2) {
          // console.log('Edit!');
          Router.go('citoyensBlockEdit', { _id: Router.current().params._id, block: 'descriptions' });
        }
        if (index === 3) {
          // console.log('Edit!');
          Router.go('citoyensBlockEdit', { _id: Router.current().params._id, block: 'locality' });
        }
        if (index === 4) {
          // console.log('Edit!');
          Router.go('citoyensBlockEdit', { _id: Router.current().params._id, block: 'preferences' });
        }
        if (index === 5) {
          // console.log('Edit!');
          Router.go('ocecoCitoyenEdit', { _id: Router.current().params._id });
        }
        return true;
      },
    });
  },
  'click .action-card-events' (event) {
    event.preventDefault();
    // info,description,contact
    IonActionSheet.show({
      titleText: i18n.__('Actions Events'),
      buttons: [
        { text: `${i18n.__('edit info')} <i class="icon ion-edit"></i>` },
        { text: `${i18n.__('edit network')} <i class="icon ion-edit"></i>` },
        { text: `${i18n.__('edit description')} <i class="icon ion-edit"></i>` },
        { text: `${i18n.__('edit address')} <i class="icon ion-edit"></i>` },
        { text: `${i18n.__('edit dates')} <i class="icon ion-edit"></i>` },
      ],
      destructiveText: 'Supprimer <i class="icon ion-trash-a"></i>',
      destructiveButtonClicked() {
        // console.log('Edit!');
        IonPopup.confirm({
          title: 'Supprimer',
          template: 'Supprimer cette évènement ?',
          onOk() {
            Meteor.call('deleteElementAdmin', { scope: 'events', scopeId: Router.current().params._id }, (error) => {
              if (error) {
                IonPopup.alert({ template: i18n.__(error.reason) });
              } else {
                Router.go('/');
              }
            });
          },
          onCancel() {
          },
          cancelText: i18n.__('no'),
          okText: i18n.__('yes'),
        });
        return true;
      },
      cancelText: i18n.__('cancel'),
      cancel() {
        // console.log('Cancelled!');
      },
      buttonClicked(index) {
        if (index === 0) {
          // console.log('Edit!');
          Router.go('eventsBlockEdit', { _id: Router.current().params._id, block: 'info' });
        }
        if (index === 1) {
          // console.log('Edit!');
          Router.go('eventsBlockEdit', { _id: Router.current().params._id, block: 'network' });
        }
        if (index === 2) {
          // console.log('Edit!');
          Router.go('eventsBlockEdit', { _id: Router.current().params._id, block: 'descriptions' });
        }
        if (index === 3) {
          // console.log('Edit!');
          Router.go('eventsBlockEdit', { _id: Router.current().params._id, block: 'locality' });
        }
        if (index === 4) {
          // console.log('Edit!');
          Router.go('eventsBlockEdit', { _id: Router.current().params._id, block: 'when' });
        }
        /* if (index === 5) {
          // console.log('Edit!');
          Router.go('eventsBlockEdit', { _id: Router.current().params._id, block: 'preferences' });
        } */
        return true;
      },
    });
  },
  'click .action-card-organizations' (event) {
    event.preventDefault();
    // info,description,contact
    IonActionSheet.show({
      titleText: i18n.__('Actions Organizations'),
      buttons: [
        { text: `${i18n.__('edit info')} <i class="icon ion-edit"></i>` },
        { text: `${i18n.__('edit network')} <i class="icon ion-edit"></i>` },
        { text: `${i18n.__('edit description')} <i class="icon ion-edit"></i>` },
        { text: `${i18n.__('edit address')} <i class="icon ion-edit"></i>` },
      ],
      cancelText: i18n.__('cancel'),
      cancel() {
        // console.log('Cancelled!');
      },
      buttonClicked(index) {
        if (index === 0) {
          // console.log('Edit!');
          Router.go('organizationsBlockEdit', { _id: Router.current().params._id, block: 'info' });
        }
        if (index === 1) {
          // console.log('Edit!');
          Router.go('organizationsBlockEdit', { _id: Router.current().params._id, block: 'network' });
        }
        if (index === 2) {
          // console.log('Edit!');
          Router.go('organizationsBlockEdit', { _id: Router.current().params._id, block: 'descriptions' });
        }
        if (index === 3) {
          // console.log('Edit!');
          Router.go('organizationsBlockEdit', { _id: Router.current().params._id, block: 'locality' });
        }
        if (index === 4) {
          // console.log('Edit!');
          Router.go('organizationsBlockEdit', { _id: Router.current().params._id, block: 'preferences' });
        }
        return true;
      },
    });
  },
  'click .action-card-projects' (event) {
    event.preventDefault();
    // info,description,contact
    IonActionSheet.show({
      titleText: i18n.__('Actions Projects'),
      buttons: [
        { text: `${i18n.__('edit info')} <i class="icon ion-edit"></i>` },
        // { text: `${i18n.__('edit network')} <i class="icon ion-edit"></i>` },
        { text: `${i18n.__('edit description')} <i class="icon ion-edit"></i>` },
        // { text: `${i18n.__('edit address')} <i class="icon ion-edit"></i>` },
        { text: `${i18n.__('edit dates')} <i class="icon ion-edit"></i>` },
      ],
      cancelText: i18n.__('cancel'),
      cancel() {
        // console.log('Cancelled!');
      },
      buttonClicked(index) {
        if (index === 0) {
          // console.log('Edit!');
          Router.go('projectsBlockEdit', { _id: Router.current().params._id, block: 'info' });
        }
        /* if (index === 1) {
          Router.go('projectsBlockEdit', { _id: Router.current().params._id, block: 'network' });
        } */
        if (index === 1) {
          // console.log('Edit!');
          Router.go('projectsBlockEdit', { _id: Router.current().params._id, block: 'descriptions' });
        }
        /* if (index === 3) {
          // console.log('Edit!');
          Router.go('projectsBlockEdit', { _id: Router.current().params._id, block: 'locality' });
        } */
        if (index === 2) {
          // console.log('Edit!');
          Router.go('projectsBlockEdit', { _id: Router.current().params._id, block: 'when' });
        }
        if (index === 3) {
          // console.log('Edit!');
          Router.go('projectsBlockEdit', { _id: Router.current().params._id, block: 'preferences' });
        }
        return true;
      },
    });
  },
  'click .action-card-poi' (event) {
    event.preventDefault();
    // info,description,contact
    IonActionSheet.show({
      titleText: i18n.__('Actions Poi'),
      buttons: [
        { text: `${i18n.__('edit info')} <i class="icon ion-edit"></i>` },
      ],
      cancelText: i18n.__('cancel'),
      cancel() {
        // console.log('Cancelled!');
      },
      buttonClicked(index) {
        if (index === 0) {
          // console.log('Edit!');
          Router.go('poiEdit', { _id: Router.current().params._id });
        }
        return true;
      },
    });
  },
  'click .action-card-classified' (event) {
    event.preventDefault();
    // info,description,contact
    IonActionSheet.show({
      titleText: i18n.__('Actions Classified'),
      buttons: [
        { text: `${i18n.__('edit info')} <i class="icon ion-edit"></i>` },
      ],
      cancelText: i18n.__('cancel'),
      cancel() {
        // console.log('Cancelled!');
      },
      buttonClicked(index) {
        if (index === 0) {
          // console.log('Edit!');
          Router.go('classifiedEdit', { _id: Router.current().params._id });
        }
        return true;
      },
    });
  },
});
