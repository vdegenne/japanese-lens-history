import '@material/mwc-top-app-bar';
import {type MdOutlinedTextField} from '@material/web/all.js';
import {withController} from '@snar/lit';
import {LitElement, html} from 'lit';
import {withStyles} from 'lit-with-styles';
import {customElement} from 'lit/decorators.js';
import {materialShellLoadingOff} from 'material-shell';
import {F, store} from '../store.js';
import '../viewer-element/viewer-element.js';
import styles from './app-shell.css?inline';

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
			<mwc-top-app-bar
				?dense=${false}
				style="--mdc-theme-primary:var(--md-sys-color-surface-container-high);--mdc-theme-on-primary:var(--md-sys-color-on-surface);"
			>
				<div slot="title">
					${store.page === 'viewer'
						? html`<div>#${store.viewIndex}</div>`
						: store.page === 'search'
							? html`${F.TEXTFIELD('', 'search', {
									style: 'filled',
									styles: 'margin-left:-20px',
									async init(element) {
										// await sleep(100);
										// element.focus();
									},
								})}`
							: null}
				</div>
				<div slot="actionItems">${this.#renderPageMenu()}</div>
				<div>
					<viewer-page ?active=${store.page === 'viewer'}></viewer-page>
					<search-page ?active=${store.page === 'search'}></search-page>
				</div>
			</mwc-top-app-bar>

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
