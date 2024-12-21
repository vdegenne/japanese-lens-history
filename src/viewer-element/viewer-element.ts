import {html, LitElement} from 'lit';
import {withStyles} from 'lit-with-styles';
import {customElement, property, queryAll, state} from 'lit/decorators.js';
import {guard} from 'lit/directives/guard.js';
import {until} from 'lit/directives/until.js';
import {store} from '../store.js';
import styles from './viewer-element.css?inline';

@customElement('viewer-element')
@withStyles(styles)
export class ViewerElement extends LitElement {
	@property() hash: string;
	@state() view: ImageInformation;

	@queryAll('.part') partElements?: HTMLElement[];

	async #loadHash(hash = this.hash) {
		const response = await fetch(`./data/${hash}.json`);
		this.view = (await response.json()) as ImageInformation;

		// Not very charming but we can't use `updated` since that's async
		setTimeout(() => {
			this.hideRandomPart();
		}, 80);

		return this.#renderView();
	}

	render() {
		return html`
			${guard(this.hash, () => {
				return html`<!-- -->
					${until(this.#loadHash(), 'Loading...')}
					<!-- -->`;
			})}
		`;
	}

	#renderView() {
		return html`<!-- -->
			<div id="view" @click=${this}>
				<div id="id">#${store.viewIndex}</div>
				<img src=${this.view.image} />
				${this.view.parts.map(
					(part) =>
						html`<!-- -->
							<div class="part" style="${part.style}">
								${true ? '' : part.label}
							</div>
							<!-- -->`,
				)}
			</div>
			<!-- -->`;
	}

	handleEvent(event: Event) {
		const target = event.target as HTMLElement;
		if (target.classList.contains('part')) {
			target.removeAttribute('hidden');
		}
	}

	hideRandomPart() {
		const nonHiddenParts = [...this.partElements].filter(
			(part) => !part.hasAttribute('hidden'),
		);
		nonHiddenParts[
			Math.floor(Math.random() * nonHiddenParts.length)
		].setAttribute('hidden', '');
	}
}
