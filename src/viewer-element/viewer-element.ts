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
	@property() filename: string;
	@state() imageInfo: ImageInformation;

	@state() showId = false;
	@state() showImageSize = false;

	@queryAll('.part') partElements?: HTMLElement[];

	async #loadHash(hash = this.filename) {
		const response = await fetch(`./data/${hash}.json`);
		this.imageInfo = (await response.json()) as ImageInformation;

		// Not very charming but we can't use `updated` since that's async
		setTimeout(() => {
			// this.hideRandomPart();
		}, 50);

		return this.#renderView();
	}

	render() {
		return html`
			${guard(this.filename, () => {
				return html`<!-- -->
					${until(
						this.#loadHash(),
						html`<md-circular-progress indeterminate></md-circular-progress>`,
					)}
					<!-- -->`;
			})}
		`;
	}

	#renderView() {
		return html`<!-- -->
			<div id="view" @click=${this}>
				<div id="id" ?hidden=${!this.showId}>#${store.viewIndex}</div>
				<div id="length" ?hidden=${!this.showImageSize}>
					${this.imageInfo.image.length}
				</div>
				<img src=${this.imageInfo.image} />
				${this.imageInfo.parts.map(
					(part) =>
						html`<!-- -->
							<div class="part" style="${part.style}" aria-label=${part.label}>
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
