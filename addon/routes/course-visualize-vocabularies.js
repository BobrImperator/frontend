import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { all, map } from 'rsvp';

export default class CourseVisualizeVocabulariesRoute extends Route {
  @service session;
  @service store;

  titleToken = 'general.coursesAndSessions';

  async afterModel(course) {
    const sessions = (await course.sessions).toArray();
    return await all([
      course.get('school'),
      map(sessions, (s) => s.terms),
      map(sessions, (s) => s.totalSumDuration),
    ]);
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
