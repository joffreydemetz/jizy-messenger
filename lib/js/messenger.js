export default class jMessenger {
    constructor(selector = '[data-jizy-messaging]') {
        this.$container = null;
        this.selector = selector;
        this.currentMessage = 0;
        this.timeouts = {};
        this.config = {
            type: 'message',
            persistant: true,
            dismissible: true,
            seethrough: true,
            fixed: false,
            timeout: 4,
            label: '',
            style: ''
        };
    }

    setSelector(selector) {
        this.selector = selector;
        return this;
    }

    ready() {
        this.$container = document.querySelector(this.selector);

        if (this.$container) {
            if (!(this.$container instanceof Element)) {
                throw new Error("Container is not a valid Element");
            }

            if (this.$container.dataset.jizyParsed) {
                return;
            }
        } else {
            this.$container = document.createElement("div");
            this.$container.classList.add("app-messages", "seethrough");
            this.$container.setAttribute("data-jizy-messaging", "app");
            document.body.appendChild(this.$container);
        }

        this.$container.querySelectorAll(".alert").forEach((el) => {
            this.currentMessage++;
            el.dataset.i = this.currentMessage;
            if (el.dataset.timeout) {
                this.timeouts[this.currentMessage] = setTimeout(() => { this.closeMessage(el); }, el.dataset.timeout * 1000);
                let dismissButton = el.querySelector('.closer');
                dismissButton.addEventListener('click', () => { this.closeMessage(el); });
            }
        });

        this.$container.setAttribute("data-jizy-parsed", true);
    }

    setConfig(cfg = {}) {
        this.config = {
            ...this.config,
            ...cfg
        };
    }

    add(message, type, cfg = {}) {
        cfg = {
            ...this.config,
            type: type || 'message',
            i: this.currentMessage++,
            ...cfg || {}
        };

        if (!message) {
            return;
        }

        message = message.trim();

        if (true === cfg.seethrough) {
            this.$container.classList.add("seethrough");
        }

        if (true === cfg.fixed) {
            this.$container.classList.add("backgrounded");
        }

        switch (cfg.type) {
            case 'error':
            case 'danger':
                cfg.style = 'danger';
                break;

            case 'info':
                cfg.style = 'info';
                break;

            case 'primary':
                cfg.style = 'primary';
                break;

            case 'warning':
                cfg.style = 'warning';
                break;

            case 'success':
            case 'message':
            default:
                cfg.style = 'success';
                break;
        }

        const alertBox = document.createElement('div');
        alertBox.setAttribute('role', 'alert');
        alertBox.dataset.i = cfg.i;
        alertBox.classList.add('alert');
        alertBox.classList.add('alert-' + cfg.style);
        alertBox.innerHTML = '<div>' + message + '</div>';

        if (true === cfg.dismissible) {
            alertBox.classList.add('alert-dismissible');

            const closeLabel = (typeof JiZy !== 'undefined' && JiZy && typeof JiZy.translate === 'function')
                ? JiZy.translate('CLOSE')
                : 'Close';

            const dismissButton = document.createElement('button');
            dismissButton.classList.add('closer');
            dismissButton.innerHTML = '<span aria-hidden="true">&times;</span><span class="sr-only">' + closeLabel + '</span>';
            dismissButton.addEventListener('click', () => { this.closeMessage(alertBox); });
            alertBox.appendChild(dismissButton);
        }

        this.$container.style.display = 'block';
        this.$container.appendChild(alertBox);

        if (false === cfg.persistant) {
            this.timeouts[cfg.i] = setTimeout(() => { this.closeMessage(alertBox); }, cfg.timeout * 1000);
        }
    }

    closeMessage(el) {
        el.remove();

        if (typeof this.timeouts[el.dataset.i] !== 'undefined') {
            clearTimeout(this.timeouts[el.dataset.i]);
            delete this.timeouts[el.dataset.i];
        }

        this.check();
    }

    empty() {
        for (const t in this.timeouts) {
            clearTimeout(this.timeouts[t]);
        }
        this.$container.innerText = '';
        this.$container.style.display = 'none';
        this.$container.classList.remove('seethrough');
        this.$container.classList.remove('backgrounded');
        this.currentMessage = 0;
        this.timeouts = {};
    }

    check() {
        if (!this.$container.innerText) {
            this.$container.innerText = '';
            this.$container.style.display = 'none';
        }
    }
}
