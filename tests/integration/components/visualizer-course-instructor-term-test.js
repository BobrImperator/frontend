import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module(
  'Integration | Component | visualizer-course-instructor-term',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);

    test('it renders', async function (assert) {
      assert.expect(3);
      const instructor = this.server.create('user');
      const vocabulary1 = this.server.create('vocabulary');
      const vocabulary2 = this.server.create('vocabulary');
      const term1 = this.server.create('term', {
        vocabulary: vocabulary1,
        title: 'Standalone',
      });
      const term2 = this.server.create('term', {
        vocabulary: vocabulary2,
        title: 'Campaign',
      });
      const sessionType = this.server.create('session-type');
      const course = this.server.create('course');
      const session1 = this.server.create('session', {
        title: 'Berkeley Investigations',
        course,
        terms: [term1],
        sessionType: sessionType,
      });
      const session2 = this.server.create('session', {
        title: 'The San Leandro Horror',
        course,
        terms: [term2],
        sessionType: sessionType,
      });
      this.server.create('offering', {
        session: session1,
        startDate: new Date('2019-12-08T12:00:00'),
        endDate: new Date('2019-12-08T17:00:00'),
        instructors: [instructor],
      });
      this.server.create('offering', {
        session: session1,
        startDate: new Date('2019-12-21T12:00:00'),
        endDate: new Date('2019-12-21T17:30:00'),
        instructors: [instructor],
      });
      this.server.create('offering', {
        session: session2,
        startDate: new Date('2019-12-05T18:00:00'),
        endDate: new Date('2019-12-05T21:00:00'),
        instructors: [instructor],
      });

      const courseModel = await this.owner
        .lookup('service:store')
        .find('course', course.id);
      const userModel = await this.owner
        .lookup('service:store')
        .find('user', instructor.id);

      this.set('course', courseModel);
      this.set('instructor', userModel);

      await render(
        hbs`<VisualizerCourseInstructorTerm @course={{course}} @user={{instructor}} @isIcon={{false}} />`
      );

      const chartLabels = 'svg .bars text';
      assert.dom(chartLabels).exists({ count: 2 });
      assert
        .dom(findAll(chartLabels)[0])
        .hasText('Vocabulary 1 > Standalone 77.8%');
      assert
        .dom(findAll(chartLabels)[1])
        .hasText('Vocabulary 2 > Campaign 22.2%');
    });
  }
);
