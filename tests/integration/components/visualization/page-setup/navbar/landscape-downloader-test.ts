import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | visualization/page-setup/navbar/landscape-downloader', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<Visualization::PageSetup::Navbar::LandscapeDownloader />`);

    let textContent = this.element.textContent;

    if(textContent === null) {
      assert.ok(null, 'no text content');
    } else {
      assert.equal(textContent.trim(), '');
    }

    // Template block usage:
    await render(hbs`
      <Visualization::PageSetup::Navbar::LandscapeDownloader>
        template block text
      </Visualization::PageSetup::Navbar::LandscapeDownloader>
    `);

    textContent = this.element.textContent;

    if(textContent === null) {
      assert.ok(null, 'no text content');
    } else {
      assert.equal(textContent.trim(), '');
    }
  });
});