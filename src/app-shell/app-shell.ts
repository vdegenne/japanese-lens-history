import {LitElement, html} from 'lit';
import {until} from 'lit/directives/until.js';
import {customElement} from 'lit/decorators.js';
import {withStyles} from 'lit-with-styles';
import styles from './app-shell.css?inline';
import {materialShellLoadingOff} from 'material-shell';
import data from '../files-array.json' with {type: 'json'};

let files = data.files;

declare global {
	interface Window {
		app: AppShell;
	}
	interface HTMLElementTagNameMap {
		'app-shell': AppShell;
	}
}

async function loadImage(hash: string) {
	const response = await fetch(`/data/${hash}.json`);
	const data = (await response.json()) as ImageInformation;
	return html`<!-- -->
		<img src=${data.image} />
		<!-- -->`;
}

@customElement('app-shell')
@withStyles(styles)
export class AppShell extends LitElement {
	firstUpdated() {
		materialShellLoadingOff.call(this);
	}

	render() {
		return html`<!-- -->
			${until(loadImage(data.files[0]), 'loading')}
			<!-- --> `;
	}
}

export const app = (window.app = new AppShell());
