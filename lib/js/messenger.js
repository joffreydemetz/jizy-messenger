let currentMessage = 1;
const timeouts = {};

const messageDefaultConfig = {
    type: 'message',
    persistant: true,
    dismissible: true,
    seethrough: true,
    fixed: false,
    timeout: 4,
    label: '',
    style: ''
};

export default class jMessenger {
    constructor(selector = '[data-jizy-messaging]') {
        this.$container = null;
        this.selector = selector;
        this.config = messageDefaultConfig;
    }

    ready() {
        this.$container = document.querySelector(this.selector);

        if (this.$container) {
            if (this.$container instanceof Element) {
                throw new Error("Container is not a valid Element");
            }

            if (this.$container.dataset.parsed) {
                return;
            }
        } else {
            this.$container = document.createElement("div");
            this.$container.classList.add("app-messages", "seethrough");
            this.$container.setAttribute("data-jizy-messaging", "app");
            document.body.appendChild(this.$container);
        }

        this.$container.querySelectorAll(".alert").forEach((el) => {
            currentMessage++;
            el.dataset.i = currentMessage;
            if (el.dataset.timeout) {
                timeouts[currentMessage] = setTimeout(() => { this.closeMessage(el); }, el.dataset.timeout * 1000);
                let dismissButton = el.querySelector('.closer');
                dismissButton.addEventListener('click', () => { this.closeMessage(el); });
            }
        });

        this.$container.setAttribute("data-jizy-parsed", true);
    }

    setConfig(cfg) {
        this.config = {
            ...this.config,
            ...cfg || {}
        };
    }

    add(message, type, cfg = {}) {
        cfg = {
            ...this.config,
            type: type || 'message',
            i: currentMessage++,
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
                cfg.style = 'danger';
                break;

            case 'message':
                cfg.style = 'success';
                break;

            case 'info':
            case 'warning':
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

            const dismissButton = document.createElement('button');
            dismissButton.classList.add('closer');
            dismissButton.innerHTML = '<span aria-hidden="true">&times;</span><span class="sr-only">' + JiZy.translate('CLOSE') + '</span>';
            dismissButton.addEventListener('click', () => { this.closeMessage(alertBox); });
            alertBox.appendChild(dismissButton);
        }

        this.$container.style.display = 'block';
        this.$container.appendChild(alertBox);

        if (false === cfg.persistant) {
            timeouts[cfg.i] = setTimeout(() => { this.closeMessage(alertBox); }, cfg.timeout * 1000);
        }
    }

    closeMessage(el) {
        el.remove();

        if (typeof timeouts[el.dataset.i] !== 'undefined') {
            clearTimeout(timeouts[el.dataset.i]);
            delete timeouts[el.dataset.i];
        }

        this.check();
    }

    empty() {
        for (const t in timeouts) {
            clearTimeout(timeouts[t]);
        }
        this.$container.innerText = '';
        this.$container.style.display = 'none';
        this.$container.classList.remove('seethrough');
        this.$container.classList.remove('backgrounded');
        i = 1;
        timeouts = {};
    }

    check() {
        if (!this.$container.innerText) {
            this.$container.innerText = '';
            this.$container.style.display = 'none';
        }
    }
}
