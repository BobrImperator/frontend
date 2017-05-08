import Ember from 'ember';
import DS from 'ember-data';

const { computed } = Ember;

export default DS.Model.extend({
  description: DS.attr('string'),
  session: DS.belongsTo('session', {async: true}),
  textDescription: computed('description', function(){
    var title = this.get('title');
    if(title === undefined){
      return '';
    }
    return title.replace(/(<([^>]+)>)/ig,"");
  })
});
