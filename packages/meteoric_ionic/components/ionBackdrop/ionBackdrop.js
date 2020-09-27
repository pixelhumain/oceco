/* eslint-disable no-undef */
/* global Template Blaze Meteor $ */
IonBackdrop = {
  holds: 0,
  retain () {
    // eslint-disable-next-line no-plusplus
    this.holds++;

    if (this.holds === 1) {
      this.template = Template.ionBackdrop;
      this.view = Blaze.renderWithData(this.template, {}, $('.ionic-body').get(0));

      const $backdropEl = $(this.view.firstNode());
      $backdropEl.addClass('visible');

      Meteor.setTimeout(function () {
        $backdropEl.addClass('active');
      }, 10);
    }
  },

  release () {
    // eslint-disable-next-line no-plusplus
    this.holds--;

    if (this.holds === 0) {
      const $backdropEl = $(this.view.firstNode());
      $backdropEl.removeClass('active');

      Meteor.setTimeout(function () {
        $backdropEl.removeClass('visible');
        Blaze.remove(this.view);
      }.bind(this), 400);
    }
  },
};
