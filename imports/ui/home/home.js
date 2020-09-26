/* eslint-disable consistent-return */
/* eslint-disable meteor/no-session */
/* global Session $ _ */
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';

import './home.html';

// collection
import { Organizations } from '../../api/organizations.js';
import { Projects } from '../../api/projects.js';

import { searchAction } from '../../api/client/reactive.js';
import { compareValues, searchQuerySort, searchQuerySortActived, applyDiacritics } from '../../api/helpers.js';
import { Citoyens } from '../../api/citoyens';

window.Organizations = Organizations;
window.Projects = Projects;

Template.homeView.onCreated(function () {
  // searchAction.set('search', null);
});

Template.homeView.helpers({
  scope() {
    return Organizations.findOne({
      _id: new Mongo.ObjectID(Session.get('orgaCibleId')),
    });
  },
  RaffineriePoles() {
    if (Session.get('settingOceco').pole === true) {
      const id = new Mongo.ObjectID(Session.get('orgaCibleId'));
      const raffinerieCursor = Organizations.findOne({ _id: id });
      if (raffinerieCursor) {
        const raffinerieArray = raffinerieCursor.listProjectsCreator();
        const raffinerieTags = raffinerieArray ? raffinerieArray.map(tag => tag.tags && tag.tags[0]).filter(tag => typeof tag !== 'undefined') : null;
        const uniqueRaffinerieTags = raffinerieTags ? Array.from(new Set(raffinerieTags)) : null;
        return uniqueRaffinerieTags || {};
      }
    } else {
      const id = new Mongo.ObjectID(Session.get('orgaCibleId'));
      const raffinerieCursor = Organizations.findOne({ _id: id });
      return raffinerieCursor.listProjectsCreator();
    }
  },
  search() {
    return searchAction.get('search');
  },
});

Template.projectsView.onCreated(function () {
  this.ready = new ReactiveVar(false);
  this.autorun(function () {
    const handle = this.subscribe('all.actions2', Session.get('orgaCibleId'));
    const handleAvatar = this.subscribe('all.avatarOne', Session.get('orgaCibleId'));
    const handleEvents = this.subscribe('poles.events', Session.get('orgaCibleId'));
    if (handle.ready() && handleEvents.ready() && handleAvatar.ready()) {
      this.ready.set(handle.ready());
    }
  }.bind(this));
});

Template.projectsView.helpers({
  poleProjects2() {
    const search = searchAction.get('search');
    const searchSort = searchAction.get('searchSort');

    const queryProjectId = `parent.${Session.get('orgaCibleId')}`;
    const query = {};
    const options = {};
    query[queryProjectId] = { $exists: 1 };
    if (search && search.charAt(0) === ':' && search.length > 1) {
      query.name = { $regex: `.*${search.substr(1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*`, $options: 'i' };
    }
    if (searchSort) {
      const arraySort = searchQuerySort('projects', searchSort);
      if (arraySort) {
        // options.sort = { ...arraySort };
        options.sort = arraySort;
      }
    }
    return Projects.find(query, options);
  },
  dataReady() {
    return Template.instance().ready.get();
  },
});

Template.searchActions.onRendered(function () {
  const wrap = $('.content.overflow-scroll');
  wrap.on('scroll', function (e) {
    if (this.scrollTop > 147) {
      wrap.addClass('fix-search');
    } else {
      wrap.removeClass('fix-search');
    }
  });
});


Template.searchActions.helpers({
  search() {
    const search = searchAction.get('search');
    if (Router.current().route.getName() === 'actionsList') {
      if (search && search.charAt(0) === ':') {
        searchAction.set('search', null);
      }
    }
    return searchAction.get('search');
  },
  searchTag() {
    return searchAction.get('searchTag');
  },
  searchUser() {
    return searchAction.get('searchUser');
  },
  searchHelp() {
    return searchAction.get('searchHelp');
  },
  sortActived() {
    if (searchAction.get('searchSort')) {
      if (Router.current().route.getName() === 'actionsList') {
        const actionArray = searchAction.get('searchSort');
        const searchPick = { actions: [...actionArray.actions] };
        return searchQuerySortActived(searchPick);
      }
      return searchQuerySortActived(searchAction.get('searchSort'));
    }
    return false;
  },
  allTags() {
    const orgaOne = Organizations.findOne({ _id: new Mongo.ObjectID(Session.get('orgaCibleId')) });
    if (!orgaOne) {
      return null;
    }
    const searchTag = searchAction.get('searchTag');
    const arrayAll = orgaOne.actionsAll().map(action => action.tags).filter(Boolean);
    const mergeDedupe = arr => [...new Set([].concat(...arr))];
    const arrayAllMerge = mergeDedupe(arrayAll);

    return searchTag && searchTag.length > 1 ? arrayAllMerge.filter(item => item.includes(searchTag.substr(1))) : arrayAllMerge;
  },
  allUsers() {
    const search = searchAction.get('search');
    if (search && search.charAt(0) === '@' && search.length > 1) {
      const searchApplyDiacritics = applyDiacritics(search.substr(1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'regex');
      const query = {};
      query.$or = [];
      const queryName = {};
      const queryUsername = {};
      queryName.name = { $regex: `.*${searchApplyDiacritics}.*`, $options: 'i' };
      queryUsername.username = { $regex: `.*${search.substr(1)}.*`, $options: 'i' };
      query.$or.push(queryName);
      query.$or.push(queryUsername);
      return Citoyens.find(query);
    }
    return Citoyens.find();
  },
});

Template.searchActions.events({
  'click .searchtag-js'(event) {
    event.preventDefault();
    if (this) {
      searchAction.set('search', `#${this}`);
    } else {
      searchAction.set('search', null);
    }
  },
  'click .searchuser-js'(event) {
    event.preventDefault();
    if (this) {
      searchAction.set('search', `@${this.username}`);
    } else {
      searchAction.set('search', null);
    }
  },
  'click .searchfilter-js'(event) {
    event.preventDefault();
    const filter = $(event.currentTarget).data('action');
    if (filter) {
      searchAction.set('search', filter);
      searchAction.set('searchHelp', null);
    } else {
      searchAction.set('search', null);
    }
  },
  'keyup #search, change #search': _.debounce((event) => {
    if (event.currentTarget.value.length > 0) {
      // console.log(event.currentTarget.value);

      if (event.currentTarget.value.charAt(0) === '#') {
        searchAction.set('searchTag', event.currentTarget.value);
      } else {
        searchAction.set('searchTag', null);
      }

      if (event.currentTarget.value.length === 1 && event.currentTarget.value.charAt(0) === '?') {
        searchAction.set('searchHelp', true);
      } else {
        searchAction.set('searchHelp', null);
      }

      if (event.currentTarget.value.length > 0 && event.currentTarget.value.charAt(0) === '@') {
        searchAction.set('searchUser', true);
      } else {
        searchAction.set('searchUser', null);
      }

      searchAction.set('search', event.currentTarget.value);
      searchAction.set('actionName', event.currentTarget.value);
    } else {
      searchAction.set('search', null);
      searchAction.set('searchTag', null);
      searchAction.set('searchHelp', null);
      searchAction.set('actionName', null);
      searchAction.set('searchUser', null);
    }
  }, 500),
  // Pressing Ctrl+Enter should submit action
  'keydown #search'(event) {
    if (event.keyCode === 13 && (event.metaKey || event.ctrlKey)) {
      // savoir si je suis dans le detail d'un element
      // récupérer les valeurs utiles pour soit publier
      // soit rediriger vers le form action avce le name préremplie
      if (event.currentTarget.value.length > 0) {
        if (Router.current().route.getName() === 'actionsList') {
          if (Template.currentData().isAdmin()) {
            searchAction.set('actionName', event.currentTarget.value);
            Router.go('actionsAdd', { _id: Router.current().params._id, scope: Router.current().params.scope });
          }
        }
      }
    }
  },
});

Template.searchSort.helpers({
  isHome() {
    return Router.current().route.getName() === 'home';
  },
  searchSort() {
    if (searchAction.get('searchSort')) {
      return searchAction.get('searchSort');
    }
    const sortDefault = {
      projects: [
        { label: 'nom', type: 'projects', field: 'name', existField: true, checked: false, fieldDesc: false },
        { label: 'date d\'activités', type: 'projects', field: 'modified', existField: true, checked: false, fieldDesc: false },
        { label: 'date de début', type: 'projects', field: 'startDate', existField: true, checked: false, fieldDesc: false },
        { label: 'date de fin', type: 'projects', field: 'endDate', existField: true, checked: false, fieldDesc: false },
      ],
      events: [
        { label: 'nom', type: 'events', field: 'name', existField: true, checked: false, fieldDesc: false },
        { label: 'date d\'activités', type: 'events', field: 'modified', existField: true, checked: false, fieldDesc: false },
        { label: 'date de début', type: 'events', field: 'startDate', existField: true, checked: false, fieldDesc: false },
        { label: 'date de fin', type: 'events', field: 'endDate', existField: true, checked: false, fieldDesc: false },
      ],
      actions: [
        { label: 'nom', type: 'actions', field: 'name', existField: true, checked: false, fieldDesc: false },
        { label: 'date d\'activités', type: 'actions', field: 'modified', existField: true, checked: false, fieldDesc: false },
        { label: 'date de création', type: 'actions', field: 'created', existField: true, checked: false, fieldDesc: false },
        { label: 'date de début', type: 'actions', field: 'startDate', existField: true, checked: false, fieldDesc: false },
        { label: 'date de fin', type: 'actions', field: 'endDate', existField: true, checked: false, fieldDesc: false },
        { label: 'contributeur', type: 'actions', field: 'links.contributors', existField: true, checked: false, fieldDesc: false },
        { label: 'commentaire', type: 'actions', field: 'commentCount', existField: true, checked: false, fieldDesc: false },
        { label: 'crédits', type: 'actions', field: 'credits', existField: true, checked: false, fieldDesc: false },
      ],
    };
    searchAction.set('searchSort', sortDefault);
    return searchAction.get('searchSort');
  },
  orderType(type) {
    if (type) {
      const sort = searchAction.get('searchSort');
      return sort && sort[type] ? [...sort[type]].filter(item => item.checked === true).sort(compareValues('order')) : [];
    }
  },
});

Template.searchSortItemToggle.events({
  'click .sort-checked-js'(event) {
    const self = this;
    if (this.type) {
      const sort = searchAction.get('searchSort');
      const arrayOrder = sort[this.type].filter(item => item.checked === true);
      const countOrder = arrayOrder && arrayOrder.length > 0 ? arrayOrder.length : 0;
      sort[this.type] = sort[this.type].map((item) => {
        if (item.field === self.field) {
          item.checked = event.currentTarget.checked;
          if (event.currentTarget.checked) {
            item.order = countOrder + 1;
          } else {
            delete item.order;
          }
          return item;
        }
        return item;
      });
      searchAction.set('searchSort', sort);
    }
  },
  'click .sort-desc-js'(event) {
    const self = this;
    if (this.type) {
      const sort = searchAction.get('searchSort');
      sort[this.type] = sort[this.type].map((item) => {
        if (item.field === self.field) {
          item.fieldDesc = event.currentTarget.checked;
          return item;
        }
        return item;
      });
      searchAction.set('searchSort', sort);
    }
  },
});
