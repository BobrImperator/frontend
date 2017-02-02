import Ember from 'ember';

const { Component, computed, inject, RSVP, ObjectProxy } = Ember;
const { service } = inject;
const { not, alias } = computed;
const { hash, map, Promise } = RSVP;

const SessionProxy = ObjectProxy.extend({
  content: null,
  currentUser: null,
  expandOfferings: false,
  showRemoveConfirmation: false,
  userCanDelete: computed('content.course', 'currentUser.model.directedCourses.[]', function(){
    return new Promise(resolve => {
      this.get('currentUser.userIsDeveloper').then(isDeveloper => {
        if(isDeveloper){
          resolve(true);
        } else {
          this.get('content').get('course').then(course => {
            this.get('currentUser.model').then(user => {
              user.get('directedCourses').then(directedCourses => {
                resolve(directedCourses.includes(course));
              });
            });
          });
        }
      });
    });
  })
});

export default Component.extend({
  classNames: ['detail-view', 'sessions-list'],

  store: service(),
  i18n: service(),
  currentUser: service(),

  editable: not('course.locked'),
  sessionsCount: alias('sessions.length'),
  sessions: alias('course.sessions'),
  offset: 0,
  limit: 25,

  filterBy: null,
  course: null,

  proxiedSessions: computed('sessions.[]', function() {
    return new Promise(resolve => {
      this.get('sessions').then(sessions => {
        return map(sessions.toArray(), session => {
          return hash({
            sessionType: session.get('sessionType'),
            firstOfferingDate: session.get('firstOfferingDate'),
            associatedLearnerGroups: session.get('associatedLearnerGroups'),
            offerings: session.hasMany('offerings').ids(),
          }).then(({sessionType, firstOfferingDate, associatedLearnerGroups, offerings})=> {
            return SessionProxy.create({
              content: session,
              currentUser: this.get('currentUser'),
              sessionType: sessionType.get('title'),
              firstOfferingDate,
              learnerGroupCount: associatedLearnerGroups.get('length'),
              offeringCount: offerings.get('length')
            });
          });
        }).then((proxiedSessions => {
          resolve(proxiedSessions);
        }));
      });
    });
  }),

  filteredContent: computed('proxiedSessions', 'filterBy', function(){
    return new Promise(resolve => {
      this.get('proxiedSessions').then(sessions => {
        let filter = this.get('filterBy');
        let filterExpressions = filter.split(' ').map(function (string) {
          return new RegExp(string, 'gi');
        });
        let filtered = sessions.filter(session => {
          let searchString = session.get('searchString');
          if (searchString === null || searchString === undefined) {
            return false;
          }
          let matchedSearchTerms = 0;
          for (let i = 0; i < filterExpressions.length; i++) {
            if (searchString.match(filterExpressions[i])) {
              matchedSearchTerms++;
            }
          }
          //if the number of matching search terms is equal to the number searched, return true
          return (matchedSearchTerms === filterExpressions.length);
        });
        resolve(filtered.sortBy('title'));
      });
    });
  }),
  sortBy: 'title',
  sortedSessions: computed('filteredContent', 'sortBy', 'sortedAscending', function() {
    return new Promise(resolve => {
      let sortBy = this.get('sortBy');
      if (-1 === sortBy.indexOf(':')) {
        sortBy = sortBy.split(':', 1)[0];
      }
      let sortedAscending = this.get('sortedAscending');
      this.get('filteredContent').then(sessions => {
        if ('title' === sortBy) {
          sessions = sessions.sortBy(sortBy);
          if (! sortedAscending) {
            sessions = sessions.slice().reverse();
          }
        } else {
          // @todo sort by session-type title, offering-count, first offering and groups count. [ST 2017/02/01]
        }
        resolve(sessions);
      });
    });
  }),

  sortedAscending: computed('sortBy', function(){
    const sortBy = this.get('sortBy');
    return sortBy.search(/desc/) === -1;
  }),
  displayedSessions: computed('sortedSessions', 'offset', 'limit', 'sortBy', function(){
    const limit = this.get('limit');
    const offset = this.get('offset');
    const end = limit + offset;
    return new Promise(resolve => {
      this.get('sortedSessions').then(sessions => {
        resolve(sessions.slice(offset, end));
      });
    });
  }),

  editorOn: false,

  saved: false,
  savedSession: null,
  isSaving: null,

  sessionTypes: computed('course.school.sessionTypes.[]', function(){
    return new Promise( resolve => {
      const course = this.get('course');
      course.get('school').then(school => {
        school.get('sessionTypes').then(sessionTypes => {
          resolve(sessionTypes);
        });
      });
    });
  }),

  actions: {
    toggleEditor() {
      if (this.get('editorOn')) {
        this.set('editorOn', false);
      } else {
        this.setProperties({ editorOn: true, saved: false });
      }
    },

    cancel() {
      this.set('editorOn', false);
    },

    save(session) {
      this.set('isSaving', true);
      const course = this.get('course');
      session.set('course', course);

      return session.save().then((savedSession) => {
        this.setProperties({ saved: true, savedSession, isSaving: false });
      });
    },

    toggleExpandedOffering(sessionProxy){
      sessionProxy.set('expandOfferings', !sessionProxy.get('expandOfferings'));
    },
    confirmRemoval(sessionProxy){
      sessionProxy.set('showRemoveConfirmation', true);
    },
    remove(sessionProxy){
      let session = sessionProxy.get('content');
      session.deleteRecord();
      session.save();
    },
    cancelRemove(sessionProxy){
      sessionProxy.set('showRemoveConfirmation', false);
    },
    sortBy(what){
      const sortBy = this.get('sortBy');
      if(sortBy === what){
        what += ':desc';
      }
      this.get('setSortBy')(what);
    },
  }
});
