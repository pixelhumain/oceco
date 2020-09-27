/* eslint-disable meteor/no-session */
/* global Template Session Blaze $ _ Slip */
Template.ionList.helpers({
  classes () {
    const classes = ['list'];

    if (this.class) {
      const customClasses = this.class.split(' ');
      _(customClasses).each(function (customClass) {
        classes.push(customClass);
      });
    }

    return classes.join(' ');
  },
});

Template.ionList.onRendered(function () {
  if (this.data && this.data.ionSortable) {
    Session.set('ionSortable', true);
    const list = this.$('.list')[0];
    // eslint-disable-next-line no-new
    new Slip(list);
  }
});


Template.ionList.events({
  'click .item-delete'(event, instance) {
    event.preventDefault();

    const target = $(event.target).closest('.item').get(0);
    const targetData = Blaze.getData(target.getElementsByClassName('item-content')[0])._id || undefined;

    instance.data.ionSortable.find({}).forEach(function(item, i) {
      if (item._id === targetData) {
        instance.data.ionSortable._collection.remove({
          _id: item._id,
        }, function(error, result) { });
      }
    });
  },
  'slip:swipe .list, slip:beforeswipe .list, slip:beforewait .list, slip:afterswipe .list'(event) {
    event.preventDefault();
  },
  'slip:beforereorder .list'(event) {
    if (event.originalEvent.target.className.indexOf('instant') === -1) {
      event.preventDefault();
    }
  },
  'slip:reorder .list'(event, instance) {
    const spliceIndex = event.originalEvent.detail.spliceIndex;
    const originalIndex = event.originalEvent.detail.originalIndex;

    if (spliceIndex !== originalIndex) {
      instance.data.ionSortable.find({}, {
        sort: {
          order: 1,
        },
      }).forEach(function(item, i) {
        instance.data.ionSortable._collection.pauseObservers();
        if (item._id === Blaze.getData(event.target.getElementsByClassName('item-content')[0])._id) {
          instance.data.ionSortable.update({
            _id: item._id,
          }, {
            $set: {
              order: spliceIndex,
            },
          });
        } else {
          let newOrder;
          if (spliceIndex > originalIndex) {
            newOrder = ((spliceIndex >= i) && (originalIndex < i)) ? (i - 1) : i;
          } else if (spliceIndex === '0') {
            newOrder = (originalIndex > i) ? (i + 1) : i;
          } else {
            newOrder = ((spliceIndex <= i) && (originalIndex > i)) ? (i + 1) : i;
          }

          instance.data.ionSortable.update({
            _id: item._id,
          }, {
            $set: {
              order: newOrder,
            },
          });
        }
        instance.data.ionSortable._collection.resumeObservers();
      });
    }
  },

});
