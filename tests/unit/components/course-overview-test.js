import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('course-overview', 'CourseOverviewComponent', {
  needs: [
    'helper:fa-icon',
    'component:wave-loader',
  ]
});

test('it renders', function(assert) {
  assert.expect(2);

  // creates the component instance
  var component = this.subject();
  assert.equal(component._state, 'preRender');

  // appends the component to the page
  this.append();
  assert.equal(component._state, 'inDOM');
});
