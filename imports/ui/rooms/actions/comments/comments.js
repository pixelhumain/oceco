import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import i18n from 'meteor/universe:i18n';
import { AutoForm } from 'meteor/aldeed:autoform';
import { IonActionSheet } from 'meteor/meteoric:ionic';

// collection
import { Events } from '../../../../api/events.js';
import { Organizations } from '../../../../api/organizations.js';
import { Projects } from '../../../../api/projects.js';
import { Citoyens } from '../../../../api/citoyens.js';
import { Comments } from '../../../../api/comments.js';

// submanager
import { singleSubs } from '../../../../api/client/subsmanager.js';

import { nameToCollection } from '../../../../api/helpers.js';

import './comments.html';

window.Events = Events;
window.Organizations = Organizations;
window.Projects = Projects;
window.Citoyens = Citoyens;

const pageSession = new ReactiveDict('pageActionsComments');

Template.actionsDetailComments.onCreated(function () {
  const template = Template.instance();
  template.ready = new ReactiveVar();
  template.scope = Router.current().params.scope;
  template._id = Router.current().params._id;
  template.roomId = Router.current().params.roomId;
  template.actionId = Router.current().params.actionId;
  this.autorun(function() {
    pageSession.set('scopeId', template._id);
    pageSession.set('scope', template.scope);
    pageSession.set('roomId', template.roomId);
    pageSession.set('actionId', template.actionId);
  });

  this.autorun(function() {
    if (template.scope && template._id && template.roomId && template.actionId) {
      // const handle = singleSubs.subscribe('detailActions', template.scope, template._id, template.roomId, template.actionId);
      const handle = Meteor.subscribe('actionsDetailComments', template.scope, template._id, template.roomId, template.actionId);
      if (handle.ready()) {
        template.ready.set(handle.ready());
      }
    }
  });
});

Template.actionsDetailComments.helpers({
  scope () {
    if (Template.instance().scope && Template.instance()._id && Template.instance().roomId && Template.instance().actionId && Template.instance().ready.get()) {
      const collection = nameToCollection(Template.instance().scope);
      return collection.findOne({ _id: new Mongo.ObjectID(Template.instance()._id) });
    }
    return undefined;
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.actionsDetailComments.events({
  'click .action-comment' (event) {
    const self = this;
    event.preventDefault();
    IonActionSheet.show({
      titleText: i18n.__('Actions Comment'),
      buttons: [
        { text: `${i18n.__('edit')} <i class="icon ion-edit"></i>` },
      ],
      destructiveText: i18n.__('delete'),
      cancelText: i18n.__('cancel'),
      cancel() {
        // console.log('Cancelled!');
      },
      buttonClicked(index) {
        if (index === 0) {
          // console.log('Edit!');
          Router.go('commentsActionsEdit', { _id: Router.current().params._id, roomId: Router.current().params.roomId, actionId: Router.current().params.actionId, scope: Router.current().params.scope, commentId: self._id._str });
        }
        return true;
      },
      destructiveButtonClicked() {
        // console.log('Destructive Action!');
        Meteor.call('deleteComment', self._id._str, function() {
          Router.go('actionsDetail', { _id: Router.current().params._id, roomId: Router.current().params.roomId, actionId: Router.current().params.actionId, scope: Router.current().params.scope }, { replaceState: true });
        });
        return true;
      },
    });
  },
  'click .like-comment' (event) {
    Meteor.call('likeScope', this._id._str, 'comments');
    event.preventDefault();
  },
  'click .dislike-comment' (event) {
    Meteor.call('dislikeScope', this._id._str, 'comments');
    event.preventDefault();
  },
});


Template.commentsActionsAdd.onRendered(function () {
  const self = this;
  pageSession.set('error', false);
  pageSession.set('queryMention', false);
  pageSession.set('mentions', false);
  self.$('textarea').atwho({
    at: '@',
    limit: 20,
    delay: 600,
    displayTimeout: 300,
    startWithSpace: true,
    displayTpl(item) {
      return item.avatar ? `<li><img src='${item.avatar}' height='20' width='20'/> ${item.name}</li>` : `<li>${item.name}</li>`;
    },
    insertTpl: '${atwho-at}${slug}',
    searchKey: 'name',
  }).on('matched.atwho', function (event, flag, query) {
    // console.log(event, "matched " + flag + " and the result is " + query);
    if (flag === '@' && query) {
      // console.log(pageSession.get('queryMention'));
      if (pageSession.get('queryMention') !== query) {
        pageSession.set('queryMention', query);
        const querySearch = {};
        querySearch.search = query;
        Meteor.call('searchMemberautocomplete', querySearch, function (error, result) {
          if (!error) {
            const citoyensArray = _.map(result.citoyens, (array, key) => (array.profilThumbImageUrl ? { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'citoyens', avatar: `${Meteor.settings.public.urlimage}${array.profilThumbImageUrl}` } : { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'citoyens' }));
            const organizationsArray = _.map(result.organizations, (array, key) => (array.profilThumbImageUrl ? { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'organizations', avatar: `${Meteor.settings.public.urlimage}${array.profilThumbImageUrl}` } : { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'organizations' }));
            const arrayUnions = _.union(citoyensArray, organizationsArray);
            // console.log(citoyensArray);
            self.$('textarea').atwho('load', '@', arrayUnions).atwho('run');
          }
        });
      }
    }
  })
    .on('inserted.atwho', function (event, $li) {
      // console.log(JSON.stringify($li.data('item-data')));

      if ($li.data('item-data')['atwho-at'] === '@') {
        const mentions = {};
        // const arrayMentions = [];
        mentions.name = $li.data('item-data').name;
        mentions.id = $li.data('item-data').id;
        mentions.type = $li.data('item-data').type;
        mentions.avatar = $li.data('item-data').avatar;
        mentions.value = ($li.data('item-data').slug ? $li.data('item-data').slug : $li.data('item-data').name);
        mentions.slug = ($li.data('item-data').slug ? $li.data('item-data').slug : null);
        if (pageSession.get('mentions')) {
          const arrayMentions = pageSession.get('mentions');
          arrayMentions.push(mentions);
          pageSession.set('mentions', arrayMentions);
        } else {
          pageSession.set('mentions', [mentions]);
        }
      }
    });
});

Template.commentsActionsAdd.onDestroyed(function () {
  this.$('textarea').atwho('destroy');
});


Template.commentsActionsAdd.onCreated(function () {
  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    pageSession.set('roomId', Router.current().params.roomId);
    pageSession.set('actionId', Router.current().params.actionId);
  });

  pageSession.set('error', false);
});

Template.commentsActionsAdd.onRendered(function () {
  pageSession.set('error', false);
});

Template.commentsActionsAdd.helpers({
  error () {
    return pageSession.get('error');
  },
});

Template.commentsActionsEdit.onCreated(function () {
  const self = this;
  self.ready = new ReactiveVar();
  pageSession.set('error', false);

  this.autorun(function() {
    pageSession.set('scopeId', Router.current().params._id);
    pageSession.set('scope', Router.current().params.scope);
    pageSession.set('roomId', Router.current().params.roomId);
    pageSession.set('actionId', Router.current().params.actionId);
  });

  self.autorun(function() {
    // const handle = singleSubs.subscribe('detailActions', Router.current().params.scope, Router.current().params._id, Router.current().params.roomId, Router.current().params.actionId);
    const handle = Meteor.subscribe('actionsDetailComments', Router.current().params.scope, Router.current().params._id, Router.current().params.roomId, Router.current().params.actionId);
    if (handle.ready()) {
      self.ready.set(handle.ready());
    }
  });
});

Template.commentsActionsEdit.onRendered(function () {
  const self = this;
  self.$('textarea').atwho({
    at: '@',
    limit: 20,
    delay: 600,
    displayTimeout: 300,
    startWithSpace: true,
    displayTpl(item) {
      return item.avatar ? `<li><img src='${item.avatar}' height='20' width='20'/> ${item.name}</li>` : `<li>${item.name}</li>`;
    },
    insertTpl: '${atwho-at}${slug}',
    searchKey: 'name',
  }).on('matched.atwho', function (event, flag, query) {
    // console.log(event, "matched " + flag + " and the result is " + query);
    if (flag === '@' && query) {
      // console.log(pageSession.get('queryMention'));
      if (pageSession.get('queryMention') !== query) {
        pageSession.set('queryMention', query);
        const querySearch = {};
        querySearch.search = query;
        Meteor.call('searchMemberautocomplete', querySearch, function (error, result) {
          if (!error) {
            const citoyensArray = _.map(result.citoyens, (array, key) => (array.profilThumbImageUrl ? { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'citoyens', avatar: `${Meteor.settings.public.urlimage}${array.profilThumbImageUrl}` } : { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'citoyens' }));
            const organizationsArray = _.map(result.organizations, (array, key) => (array.profilThumbImageUrl ? { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'organizations', avatar: `${Meteor.settings.public.urlimage}${array.profilThumbImageUrl}` } : { id: key, name: array.name, slug: (array.slug ? array.slug : array.name), type: 'organizations' }));
            const arrayUnions = _.union(citoyensArray, organizationsArray);
            // console.log(citoyensArray);
            self.$('textarea').atwho('load', '@', arrayUnions).atwho('run');
          }
        });
      }
    }
  })
    .on('inserted.atwho', function (event, $li) {
      // console.log(JSON.stringify($li.data('item-data')));

      if ($li.data('item-data')['atwho-at'] === '@') {
        const mentions = {};
        // const arrayMentions = [];
        mentions.name = $li.data('item-data').name;
        mentions.id = $li.data('item-data').id;
        mentions.type = $li.data('item-data').type;
        mentions.avatar = $li.data('item-data').avatar;
        mentions.value = ($li.data('item-data').slug ? $li.data('item-data').slug : $li.data('item-data').name);
        mentions.slug = ($li.data('item-data').slug ? $li.data('item-data').slug : null);
        if (pageSession.get('mentions')) {
          const arrayMentions = pageSession.get('mentions');
          arrayMentions.push(mentions);
          pageSession.set('mentions', arrayMentions);
        } else {
          pageSession.set('mentions', [mentions]);
        }
      }
    });
});


Template.commentsActionsEdit.onDestroyed(function () {
  this.$('textarea').atwho('destroy');
});


Template.commentsActionsEdit.helpers({
  comment () {
    const comment = Comments.findOne({ _id: new Mongo.ObjectID(Router.current().params.commentId) });
    comment._id = comment._id._str;
    return comment;
  },
  error () {
    return pageSession.get('error');
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

AutoForm.addHooks(['addActionsComment', 'editActionsComment'], {
  before: {
    method(doc) {
      const actionId = pageSession.get('actionId');
      doc.contextType = 'actions';
      doc.contextId = actionId;
      if (pageSession.get('mentions')) {
        const arrayMentions = Array.from(pageSession.get('mentions').reduce((m, t) => m.set(t.value, t), new Map()).values()).filter(array => doc.text.match(`@${array.value}`) !== null);
        doc.mentions = arrayMentions;
      }
      return doc;
    },
    'method-update'(modifier) {
      const actionId = pageSession.get('actionId');
      modifier.$set.contextType = 'actions';
      modifier.$set.contextId = actionId;
      if (pageSession.get('mentions')) {
        const arrayMentions = Array.from(pageSession.get('mentions').reduce((m, t) => m.set(t.value, t), new Map()).values()).filter(array => modifier.$set.text.match(`@${array.value}`) !== null);
        modifier.$set.mentions = arrayMentions;
      }
      return modifier;
    },
  },
  onError(formType, error) {
    if (error.errorType && error.errorType === 'Meteor.Error') {
      if (error && error.error === 'error_call') {
        pageSession.set('error', error.reason.replace(':', ' '));
      }
    }
  },
});

AutoForm.addHooks(['editActionsComment'], {
  after: {
    'method-update'(error) {
      if (!error) {
        Router.go('actionsDetailComments', { _id: pageSession.get('scopeId'), scope: pageSession.get('scope'), roomId: pageSession.get('roomId'), actionId: pageSession.get('actionId') }, { replaceState: true });
      }
    },
  },
});
