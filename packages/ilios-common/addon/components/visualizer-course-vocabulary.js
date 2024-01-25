import Component from '@glimmer/component';
import { filter, map } from 'rsvp';
import { htmlSafe } from '@ember/template';
import { restartableTask, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { use } from 'ember-could-get-used-to-this';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import AsyncProcess from 'ilios-common/classes/async-process';
import { findBy, mapBy, uniqueValues } from 'ilios-common/utils/array-helpers';

export default class VisualizerCourseVocabulary extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;

  @cached
  get sessionsData() {
    return new TrackedAsyncData(this.args.course.sessions);
  }

  get sessions() {
    return this.sessionsData.isResolved ? this.sessionsData.value : [];
  }

  @use dataObjects = new AsyncProcess(() => [this.getDataObjects.bind(this), this.sessions]);

  get isLoaded() {
    return !!this.dataObjects;
  }

  async getDataObjects(sessions) {
    if (!sessions) {
      return [];
    }
    const sessionsWithMinutes = await map(sessions.slice(), async (session) => {
      const hours = await session.getTotalSumDuration();
      return {
        session,
        minutes: Math.round(hours * 60),
      };
    });
    const terms = await map(sessionsWithMinutes, async ({ session, minutes }) => {
      const sessionTerms = await session.get('terms');
      const sessionTermsInThisVocabulary = await filter(sessionTerms.slice(), async (term) => {
        const termVocab = await term.get('vocabulary');
        return termVocab.get('id') === this.args.vocabulary.get('id');
      });
      return sessionTermsInThisVocabulary.map((term) => {
        return {
          term,
          session: {
            title: session.get('title'),
            minutes,
          },
        };
      });
    });

    return terms.reduce((flattened, arr) => {
      return [...flattened, ...arr];
    }, []);
  }

  get data() {
    const termData = this.dataObjects.reduce((set, { term, session }) => {
      const termTitle = term.get('title');
      let existing = findBy(set, 'label', termTitle);
      if (!existing) {
        existing = {
          data: 0,
          label: termTitle,
          meta: {
            termTitle,
            termId: term.get('id'),
            sessions: [],
          },
        };
        set.push(existing);
      }
      existing.data += session.minutes;
      existing.meta.sessions.push(session.title);

      return set;
    }, []);

    const totalMinutes = mapBy(termData, 'data').reduce((total, minutes) => total + minutes, 0);
    const mappedTermsWithLabel = termData.map((obj) => {
      const percent = ((obj.data / totalMinutes) * 100).toFixed(1);
      obj.label = `${obj.meta.termTitle}: ${obj.data} ${this.intl.t('general.minutes')}`;
      obj.meta.totalMinutes = totalMinutes;
      obj.meta.percent = percent;
      return obj;
    });

    return mappedTermsWithLabel.sort((first, second) => {
      return first.data - second.data;
    });
  }

  barHover = restartableTask(async (obj) => {
    await timeout(100);
    if (this.args.isIcon || !obj || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }
    const { label, meta } = obj;

    this.tooltipTitle = htmlSafe(label);
    this.tooltipContent = uniqueValues(meta.sessions).sort().join(', ');
  });

  @action
  barClick(obj) {
    if (this.args.isIcon || !obj || obj.empty || !obj.meta) {
      return;
    }
    this.router.transitionTo('course-visualize-term', this.args.course.id, obj.meta.termId);
  }
}
