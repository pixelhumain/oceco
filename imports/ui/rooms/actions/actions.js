/* eslint-disable meteor/no-session */
/* eslint-disable consistent-return */
/* global AutoForm Session */
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Mongo } from 'meteor/mongo';
import { Router } from 'meteor/iron:router';
import i18n from 'meteor/universe:i18n';
import { IonPopup } from 'meteor/meteoric:ionic';
import { MeteorCameraUI } from 'meteor/aboire:camera-ui';
import { $ } from 'meteor/jquery';
import { moment } from 'meteor/momentjs:moment';

import { Actions } from '../../../api/actions.js';
import { Events } from '../../../api/events.js';
import { Organizations } from '../../../api/organizations.js';
import { Projects } from '../../../api/projects.js';

import { nameToCollection } from '../../../api/helpers.js';

import { pageSession, searchAction } from '../../../api/client/reactive.js';

import './actions.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;

Template.detailActions.onCreated(function() {
  this.ready = new ReactiveVar();

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    pageSession.set('roomId', Router.current().params.roomId);
    pageSession.set('actionId', Router.current().params.actionId);
    const handle = Meteor.subscribe('detailActions', Router.current().params.scope, Router.current().params._id, Router.current().params.roomId, Router.current().params.actionId);
    if (handle.ready()) {
      if (Organizations.find({}).count() === 2) {
        const orgaOne = Organizations.findOne({
          name: { $exists: false },
        });
        if (orgaOne && Session.get('orgaCibleId') !== orgaOne._id._str) {
          Session.setPersistent('orgaCibleId', orgaOne._id._str);
        }
      }
      this.ready.set(handle.ready());
    }
  }.bind(this));
});

Template.detailActions.helpers({
  scope () {
    if (Router.current().params.scope) {
      const collection = nameToCollection(Router.current().params.scope);
      return collection.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
    }
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.buttonActionItem.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    call: false,
  });
});

Template.buttonActionItem.helpers({
  isCall() {
    return Template.instance().state.get('call');
  },
});

Template.buttonActionItem.events({
  'click .action-action-js'(event, instance) {
    event.preventDefault();
    instance.state.set('call', true);
    const action = $(event.currentTarget).data('action');
    Meteor.call('actionsType', { parentType: pageSession.get('scope'), parentId: pageSession.get('scopeId'), type: 'actions', id: pageSession.get('actionId'), name: 'status', value: action }, (error) => {
      if (error) {
        IonPopup.alert({ template: i18n.__(error.reason) });
      }
      instance.state.set('call', false);
    });
  },
});

Template.detailViewActions.events({
  /* 'click .admin-validation-js'(event) {
    event.preventDefault();
    const usrId = $(event.currentTarget).attr('usrId');
    const actionId = $(event.currentTarget).attr('actionId');
    if (usrId && actionId) {
      Meteor.call('ValidateAction', {
        actId: actionId,
        usrId,
        orgId: Session.get('orgaCibleId'),
      }, (err) => {
        if (err) {
          IonPopup.alert({ template: i18n.__(err.reason) });
        }
      });
    }
  },
  'click .admin-no-validation-js'(event) {
    event.preventDefault();
    const usrId = $(event.currentTarget).attr('usrId');
    const actionId = $(event.currentTarget).attr('actionId');
    if (usrId && actionId) {
      Meteor.call('noValidateAction', {
        actId: actionId,
        usrId,
        orgId: Session.get('orgaCibleId'),
      }, (err) => {
        if (err) {
          IonPopup.alert({ template: i18n.__(err.reason) });
        }
      });
    }
  },
  'click .admin-finish-action-js'(event) {
    event.preventDefault();
    const usrId = $(event.currentTarget).attr('usrId');
    const actionId = $(event.currentTarget).attr('actionId');
    if (usrId && actionId) {
      Meteor.call('finishActionAdmin', {
        actId: actionId,
        usrId,
        orgId: Session.get('orgaCibleId'),
      }, (error) => {
        if (error) {
          IonPopup.alert({ template: i18n.__(error.reason) });
        }
      });
    }
  },
  'click .admin-sortir-action-js'(event) {
    event.preventDefault();
    const memberId = $(event.currentTarget).attr('usrId');
    const id = $(event.currentTarget).attr('actionId');
    if (memberId && id) {
      Meteor.call('exitAction', {
        id,
        memberId,
        orgId: Session.get('orgaCibleId'),
      }, (error) => {
        if (error) {
          IonPopup.alert({ template: i18n.__(error.reason) });
        }
      });
    }
  }, */
  'click .search-tags-list-js'(event) {
    event.preventDefault();
    searchAction.set('search', `#${this}`);
    Router.go('home');
  },
  'click .photo-link-action'(event, instance) {
    const scope = pageSession.get('scope');
    const scopeId = pageSession.get('scopeId');
    const actionId = pageSession.get('actionId');

    if (Meteor.isDesktop) {
      instance.$('#file-upload-action').trigger('click');
    } else if (Meteor.isCordova) {
      const options = {
        width: 640,
        height: 480,
        quality: 75,
      };

      const successCallback = () => {
        IonPopup.confirm({
          title: i18n.__('Photo'),
          template: i18n.__('Do you want to add another photo to this news'),
          onOk() {
            MeteorCameraUI.getPicture(options, function (error, data) {
              if (!error) {
                const str = `${+new Date() + Math.floor((Math.random() * 100) + 1)}.jpg`;
                Meteor.call('photoActions', data, str, scope, scopeId, actionId, function (errorCall, result) {
                  if (!errorCall) {
                    successCallback();
                  } else {
                    // console.log('error',error);
                  }
                });
              }
            });
          },
          onCancel() {
            Router.go('actionsDetail', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope'), roomId: pageSession.get('roomId'), actionId: pageSession.get('actionId') });
          },
          cancelText: i18n.__('finish'),
          okText: i18n.__('other picture'),
        });
      };

      MeteorCameraUI.getPicture(options, function (error, data) {
        if (!error) {
          const str = `${+new Date() + Math.floor((Math.random() * 100) + 1)}.jpg`;
          Meteor.call('photoActions', data, str, scope, scopeId, actionId, function (errorCall) {
            if (!errorCall) {
              successCallback();
            } else {
              // console.log('error',error);
            }
          });
        }
      });
    } else {
      instance.$('#file-upload-action').trigger('click');
    }
  },
  'change #file-upload-action'(event, instance) {
    event.preventDefault();
    const scope = pageSession.get('scope');
    const scopeId = pageSession.get('scopeId');
    const actionId = pageSession.get('actionId');

    function successCallback() {
      IonPopup.confirm({
        title: i18n.__('Photo'),
        template: i18n.__('Do you want to add another photo to this news'),
        onOk() {
          instance.$('#file-upload-action').trigger('click');
        },
        onCancel() {
          Router.go('actionsDetail', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope'), roomId: pageSession.get('roomId'), actionId: pageSession.get('actionId') });
        },
        cancelText: i18n.__('finish'),
        okText: i18n.__('other picture'),
      });
    }

    if (window.File && window.FileReader && window.FileList && window.Blob) {
      _.each(instance.find('#file-upload-action').files, function (file) {
        if (file.size > 1) {
          const reader = new FileReader();
          reader.onload = function () {
            const str = file.name;
            const dataURI = reader.result;
            Meteor.call('photoActions', dataURI, str, scope, scopeId, actionId, function (error, result) {
              if (!error) {
                successCallback();
              } else {
                // console.log('error',error);
              }
            });
          };
          reader.readAsDataURL(file);
        }
      });
    }
  },
  'click .photo-viewer'(event) {
    event.preventDefault();
    if (this.moduleId) {
      const url = `${Meteor.settings.public.urlimage}/upload/${this.moduleId}/${this.folder}/${this.name}`;
      if (Meteor.isCordova) {
        PhotoViewer.show(url);
      } else {
        window.open(url, '_blank');
      }
    }
  },
});

Template.actionsAdd.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  pageSession.set('error', false);
  pageSession.set('options.creditAddPorteur', null);
  pageSession.set('options.creditSharePorteur', null);
  pageSession.set('min', null);
  pageSession.set('max', null);
  pageSession.set('isPossiblecreditSharePorteur', null);
  pageSession.set('isCredits', null);
  pageSession.set('credits', null);
  pageSession.set('isStartDate', null);
  pageSession.set('isDepense', null);

  this.autorun(function () {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    const handle = Meteor.subscribe('scopeDetail', Router.current().params.scope, Router.current().params._id);
    if (handle.ready()) {
      template.ready.set(handle.ready());
    }
  });
});

Template.actionsFields.onDestroyed(function () {
  const self = this;
  self.$("input[name='tagsText']").atwho('destroy');
});

Template.actionsFields.helpers({
  isCordova() {
    return Meteor.isCordova;
  },
  isScopeCitoyens() {
    return Router.current().params.scope === 'citoyens';
  },
  isMinMax() {
    if (Session.get('settingOceco')) {
      const settingOceco = Session.get('settingOceco');
      return settingOceco && settingOceco.costum && settingOceco.costum.actions && settingOceco.costum.actions.form && (settingOceco.costum.actions.form.max || settingOceco.costum.actions.form.min);
    }
  },
  isCreditAddPorteur() {
    return pageSession.get('options.creditAddPorteur');
  },
  isPossiblecreditSharePorteur() {
    return pageSession.get('isPossiblecreditSharePorteur');
  },
  isCreditSharePorteur() {
    return pageSession.get('options.creditSharePorteur');
  },
  isMin() {
    return pageSession.get('min');
  },
  isMax() {
    return pageSession.get('max');
  },
  isCredits() {
    return pageSession.get('isCredits');
  },
  isStartDate() {
    return pageSession.get('isStartDate');
  },
  isDepense() {
    return pageSession.get('isDepense');
  },
});

Template.actionsFields.events({
  // Pressing Enter should submit the form
  'keydown input[name*="urls"]'(event, instance) {
    if (event.keyCode === 13) {
      instance.find('.autoform-add-item').click();
    }
  },
  'click input[name="options.creditAddPorteur"]'(event) {
    pageSession.set('options.creditAddPorteur', event.currentTarget.checked);
    pageSession.set('isPossiblecreditSharePorteur', false);
    pageSession.set('min', 1);
    pageSession.set('max', 1);
    pageSession.set('credits', 1);
  },
  'click input[name="options.creditSharePorteur"]'(event, instance) {
    pageSession.set('options.creditSharePorteur', event.currentTarget.checked);
    const credits = pageSession.get('credits');
    const max = pageSession.get('max');
    if (credits && max && credits < max) {
      instance.$('input[name="credits"]').val(parseInt(max));
      pageSession.set('credits', parseInt(max));
    } else if (!credits && max) {
      instance.$('input[name="credits"]').val(parseInt(max));
      pageSession.set('credits', parseInt(max));
    }
  },
  'keyup input[name="min"]'(event) {
    if (!pageSession.get('isDepense')) {
      if ((event.currentTarget.value && event.currentTarget.value > 1) || (pageSession.get('max') && pageSession.get('max') > 1)) {
        pageSession.set('isPossiblecreditSharePorteur', true);
      } else {
        pageSession.set('isPossiblecreditSharePorteur', false);
      }
    } else {
      pageSession.set('isPossiblecreditSharePorteur', false);
    }

    pageSession.set('min', parseInt(event.currentTarget.value));
  },
  'keyup input[name="max"]'(event) {
    if (!pageSession.get('isDepense')) {
      if ((event.currentTarget.value && event.currentTarget.value > 1) || (pageSession.get('min') && pageSession.get('min') > 1)) {
        pageSession.set('isPossiblecreditSharePorteur', true);
      } else {
        pageSession.set('isPossiblecreditSharePorteur', false);
      }
    } else {
      pageSession.set('isPossiblecreditSharePorteur', false);
    }

    pageSession.set('max', parseInt(event.currentTarget.value));
  },
  'keyup input[name="credits"]'(event, instance) {
    if (event.currentTarget && event.currentTarget.value && event.currentTarget.value > 0) {
      pageSession.set('isCredits', true);
      pageSession.set('credits', parseInt(event.currentTarget.value));
      pageSession.set('isDepense', false);
    } else if (event.currentTarget && event.currentTarget.value && event.currentTarget.value < 0) {
      // console.log('depense');
      pageSession.set('isCredits', true);
      pageSession.set('credits', parseInt(event.currentTarget.value));
      pageSession.set('isDepense', true);
      const creditSharePorteur = instance.find('input[name="options.creditSharePorteur"]');
      if (creditSharePorteur) {
        creditSharePorteur.checked = false;
      }
    } else {
      pageSession.set('isCredits', false);
      pageSession.set('credits', parseInt(event.currentTarget.value));
      pageSession.set('isDepense', false);
    }
    const max = pageSession.get('max');
    if (event.currentTarget && event.currentTarget.value && event.currentTarget.value < max) {
      const creditSharePorteur = instance.find('input[name="options.creditSharePorteur"]');
      if (creditSharePorteur) {
        creditSharePorteur.checked = false;
      }
    }
  },
  'keyup/change input[name="startDate"]'(event) {
    if (event.currentTarget.value) {
      pageSession.set('isStartDate', true);
    } else {
      pageSession.set('isStartDate', false);
    }
  },
});

Template.actionsFields.onRendered(function () {
  const self = this;
  const template = Template.instance();
  template.find('input[name=name]').focus();

  if (Meteor.isCordova) {
  // mobile predictive desactived
    const tagText = template.find("input[name='tagsText']");
    if (tagText.value !== '') {
      tagText.type = 'text';
    }
    self.$("input[name='tagsText']").on('focus', function () {
      this.type = 'text';
      if (!this.value) {
        this.value = '#';
      }
    });
  } else {
    self.$("input[name='tagsText']").on('focus', function () {
      if (!this.value) {
        this.value = '#';
      }
    });
  }

  // #tags
  if (Router.current().params.scope !== 'citoyens') {
    const orgaOne = Organizations.findOne({ _id: new Mongo.ObjectID(Session.get('orgaCibleId')) });
    pageSession.set('queryTag', false);
    pageSession.set('tags', false);
    self.$("input[name='tagsText']").atwho({
      at: '#',
      data: orgaOne && orgaOne.oceco && orgaOne.oceco.tags ? orgaOne.oceco.tags : [],
      limit: orgaOne && orgaOne.oceco && orgaOne.oceco.tags && orgaOne.oceco.tags.length > 0 ? orgaOne.oceco.tags.length : 0,
    }).on('inserted.atwho', function (event, $li) {
      // console.log(JSON.stringify($li.data('item-data')));
      if ($li.data('item-data')['atwho-at'] === '#') {
        const tag = $li.data('item-data').name;
        if (pageSession.get('tags')) {
          const arrayTags = pageSession.get('tags');
          arrayTags.push(tag);
          pageSession.set('tags', arrayTags);
        } else {
          pageSession.set('tags', [tag]);
        }
      }
    });
  }
});

Template.actionsEdit.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  pageSession.set('error', false);
  pageSession.set('options.creditAddPorteur', null);
  pageSession.set('options.creditSharePorteur', null);
  pageSession.set('min', null);
  pageSession.set('max', null);
  pageSession.set('isPossiblecreditSharePorteur', null);
  pageSession.set('isCredits', null);
  pageSession.set('credits', null);
  pageSession.set('isStartDate', null);
  pageSession.set('isDepense', null);

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    // pageSession.set('roomId', Router.current().params.roomId);
    pageSession.set('actionId', Router.current().params.actionId);
  });

  this.autorun(function() {
    const handle = Meteor.subscribe('detailActions', Router.current().params.scope, Router.current().params._id, Router.current().params.roomId, Router.current().params.actionId);
    if (handle.ready()) {
      template.ready.set(handle.ready());
    }
  });
});

Template.actionsAdd.helpers({
  action() {
    const actionEdit = {};
    if (Router.current().params.scope === 'events') {
      const collection = nameToCollection(Router.current().params.scope);
      const event = collection.findOne({ _id: new Mongo.ObjectID(Router.current().params._id) });
      if (event) {
        if (event.startDate) {
          actionEdit.startDate = moment(event.startDate).toDate();
        }
        if (event.endDate) {
          actionEdit.endDate = moment(event.endDate).toDate();
        }
      }
      // console.log(actionEdit);
    }
    if (searchAction.get('actionName')) {
      actionEdit.name = searchAction.get('actionName');
    }
    return actionEdit;
  },
  error () {
    return pageSession.get('error');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.actionsAdd.events({
  // Pressing Ctrl+Enter should submit the form
  'keydown form'(event, instance) {
    if (event.keyCode === 13 && (event.metaKey || event.ctrlKey)) {
      instance.find('button[type=submit]').click();
    }
  },
});

Template.actionsEdit.helpers({
  action () {
    const action = Actions.findOne({ _id: new Mongo.ObjectID(Router.current().params.actionId) });
    const actionEdit = {};
    actionEdit._id = action._id._str;
    actionEdit.name = action.name;
    actionEdit.startDate = action.startDate;
    actionEdit.endDate = action.endDate;
    if (action.startDate) {
      actionEdit.startDate = action.momentStartDate();
      pageSession.set('isStartDate', true);
    }
    if (action.endDate) {
      actionEdit.endDate = action.momentEndDate();
    }
    actionEdit.description = action.description;
    if (action.tags && action.tags.length > 0) {
      actionEdit.tagsText = action.tags.map(tag => `#${tag}`).join(' ');
    }
    actionEdit.urls = action.urls;
    actionEdit.min = action.min;
    actionEdit.max = action.max;
    actionEdit.credits = action.credits;
    actionEdit.options = action.options;

    if (action.options) {
      if (action.options.creditAddPorteur) {
        pageSession.set('options.creditAddPorteur', true);
        pageSession.set('isPossiblecreditSharePorteur', false);
      }
      if (action.options.creditSharePorteur) {
        pageSession.set('options.creditSharePorteur', true);
        pageSession.set('isPossiblecreditSharePorteur', true);
      }
    }

    if (action.min) {
      pageSession.set('min', action.min);
    }
    if (action.max) {
      pageSession.set('max', action.max);
    }

    if (action.startDate) {
      actionEdit.startDate = action.momentStartDate();
    }

    if (action.credits && action.credits > 0) {
      pageSession.set('isCredits', true);
      pageSession.set('credits', action.credits);
    } else {
      pageSession.set('isCredits', false);
      pageSession.set('credits', action.credits);
    }

    return actionEdit;
  },
  error () {
    return pageSession.get('error');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

AutoForm.addHooks(['addAction', 'editAction'], {
  after: {
    method(error) {
      if (!error) {
        // Router.go('roomsDetail', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope'), roomId: pageSession.get('roomId') }, { replaceState: true });
        searchAction.set('search', null);
        searchAction.set('actionName', null);
        Router.go('actionsList', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope') }, { replaceState: true });
      }
    },
    'method-update'(error) {
      if (!error) {
        // Router.go('roomsDetail', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope'), roomId: pageSession.get('roomId') }, { replaceState: true });
        Router.go('actionsList', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope') }, { replaceState: true });
      }
    },
  },
  before: {
    method(doc) {
      doc.parentType = pageSession.get('scope');
      doc.parentId = pageSession.get('scopeId');
      // doc.idParentRoom = pageSession.get('roomId');
      // console.log(pageSession.get('scopeId'));
      // console.log(doc);
      return doc;
    },
    'method-update'(modifier) {
      modifier.$set.parentType = pageSession.get('scope');
      modifier.$set.parentId = pageSession.get('scopeId');
      // modifier.$set.idParentRoom = pageSession.get('roomId');
      return modifier;
    },
  },
  onError(error) {
    if (error.errorType && error.errorType === 'Meteor.Error') {
      if (error && error.error === 'error_call') {
        pageSession.set('error', error.reason.replace(': ', ''));
      }
    }
  },
});
