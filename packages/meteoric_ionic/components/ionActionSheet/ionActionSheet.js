/* global Template Blaze Meteor $ */
/* global IonActionSheet */
// eslint-disable-next-line no-global-assign
IonActionSheet = {
  transitionEndEvent: 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd',

  show (options) {
    this.template = Template.ionActionSheet;

    const buttons = [];
    for (let i = 0; i < options.buttons.length; i++) {
      const button = options.buttons[i];
      buttons.push({
        text: button.text,
        index: i,
      });
    }

    const data = {
      titleText: options.titleText,
      destructiveText: options.destructiveText,
      cancelText: options.cancelText,
      buttons,
    };

    this.callbacks = {
      cancel: options.cancel,
      destructiveButtonClicked: options.destructiveButtonClicked,
      buttonClicked: options.buttonClicked,
    };

    this.view = Blaze.renderWithData(this.template, data, $('.ionic-body').get(0));
    $('body').addClass('action-sheet-open');

    const $backdrop = $(this.view.firstNode());
    $backdrop.addClass('active');

    const $wrapper = $backdrop.find('.action-sheet-wrapper');
    Meteor.setTimeout(function () {
      $wrapper.addClass('action-sheet-up');
    }, 20);
  },

  cancel () {
    this.close(this.callbacks.cancel);
  },

  buttonClicked (index) {
    const callback = this.callbacks.buttonClicked;
    if (callback(index) === true) {
      IonActionSheet.close();
    }
  },

  destructiveButtonClicked () {
    const callback = this.callbacks.destructiveButtonClicked;
    if (callback() === true) {
      IonActionSheet.close();
    }
  },

  close (callback) {
    const $backdrop = $(this.view.firstNode());
    $backdrop.removeClass('active');

    const $wrapper = $backdrop.find('.action-sheet-wrapper');
    Meteor.setTimeout(function() {
      $wrapper.removeClass('action-sheet-up');
    }, 10);

    $wrapper.on(this.transitionEndEvent, function () {
      $('body').removeClass('action-sheet-open');
      Blaze.remove(this.view);

      if (typeof (callback) === 'function') {
        callback();
      }
    }.bind(this));
  },
};

Template.ionActionSheet.onRendered(function () {
  $(window).on('keyup.ionActionSheet', function (event) {
    // eslint-disable-next-line eqeqeq
    if (event.which == 27) {
      IonActionSheet.cancel();
    }
  });
});

Template.ionActionSheet.onDestroyed(function () {
  $(window).off('keyup.ionActionSheet');
});

Template.ionActionSheet.events({
  // Handle clicking the backdrop
  click (event) {
    if ($(event.target).hasClass('action-sheet-backdrop')) {
      IonActionSheet.cancel();
    }
  },

  'click [data-index]' (event) {
    const index = $(event.target).data('index');
    IonActionSheet.buttonClicked(index);
  },

  'click [data-destructive]' () {
    IonActionSheet.destructiveButtonClicked();
  },

  'click [data-cancel]' () {
    IonActionSheet.cancel();
  },

});
