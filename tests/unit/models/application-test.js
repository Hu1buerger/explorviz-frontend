import { moduleForModel, test } from 'ember-qunit';

moduleForModel('application', 'Unit | Model | application', {
  // Specify the other units that are required for this test.
  needs: ['model:node', 'model:component', 'model:communicationclazz', 'model:communication']
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});