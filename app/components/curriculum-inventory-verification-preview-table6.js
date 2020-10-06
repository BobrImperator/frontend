import Component from '@glimmer/component';

export default class CurriculumInventoryVerificationPreviewTable6Component extends Component {

  get clerkships() {
    const methods = this.args.data.methods;
    return this.args.data.rows.map(row => {
      return {
        hasFormativeAssessments: row.has_formative_assessments ? 'Y' : '',
        hasNarrativeAssessments: row.has_narrative_assessments ? 'Y' : '',
        level: row.level,
        methods: methods.map(method => {
          return row.methods[method] ? 'X' : '';
        }),
        title: row.title,
      };
    });
  }
}
