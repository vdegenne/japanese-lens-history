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
			<div class="flex flex-wrap">
				${store.searchResult.length
					? html`<!-- -->
							${store.searchResult.map((filename) => {
								return html`
									<viewer-element
										@click=${() => {
											store.updateViewIndexFromFilename(filename);
											store.page = 'viewer';
										}}
										class="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 2xl:w-1/5"
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
