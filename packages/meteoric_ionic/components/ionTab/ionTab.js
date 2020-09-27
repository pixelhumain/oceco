/* eslint-disable meteor/no-session */
/* global Template Session Router */
/* global IonNavigation */
Template.ionTab.events({
  click (event, instance) {
    if (instance.data.path) {
      Session.set('ionTab.current', instance.data.path);
    }

    // If the tab's content is being rendered inside of a ionNavView
    // we don't want to slide it in when switching tabs
    IonNavigation.skipTransitions = true;
  },
});

Template.ionTab.helpers({
  classes () {
    const classes = ['tab-item'];
    if (this.class) {
      classes.push(this.class);
    }
    if (this.badgeNumber) {
      classes.push('has-badge');
    }
    return classes.join(' ');
  },

  url () {
    if (this.href) {
      return this.href;
    }

    if (this.path && Router.routes[this.path]) {
      return Router.routes[this.path].path(Template.currentData());
    }
  },

  isActive () {
    const ionTabCurrent = Session.get('ionTab.current');

    if (this.path && this.path === ionTabCurrent) {
      return 'active';
    }

    // The initial case where there is no localStorage value and
    // no session variable has been set, this attempts to set the correct tab
    // to active based on the router
    const route = Router.routes[this.path];
    if (route && route.path(Template.currentData()) === ionTabCurrent) {
      return 'active';
    }
  },

  activeIcon () {
    if (this.iconOn) {
      return this.iconOn;
    }
    return this.icon;
  },

  defaultIcon () {
    if (this.iconOff) {
      return this.iconOff;
    }
    return this.icon;
  },

  badgeNumber () {
    return this.badgeNumber;
  },

  badgeColor () {
    return this.badgeColor || 'assertive';
  },
});
