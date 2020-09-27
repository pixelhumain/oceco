/* global Template Blaze $ */
/* global IonPopup */
// eslint-disable-next-line no-global-assign
IonPopup = {
  show (options) {
    this.template = Template.ionPopup;
    this.buttons = [];

    for (let i = 0; i < options.buttons.length; i++) {
      const button = options.buttons[i];
      this.buttons.push({
        text: button.text,
        type: button.type,
        index: i,
        onTap: button.onTap,
      });
    }

    // Figure out if a template or just a html string was passed
    let innerTemplate = '';
    if (options.templateName) {
      innerTemplate = Template[options.templateName].renderFunction().value;
    } else if (options.template) {
      innerTemplate = `<span>${options.template}</span>`;
    }

    const data = {
      title: options.title,
      subTitle: options.subTitle,
      buttons: this.buttons,
      template: innerTemplate,
    };

    this.view = Blaze.renderWithData(this.template, data, $('.ionic-body').get(0));
    $('body').addClass('popup-open');

    const $backdrop = $(this.view.firstNode());
    $backdrop.addClass('visible active');
    const $popup = $backdrop.find('.popup-container');
    $popup.addClass('popup-showing active');
  },

  alert (options) {
    IonPopup.show({
      title: options.title,
      subTitle: options.subTitle,
      template: options.template,
      templateName: options.templateName,
      buttons: [
        {
          text: options.okText ? options.okText : 'Ok',
          type: options.okType ? options.okType : 'button-positive',
          onTap(event, template) {
            if (options.onOk) options.onOk(event, template);
            return true;
          },
        },
      ],
    });
  },

  confirm (options) {
    IonPopup.show({
      title: options.title,
      subTitle: options.subTitle,
      template: options.template,
      templateName: options.templateName,
      buttons: [
        {
          text: options.cancelText ? options.cancelText : 'Cancel',
          type: options.cancelType ? options.cancelType : 'button-default',
          onTap (event, template) {
            if (options.onCancel) options.onCancel(event, template);
            return true;
          },
        },
        {
          text: options.okText ? options.okText : 'Ok',
          type: options.okType ? options.okType : 'button-positive',
          onTap (event, template) {
            if (options.onOk) options.onOk(event, template);
            return true;
          },
        },
      ],
    });
  },

  prompt (options) {
    let template = '';
    if (options.templateName) {
      template = Template[options.templateName].renderFunction().value;
    } else if (options.template) {
      template = `<span class="popup-prompt-text">${options.template}</span>`;
    }

    options.inputType = options.inputType || 'text';
    options.inputPlaceholder = options.inputPlaceholder || '';
    template += `<input type="${options.inputType}" placeholder="${
      options.inputPlaceholder}" name="prompt" >`;

    IonPopup.show({
      title: options.title,
      subTitle: options.subTitle,
      template,
      buttons: [
        {
          text: options.cancelText ? options.cancelText : 'Cancel',
          type: options.cancelType ? options.cancelType : 'button-default',
          onTap (event, templatePop) {
            if (options.onCancel) options.onCancel(event, templatePop);
            return true;
          },
        },
        {
          text: options.okText ? options.okText : 'Ok',
          type: options.okType ? options.okType : 'button-positive',
          onTap (event, templatePop) {
            const inputVal = $(templatePop.firstNode).find('[name=prompt]').val();
            if (options.onOk) options.onOk(event, inputVal);
            return true;
          },
        },
      ],
    });
  },

  close () {
    // eslint-disable-next-line no-underscore-dangle
    const $popup = this._domrange ? $(this.view.firstNode()).find('.popup-container') : $('.popup-container');
    $popup.addClass('popup-hidden').removeClass('active');

    setTimeout(function () {
      $('body').removeClass('popup-open');
      $('.backdrop').remove();
      Blaze.remove(this.view);
    }.bind(this), 100);
  },

  buttonClicked (index, event, template) {
    const callback = this.buttons[index].onTap;
    if (callback) {
      if (callback(event, template) === true) {
        IonPopup.close();
      }
    }
  },
};

Template.ionPopup.onRendered(function () {
  $(window).on('keyup.ionPopup', function (event) {
    if (event.which === 27) {
      IonPopup.close();
    }
  });
});

Template.ionPopup.onDestroyed(function () {
  $(window).off('keyup.ionPopup');
});

Template.ionPopup.events({
  // Handle clicking the backdrop
  click (event) {
    if ($(event.target).hasClass('popup-container')) {
      IonPopup.close();
    }
  },

  'click [data-index]' (event, instance) {
    const index = $(event.target).data('index');
    IonPopup.buttonClicked(index, event, instance);
  },

});

Template.ionPopup.helpers({
  hasHead() {
    return this.title || this.subTitle;
  },
});
