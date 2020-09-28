/* eslint-disable meteor/no-session */
/* global Template Meteor Session $ */
/* global IonNavigation Platform */

// eslint-disable-next-line no-global-assign
IonNavigation = {
  skipTransitions: false,
};

Template.ionNavView.onCreated(function () {
  this.data = this.data || {};
  Session.setDefault('ionNavDirection', 'forward');

  if (Platform.isAndroid()) {
    this.transition = 'android';
  } else {
    this.transition = 'ios';
  }

  // Allow overriding the transition
  if (this.data && this.data.transition) {
    this.transition = this.data.transition;
  }

  if (this.transition === 'ios') {
    this.transitionDuration = 450;
  } else {
    this.transitionDuration = 320;
  }
});


Template.ionNavView.onRendered(function () {
  const template = this;
  const container = this.find('[data-nav-container]');

  // eslint-disable-next-line no-underscore-dangle
  container._uihooks = {
    insertElement(node, next) {
      const $node = $(node);
      if (!template.transition || !$node.hasClass('view') || IonNavigation.skipTransitions) {
        container.insertBefore(node, next);
        return;
      }

      $node.addClass('nav-view-entering nav-view-stage');
      container.insertBefore(node, next);
      Meteor.defer(function () {
        $node.removeClass('nav-view-stage').addClass('nav-view-active');
      });

      Meteor.setTimeout(function () {
        $(this).removeClass('nav-view-entering');
        $('[data-nav-container]').removeClass('nav-view-direction-back').addClass('nav-view-direction-forward');
      }, template.transitionDuration);
    },

    removeElement(node) {
      const $node = $(node);
      if (!template.transition || !$node.hasClass('view') || IonNavigation.skipTransitions) {
        $node.remove();
        return;
      }

      $node.addClass('nav-view-leaving nav-view-stage');
      Meteor.defer(function () {
        $node.removeClass('nav-view-stage').addClass('nav-view-active');
      });

      Meteor.setTimeout(function () {
        $node.remove();
        Session.set('ionNavDirection', 'forward');
      }, template.transitionDuration);
    },
  };
});

Template.ionNavView.helpers({
  transition () {
    return Template.instance().transition;
  },
});
