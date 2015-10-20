import Ember from 'ember';
import DS from 'ember-data';

const {computed, RSVP} = Ember;
const {PromiseArray} = DS;

export default Ember.Component.extend({
  topics: [],
  sortedTopics: computed('topics.[]', function(){
    let defer = RSVP.defer();

    this.get('topics').then(topics => {
      defer.resolve(topics.sortBy('title'));
    });
    
    return PromiseArray.create({
      promise: defer.promise
    });
  }),
});
