/* eslint-disable no-underscore-dangle */
/* eslint-disable meteor/no-session */
/* global Template Session Blaze Router Spacebars _ */
Template.ionItem.helpers({
  idAttribute () {
    if (this.id) {
      return this.id;
    }
  },
  itemClasses () {
    const classes = ['item'];

    if (this.class) {
      const customClasses = this.class.split(' ');
      _(customClasses).each(function (customClass) {
        classes.push(customClass);
      });
    }

    if (this.avatar) {
      classes.push(`item-avatar${this.avatar === 'right' ? '-right' : ''}`);
    }

    if (this.iconLeft) {
      classes.push('item-icon-left');
    }

    if (this.iconRight) {
      classes.push('item-icon-right');
    }

    if (this.buttonLeft) {
      classes.push('item-button-left');
    }

    if (Session.get('ionSortable')) {
      classes.push('item-complex', 'item-left-editable');
    }

    if (this.buttonRight) {
      classes.push('item-button-right');
    }

    if (this.textWrap) {
      classes.push('item-text-wrap');
    }

    return classes.join(' ');
  },

  isAnchor () {
    return _.some([this.href, this.path, this.url, this.route], function(path) { return path !== undefined; });
  },

  target () {
    return this.target;
  },

  url () {
    if (this.href) {
      return this.href;
    }

    if (this.path || this.url || this.route) {
      const path = _.find([this.path, this.url, this.route], function (pathParam) { return pathParam !== undefined; });

      if (this.query || this.hash || this.data) {
        const hash = {};
        hash.route = path;
        hash.query = this.query;
        hash.hash = this.hash;
        hash.data = this.data;
        // eslint-disable-next-line new-cap
        const options = new Spacebars.kw(hash);

        // Devs may pass 'route=x' instead of 'path=' or 'url='
        // Should doing that throw an error? Not sure but we decided to
        // parse it as if the dev passed it as 'path='
        if (this.url) {
          return Blaze._globalHelpers.urlFor(options);
        } else if (this.path || this.route) {
          return Blaze._globalHelpers.pathFor(options);
        }
      } else {
        return Router.routes[path].path(Template.parentData(1));
      }
    }
  },
});
