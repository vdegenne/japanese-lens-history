import {withController} from '@snar/lit';
import {css, html} from 'lit';
import {withStyles} from 'lit-with-styles';
import {customElement} from 'lit/decorators.js';
import {filenames} from '../data.js';
import {store} from '../store.js';
import {PageElement} from './PageElement.js';

// <viewer-element hash=${filenames[store.viewIndex]}></viewer-element>
//
// <div id="hash">${filenames[store.viewIndex]}</div>
@customElement('viewer-page')
@withController(store)
@withStyles(css`
	#hash {
		color: var(--md-sys-color-outline);
	}

	viewer-element-container {
		flex: 1;
	}

	#actions {
		display: flex;
		justify-content: space-between;
		/*margin: 12px;*/
		/*box-sizing: border-box;*/
	}

	.button {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		position: relative;
		min-height: 50px;
	}
`)
class SearchPage extends PageElement {
	protected render(): unknown {
		return html`<!-- -->
			<div class="flex-1 flex items-center justify-center">
				<viewer-element
					filename=${filenames[store.viewIndex]}
					style="width:min(1280px, 100vw);"
				></viewer-element>
			</div>
			<div id="actions">
				<div class="button" @click="${store.first}">
					<md-icon>first_page</md-icon>
					<md-ripple></md-ripple>
				</div>
				<div class="button" @click="${store.previous}" id="arrow-back">
					<md-icon>arrow_back</md-icon>
					<md-ripple></md-ripple>
				</div>
				<div class="button" @click="${store.random}" id="casino">
					<md-icon>casino</md-icon>
					<md-ripple></md-ripple>
				</div>
				<div class="button" @click="${store.next}" id="arrow-forward">
					<md-icon>arrow_forward</md-icon>
					<md-ripple></md-ripple>
				</div>
				<div class="button" @click="${store.last}">
					<md-icon>last_page</md-icon>
					<md-ripple></md-ripple>
				</div>
			</div>
			<!-- -->`;
	}
}

export const searchPage = new SearchPage();
