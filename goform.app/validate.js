class Goform {
	constructor(form) {
		// Setup default config
		this.config = {
			apiUrl: `https://goform.app`
		};

		// Get form element
		this.form = form;
		this.token = this.getFormToken();

		// Prevent the browser doing native validation if we're using this class
		this.form.setAttribute('novalidate', true);

		// Setup submit listener
		this.form.addEventListener('submit', this.validate.bind(this));

		// Add goform class
		this.form.classList.add('goform');
	}

	validate(event) {
		event.preventDefault();

		// Reset the form
		this.reset();

		// Setup form data
		let data = new FormData(this.form);

		this.send(data).then((response) => {
			// All good, submit the form
			if (response.code === 200) {
				this.form.submit();
			} else {
				this.handleValidationErrors(response);
			}
		});
	}

	/**
	 * Handle Validation Errors
	 * @param  {object} response
	 */
	handleValidationErrors(response) {
		// Handle non-input related errors
		if (response.code !== 422) {
			this.setAlert('error', response.message || response.data.message);
		} else {
			this.setInputState(response.errors);
		}
	}

	/**
	 * Set Input State
	 */
	setInputState(inputs) {
		for (let field in inputs) {
			// Find the input
			let fieldInput = this.form.querySelector(`[name="${field}"]`);

			// Bail if the input doesn't exist
			if (!fieldInput) return;

			// Set Invalid state
			fieldInput.setAttribute('data-state', 'invalid');

			// Set validation message
			let error = document.createElement('p');
			error.classList.add('goform__error');
			error.innerText = inputs[field];

			// Add the error below it's input
			fieldInput.parentNode.insertBefore(error, fieldInput.nextSibling);
		}
	}

	/**
	 * Set Alert
	 * @param  string type
	 * @param  string message
	 */
	setAlert(type, message) {
		// Look for the alert container
		let alerts =
			this.form.querySelector('.goform__alerts') ||
			this.createAlertsContainer();

		// Create new alert
		let alert = document.createElement('div');
		alert.setAttribute('role', 'alert');
		alert.classList.add(`alert`, `alert--${type}`);
		alert.innerText = message;

		// Add it to the container
		alerts.appendChild(alert);
	}

	/**
	 * Create Alerts Container
	 */
	createAlertsContainer() {
		let container = document.createElement('div');
		container.classList.add('goform__alerts');
		this.form.insertBefore(container, this.form.firstChild);
		return container;
	}

	/**
	 * Send
	 * Send form data to the validation endpoint
	 * @param  FormData data
	 */
	async send(data) {
		let response = await fetch(this.getValidationEndpoint(), {
			method: 'POST',
			body: data,
			cache: 'default'
		});

		let responseBody = await response.json();
		return { ...responseBody, ...{ code: response.status } };
	}

	/**
	 * Handles resetting the form back to it's default state
	 */
	reset() {
		this.resetInputState();
		this.resetAlertState();
	}

	/**
	 * If any of the inputs have had their state changed, we need
	 * to reset them for the current request
	 */
	resetInputState() {
		let inputs = this.form.querySelectorAll('input, select, textarea');
		let errors = this.form.querySelectorAll('.goform__error');

		inputs.forEach((input) => input.removeAttribute('data-state'));
		errors.forEach((error) => error.remove());
	}

	/**
	 * If an alert container was created at some point, we need
	 * to reset the state of that for the current request
	 */
	resetAlertState() {
		let alerts = this.form.querySelector('.goform__alerts');
		if (alerts) alerts.parentNode.removeChild(alerts);
	}

	/**
	 * Get Form Token
	 *
	 * Extracts the form token from the forms action URL
	 */
	getFormToken() {
		let url = this.form.getAttribute('action');
		return url.replace(`${this.config.apiUrl}/s/`, '');
	}

	/**
	 * Get Validation Endpoint
	 */
	getValidationEndpoint() {
		return `${this.config.apiUrl}/v/${this.token}`;
	}
}

(() => {
	const forms = document.querySelectorAll('form[goform]');

	forms.forEach((form) => {
		new Goform(form);
	});

	// Add Stylesheet
	let stylesheet = document.createElement('link');
	stylesheet.href = 'https://goform.app/validate.css';
	stylesheet.rel = 'stylesheet';
	document.head.appendChild(stylesheet);
})();
