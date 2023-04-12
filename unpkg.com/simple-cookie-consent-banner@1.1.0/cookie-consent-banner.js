export class CookieConsentBanner extends HTMLElement {
	connectedCallback() {
		// Already accepted, remove the banner
		if (localStorage.getItem('ccbAccepted')) {
			this.remove();
			return;
		}

		// Load CSS
		this.loadCSS();

		this.acceptText = this.dataset.acceptText ?? 'OK';
		this.render();
	}

	renderAcceptButton() {
		let button = document.createElement('button');
		button.innerHTML = this.acceptText;
		button.type = 'button';
		button.addEventListener('click', this.handleAcceptClick.bind(this));
		return button;
	}

	render() {
		let content = this.innerHTML;
		let acceptButton = this.renderAcceptButton();

		this.innerHTML = `
                <div class="ccb-content">${content}</div>
                <div class="ccb-actions"></div>
            `;

		// Insert Accept Button
		// Doing it via a string doesn't keep events intact
		this.querySelector('.ccb-actions').appendChild(acceptButton);

		// Add connected class
		this.classList.add('is-connected');
	}

	/**
	 * Click Handler
	 *
	 * @param {*} event
	 */
	handleAcceptClick(event) {
		this.dispatchEvent('ccb:accepted');
		localStorage.setItem('ccbAccepted', true);
		this.remove();
	}

	/**
	 * Dispatch Event
	 *
	 * @param {string} name Event name
	 * @param {object} data Event data
	 */
	dispatchEvent(name, data = {}) {
		window.dispatchEvent(new CustomEvent(name, { detail: data }));
	}

	loadCSS() {
		let head = document.querySelector('head');
		let linkElement = document.createElement('link');
		linkElement.rel = 'stylesheet';
		linkElement.href = this.cssURL ?? 'https://unpkg.com/simple-cookie-consent-banner@1.0.2/cookie-consent-banner.css';
		head.appendChild(linkElement);

		// Show the banner after the CSS loads
		setTimeout(() => {
			this.removeAttribute('hidden');
		}, 1000);
	}
}

export function loadScriptIfCookiesEnabled(src) {
	window.scriptsToLoadIfCookiesEnabled.push(src);
}

export function runScriptIfCookiesEnabled(callback) {
	window.scriptsToRunIfCookiesEnabled.push(callback);
}

export function injectScriptIfCookiesAccepted(src) {
	let script = document.createElement('script');
	script.src = src;
	document.body.appendChild(script);
}

export function loadScriptsIfCookiesEnabled() {
	if (window.scriptsToLoadIfCookiesEnabled.length > 0) {
		window.scriptsToLoadIfCookiesEnabled.forEach((src) => {
			injectScriptIfCookiesAccepted(src);
		});
	}
}

export function runScriptsIfCookiesEnabled() {
	if (window.scriptsToRunIfCookiesEnabled.length > 0) {
		window.scriptsToRunIfCookiesEnabled.forEach((callback) => {
			callback();
		});
	}
}

window.scriptsToLoadIfCookiesEnabled = [];
window.scriptsToRunIfCookiesEnabled = [];

window.addEventListener('load', () => {
	if (localStorage.getItem('ccbAccepted')) {
		loadScriptsIfCookiesEnabled();
		runScriptsIfCookiesEnabled();
	}
});

window.addEventListener('ccb:accepted', () => {
	loadScriptsIfCookiesEnabled();
	runScriptsIfCookiesEnabled();
});

if (!window.customElements.get('cookie-consent-banner')) {
	window.customElements.define('cookie-consent-banner', CookieConsentBanner);
}
