import {type MdOutlinedTextField} from '@material/web/all.js';
import {withController} from '@snar/lit';
import {LitElement, html} from 'lit';
import {withStyles} from 'lit-with-styles';
import {customElement} from 'lit/decorators.js';
import {materialShellLoadingOff} from 'material-shell';
import {F, store} from '../store.js';
import '../viewer-element/viewer-element.js';
import styles from './app-shell.css?inline';
import toast from 'toastit';
import {sleep} from '../utils.js';

declare global {
	interface Window {
		app: AppShell;
	}
	interface HTMLElementTagNameMap {
		'app-shell': AppShell;
	}
}

@customElement('app-shell')
@withStyles(styles)
@withController(store)
export class AppShell extends LitElement {
	firstUpdated() {
		materialShellLoadingOff.call(this);
	}

	render() {
		return html`<!-- -->
			<header
				class="flex items-center justify-between pr-2"
				style="background-color:var(--md-sys-color-surface-container-high);min-height:56px;"
			>
				<div class="flex-1">
					${store.page === 'viewer'
						? html`<div class="pl-3">#${store.viewIndex}</div>`
						: store.page === 'search'
							? html`${F.TEXTFIELD('', 'search', {
									async init(element) {
										// await sleep(100);
										element.focus();
									},
								})}`
							: null}
				</div>
				${this.#renderPageMenu()}
			</header>

			<viewer-page ?active=${store.page === 'viewer'}></viewer-page>
			<search-page ?active=${store.page === 'search'}></search-page>
			<!-- --> `;
	}

	#renderPageMenu() {
		return html`<!-- -->
			<md-outlined-segmented-button-set
				@segmented-button-set-selection=${(event: CustomEvent) => {
					const button = event.detail.button as MdOutlinedTextField;
					const label = button.label.toLowerCase() as Page;
					if (label) {
						store.page = label;
					}
				}}
			>
				<md-outlined-segmented-button
					label="Viewer"
					?selected=${store.page === 'viewer'}
				>
					<md-icon slot="icon">view_carousel</md-icon>
				</md-outlined-segmented-button>
				<md-outlined-segmented-button
					label="Search"
					?selected=${store.page === 'search'}
				>
					<md-icon slot="icon">search</md-icon>
				</md-outlined-segmented-button>
			</md-outlined-segmented-button-set>
			<!-- -->`;
	}
}

export const app = (window.app = new AppShell());
