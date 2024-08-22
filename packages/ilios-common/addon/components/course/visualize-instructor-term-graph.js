import Component from '@glimmer/component';
import { filter, map } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { restartableTask, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { findBy, mapBy, uniqueValues } from 'ilios-common/utils/array-helpers';

export default class CourseVisualizeInstructorTermGraph extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;

  @cached
  get sessionsData() {
    return new TrackedAsyncData(this.args.course.sessions);
  }

  get sessions() {
    return this.sessionsData.isResolved ? this.sessionsData.value.slice() : [];
  }

  @cached
  get outputData() {
    return new TrackedAsyncData(this.getData(this.sessions));
  }

  get data() {
    return this.outputData.isResolved ? this.outputData.value : [];
  }

  async getData(sessions) {
    if (!sessions.length) {
      return [];
    }

    const sessionsWithUser = await filter(sessions, async (session) => {
      const allInstructors = await session.getAllOfferingInstructors();
      return mapBy(allInstructors, 'id').includes(this.args.user.id);
    });

    const sessionsWithTerms = await map(sessionsWithUser, async (session) => {
      const terms = await map((await session.terms).slice(), async (term) => {
        const vocabulary = await term.vocabulary;
        return {
          termTitle: term.title,
          vocabularyTitle: vocabulary.title,
        };
      });

      return {
        session,
        terms,
      };
    });

    const totalMinutes = (
      await map(sessionsWithTerms, async ({ session }) => {
        return await session.getTotalSumOfferingsDurationByInstructor(this.args.user);
      })
    ).reduce((total, mins) => total + mins, 0);

    const dataMap = await map(sessionsWithTerms, async ({ session, terms }) => {
      const minutes = await session.getTotalSumDurationByInstructor(this.args.user);
      return terms.map(({ termTitle, vocabularyTitle }) => {
        return {
          sessionTitle: session.title,
          termTitle,
          vocabularyTitle,
          minutes,
        };
      });
    });

    const flat = dataMap.reduce((flattened, arr) => {
      return [...flattened, ...arr];
    }, []);

    const sessionTermData = flat.reduce((set, obj) => {
      const name = `${obj.vocabularyTitle} > ${obj.termTitle}`;
      let existing = findBy(set, 'label', name);
      if (!existing) {
        existing = {
          data: 0,
          label: name,
          meta: {
            sessions: [],
            vocabularyTitle: obj.vocabularyTitle,
          },
        };
        set.push(existing);
      }
      existing.data += obj.minutes;
      existing.meta.sessions.push(obj.sessionTitle);

      return set;
    }, []);

    return sessionTermData
      .map((obj) => {
        const percent = ((obj.data / totalMinutes) * 100).toFixed(1);
        obj.meta.totalMinutes = totalMinutes;
        obj.meta.percent = percent;
        obj.label = `${obj.label}: ${obj.data} ${this.intl.t('general.minutes')}`;
        return obj;
      })
      .sort((first, second) => {
        return (
          first.meta.vocabularyTitle.localeCompare(second.meta.vocabularyTitle) ||
          second.data - first.data
        );
      });
  }

  donutHover = restartableTask(async (obj) => {
    await timeout(100);
    if (this.args.isIcon || isEmpty(obj) || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }
    const { label, meta } = obj;

    this.tooltipTitle = htmlSafe(label);
    this.tooltipContent = uniqueValues(meta.sessions).sort().join(', ');
  });
}
