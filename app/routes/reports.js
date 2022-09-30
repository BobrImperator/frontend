import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ReportsRoute extends Route {
  @service session;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    this.router.replaceWith('reports.subject', {
      queryParams: {
        report: null,
        reportYear: null,
      },
    });
  }
}
