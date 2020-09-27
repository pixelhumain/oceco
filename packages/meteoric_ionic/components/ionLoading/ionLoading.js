/* global Template Meteor Blaze _ $ */
// eslint-disable-next-line no-unused-vars
/* global IonLoading IonBackdrop */
// eslint-disable-next-line no-global-assign
IonLoading = {
  show (userOptions) {
    const options = _.extend({
      delay: 0,
      duration: null,
      customTemplate: null,
      backdrop: false,
    }, userOptions || {});

    if (options.backdrop) {
      IonBackdrop.retain();
      $('.backdrop').addClass('backdrop-loading');
    }

    Meteor.setTimeout(function () {
      this.template = Template.ionLoading;
      this.view = Blaze.renderWithData(this.template, { template: options.customTemplate }, $('.ionic-body').get(0));

      const $loadingEl = $(this.view.firstNode());
      $loadingEl.addClass('visible');

      Meteor.setTimeout(function () {
        $loadingEl.addClass('active');
      }, 10);
    }.bind(this), options.delay);

    if (options.duration) {
      Meteor.setTimeout(function () {
        this.hide();
      }.bind(this), options.duration);
    }
  },

  hide () {
    if (this.view) {
      const $loadingEl = $(this.view.firstNode());
      $loadingEl.removeClass('active');

      Meteor.defer(function () {
        IonBackdrop.release();
        $loadingEl.removeClass('visible');
        Blaze.remove(this.view);
        this.view = null;
      }.bind(this));
    }
    Meteor.defer(function () {
      $('.loading-container').remove();
    });
  },
};
