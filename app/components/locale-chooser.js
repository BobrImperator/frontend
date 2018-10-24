import Component from '@ember/component';
import { schedule } from '@ember/runloop';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  intl: service(),
  moment: service(),
  classNameBindings: [':locale-chooser', 'isOpen'],
  isOpen: false,
  ariaRole: 'menubar',
  'data-test-locale-chooser': true,

  locale: computed('locales.[]', 'intl.locale', function () {
    const locale = this.get('intl.locale');
    return this.locales.findBy('id', locale);
  }),

  locales: computed('intl.locales.[]', function() {
    return this.get('intl.locales').uniq().map(locale => {
      return { id: locale, text: this.get('intl').t('general.language.' + locale) };
    });
  }),

  actions: {
    toggleMenu() {
      const isOpen = this.get('isOpen');
      if (isOpen) {
        this.set('isOpen', false);
      } else {
        this.openMenuAndSelectTheCurrentLocale();
      }
    },
    changeLocale(id) {
      this.set('isOpen', false);
      this.get('intl').set('locale', id);
      this.get('moment').setLocale(id);
      window.document.querySelector('html').setAttribute('lang', id);
    }
  },

  openMenuAndSelectTheCurrentLocale() {
    this.set('isOpen', true);
    schedule('afterRender', () => {
      this.element.querySelector(`.menu button[lang="${this.locale.id}"]`).focus();
    });
  },

  keyDown({ originalEvent }) {
    switch (originalEvent.key) {
    case 'ArrowDown':
      if (originalEvent.target.dataset.level === 'toggle') {
        this.openMenuAndSelectTheCurrentLocale();
      } else {
        if (originalEvent.target.nextElementSibling) {
          originalEvent.target.nextElementSibling.focus();
        } else {
          schedule('afterRender', () => {
            this.element.querySelector('.menu button:nth-of-type(1)').focus();
          });
        }
      }
      break;
    case 'ArrowUp':
      if (originalEvent.target.previousElementSibling) {
        originalEvent.target.previousElementSibling.focus();
      } else {
        this.element.querySelector('.menu button:last-of-type').focus();
      }
      break;
    case 'Escape':
    case 'Tab':
    case 'ArrowRight':
    case 'ArrowLeft':
      this.set('isOpen', false);
      break;
    }

    return true;
  }
});
