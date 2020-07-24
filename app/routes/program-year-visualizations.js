import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { all } from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  store: service(),

  /**
   * Prefetch related data to limit network requests
  */
  async afterModel(model) {
    const store = this.store;
    const cohort = await model.get('cohort');
    const courses = cohort.hasMany('courses').ids();

    const promises = [
      model.get('program'),
      model.get('competencies'),
      model.get('programYearObjectives'),
    ];
    if (courses.length) {
      promises.push(store.query('course-objective', { filters: { courses } }));
      promises.push(store.query('session-objective', { filters: { courses } }));
    }

    return all(promises);
  },
});
