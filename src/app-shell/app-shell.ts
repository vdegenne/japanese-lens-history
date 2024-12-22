import {LitElement, html} from 'lit';
import {withStyles} from 'lit-with-styles';
import {customElement, state} from 'lit/decorators.js';
import {materialShellLoadingOff} from 'material-shell';
import '../viewer-element/viewer-element.js';
import styles from './app-shell.css?inline';
import {store} from '../store.js';
import {withController} from '@snar/lit';
import {files} from '../data.js';

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

		window.addEventListener('keydown', (event: KeyboardEvent) => {
			// toast(event.code);
			if (event.code === 'ArrowLeft') {
				store.previous();
			} else if (event.code === 'ArrowRight') {
				store.next();
			}
		});
	}

	render() {
		return html`<!-- -->
			<div id="wrapper">
				<viewer-element hash=${files[store.viewIndex]}></viewer-element>

				<div id="hash">${files[store.viewIndex]}</div>

				<div id="actions">
					<md-icon-button @click=${() => store.first()}
						><md-icon>first_page</md-icon></md-icon-button
					>
					<md-icon-button @click=${() => store.previous()}
						><md-icon>arrow_back</md-icon></md-icon-button
					>
					<md-icon-button @click="${() => store.random()}" id="casino"
						><md-icon>casino</md-icon></md-icon-button
					>
					<md-icon-button @click=${() => store.next()}
						><md-icon>arrow_forward</md-icon></md-icon-button
					>
					<md-icon-button @click=${() => store.last()}
						><md-icon>last_page</md-icon></md-icon-button
					>
				</div>
			</div>
			<!-- --> `;
	}
}

export const app = (window.app = new AppShell());
