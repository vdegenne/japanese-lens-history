import {withController} from '@snar/lit';
import {html} from 'lit';
import {withStyles} from 'lit-with-styles';
import {customElement} from 'lit/decorators.js';
import {store} from '../store.js';
import {PageElement} from './PageElement.js';
import {SVG_GOOGLE_IMAGES} from '../assets/assets.js';
import {googleImagesOpen} from '@vdegenne/links';

// class="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 2xl:w-1/5"

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
										show-parts
										class="w-full sm:w-full lg:w-full xl:w-1/2 2xl:w-1/3"
										@click=${() => {
											store.updateViewIndexFromFilename(filename);
											store.page = 'viewer';
										}}
										filename=${filename}
										highlight=${store.search}
									></viewer-element>
								`;
							})}
							<!-- -->`
					: html`<!-- -->
							<div>No result</div>
							<!-- -->`}
			</div>

			<div class="fixed bottom-8 left-8 flex gap-6">
				<md-fab
					@click=${() => {
						store.search = store.search.slice(0, -1);
					}}
				>
					<md-icon slot="icon">backspace</md-icon>
				</md-fab>
				<md-fab @click=${() => googleImagesOpen(store.search)}>
					<md-icon slot="icon">${SVG_GOOGLE_IMAGES}</md-icon>
				</md-fab>
			</div>
			<!-- -->`;
	}
}

export const searchPage = new SearchPage();
