import {withController} from '@snar/lit';
import {html} from 'lit';
import {withStyles} from 'lit-with-styles';
import {customElement} from 'lit/decorators.js';
import {store} from '../store.js';
import {PageElement} from './PageElement.js';

@customElement('search-page')
@withController(store)
@withStyles()
class SearchPage extends PageElement {
	render() {
		return html`<!-- -->
			<div class="flex flex-wrap gap-2">
				${store.searchResult.length
					? html`<!-- -->
							${store.searchResult.map((filename) => {
								return html`
									<viewer-element
										@click=${() => {
											store.updateViewIndexFromFilename(filename);
											store.page = 'viewer';
										}}
										style="width:min(500px,100vw);"
										filename=${filename}
									></viewer-element>
								`;
							})}
							<!-- -->`
					: html`<!-- -->
							<div>No result</div>
							<!-- -->`}
			</div>
			<!-- -->`;
	}
}

export const searchPage = new SearchPage();
