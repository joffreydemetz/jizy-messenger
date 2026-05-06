/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';

let jMessenger;
let messenger;

beforeEach(async () => {
    jest.resetModules();
    jest.useFakeTimers();
    document.body.innerHTML = '';
    window.JiZy = { translate: (key) => key };
    const Cls = (await import('../lib/js/messenger.js')).default;
    jMessenger = Cls;
    messenger = new Cls();
});

afterEach(() => {
    jest.useRealTimers();
    delete window.JiZy;
});

describe('constructor', () => {
    test('exposes defaults', () => {
        expect(messenger.$container).toBeNull();
        expect(messenger.selector).toBe('[data-jizy-messaging]');
        expect(messenger.currentMessage).toBe(0);
        expect(messenger.timeouts).toEqual({});
        expect(messenger.config).toEqual({
            type: 'message',
            persistant: true,
            dismissible: true,
            seethrough: true,
            fixed: false,
            timeout: 4,
            label: '',
            style: ''
        });
    });

    test('accepts a custom selector', () => {
        const m = new jMessenger('#custom');
        expect(m.selector).toBe('#custom');
    });
});

describe('setSelector', () => {
    test('updates selector and returns the instance for chaining', () => {
        const ret = messenger.setSelector('.foo');
        expect(ret).toBe(messenger);
        expect(messenger.selector).toBe('.foo');
    });
});

describe('setConfig', () => {
    test('merges over defaults without dropping unset keys', () => {
        messenger.setConfig({ timeout: 10, persistant: false });
        expect(messenger.config.timeout).toBe(10);
        expect(messenger.config.persistant).toBe(false);
        expect(messenger.config.dismissible).toBe(true);
        expect(messenger.config.type).toBe('message');
    });

    test('called with no arguments leaves config unchanged', () => {
        const before = { ...messenger.config };
        messenger.setConfig();
        expect(messenger.config).toEqual(before);
    });
});

describe('ready()', () => {
    test('creates a default container when none matches the selector', () => {
        messenger.ready();

        expect(messenger.$container).not.toBeNull();
        expect(messenger.$container.parentNode).toBe(document.body);
        expect(messenger.$container.classList.contains('app-messages')).toBe(true);
        expect(messenger.$container.classList.contains('seethrough')).toBe(true);
        expect(messenger.$container.getAttribute('data-jizy-messaging')).toBe('app');
    });

    test('adopts an existing container that matches the selector', () => {
        const existing = document.createElement('div');
        existing.setAttribute('data-jizy-messaging', '');
        document.body.appendChild(existing);

        messenger.ready();

        expect(messenger.$container).toBe(existing);
        expect(existing.dataset.jizyParsed).toBe('true');
    });

    test('is idempotent on an already-parsed container', () => {
        const existing = document.createElement('div');
        existing.setAttribute('data-jizy-messaging', '');
        existing.dataset.jizyParsed = 'true';
        const alert = document.createElement('div');
        alert.classList.add('alert');
        existing.appendChild(alert);
        document.body.appendChild(existing);

        messenger.ready();

        expect(messenger.currentMessage).toBe(0);
        expect(alert.dataset.i).toBeUndefined();
    });

    test('parses pre-existing .alert children, indexing and wiring timeouts', () => {
        const existing = document.createElement('div');
        existing.setAttribute('data-jizy-messaging', '');

        const alert = document.createElement('div');
        alert.classList.add('alert');
        alert.dataset.timeout = '2';
        const closer = document.createElement('button');
        closer.classList.add('closer');
        alert.appendChild(closer);
        existing.appendChild(alert);
        document.body.appendChild(existing);

        messenger.ready();

        expect(alert.dataset.i).toBeDefined();
        const i = alert.dataset.i;
        expect(messenger.timeouts[i]).toBeDefined();

        jest.advanceTimersByTime(2000);
        expect(existing.contains(alert)).toBe(false);
    });

    test('clicking a parsed .closer removes its alert', () => {
        const existing = document.createElement('div');
        existing.setAttribute('data-jizy-messaging', '');

        const alert = document.createElement('div');
        alert.classList.add('alert');
        alert.dataset.timeout = '5';
        const closer = document.createElement('button');
        closer.classList.add('closer');
        alert.appendChild(closer);
        existing.appendChild(alert);
        document.body.appendChild(existing);

        messenger.ready();
        closer.click();

        expect(existing.contains(alert)).toBe(false);
    });
});

describe('add()', () => {
    beforeEach(() => {
        messenger.ready();
    });

    test('does nothing when message is empty/falsy', () => {
        messenger.add('', 'message');
        messenger.add(null, 'message');
        expect(messenger.$container.querySelectorAll('.alert').length).toBe(0);
    });

    test('renders an alert with role, dataset.i, and trimmed message', () => {
        messenger.add('  hello  ', 'message');
        const alert = messenger.$container.querySelector('.alert');
        expect(alert).not.toBeNull();
        expect(alert.getAttribute('role')).toBe('alert');
        expect(alert.dataset.i).toBeDefined();
        expect(alert.querySelector('div').textContent).toBe('hello');
    });

    test('error type maps to alert-danger', () => {
        messenger.add('boom', 'error');
        const alert = messenger.$container.querySelector('.alert');
        expect(alert.classList.contains('alert-danger')).toBe(true);
    });

    test('message/info/warning/default type maps to alert-success', () => {
        messenger.add('m', 'message');
        messenger.add('i', 'info');
        messenger.add('w', 'warning');
        messenger.add('d');
        const alerts = messenger.$container.querySelectorAll('.alert');
        expect(alerts.length).toBe(4);
        alerts.forEach((a) => expect(a.classList.contains('alert-success')).toBe(true));
    });

    test('shows the container (display:block) and applies seethrough/backgrounded', () => {
        messenger.add('hi', 'message', { fixed: true });
        expect(messenger.$container.style.display).toBe('block');
        expect(messenger.$container.classList.contains('seethrough')).toBe(true);
        expect(messenger.$container.classList.contains('backgrounded')).toBe(true);
    });

    test('dismissible alerts get a closer button that removes them', () => {
        messenger.add('hi', 'message');
        const alert = messenger.$container.querySelector('.alert');
        expect(alert.classList.contains('alert-dismissible')).toBe(true);

        const closer = alert.querySelector('.closer');
        expect(closer).not.toBeNull();
        expect(closer.querySelector('.sr-only').textContent).toBe('CLOSE');

        closer.click();
        expect(messenger.$container.contains(alert)).toBe(false);
    });

    test('non-dismissible alerts have no closer button', () => {
        messenger.add('hi', 'message', { dismissible: false });
        const alert = messenger.$container.querySelector('.alert');
        expect(alert.classList.contains('alert-dismissible')).toBe(false);
        expect(alert.querySelector('.closer')).toBeNull();
    });

    test('non-persistant alerts auto-close after timeout seconds', () => {
        messenger.add('bye', 'message', { persistant: false, timeout: 3 });
        const alert = messenger.$container.querySelector('.alert');
        expect(alert).not.toBeNull();

        jest.advanceTimersByTime(2999);
        expect(messenger.$container.contains(alert)).toBe(true);

        jest.advanceTimersByTime(2);
        expect(messenger.$container.contains(alert)).toBe(false);
    });

    test('per-call config overrides instance config', () => {
        messenger.setConfig({ persistant: false, timeout: 10 });
        messenger.add('hi', 'message', { persistant: true });
        jest.advanceTimersByTime(60_000);
        expect(messenger.$container.querySelector('.alert')).not.toBeNull();
    });

    test('increments currentMessage per add', () => {
        const before = messenger.currentMessage;
        messenger.add('a', 'message');
        messenger.add('b', 'message');
        expect(messenger.currentMessage).toBe(before + 2);
    });
});

describe('closeMessage()', () => {
    beforeEach(() => {
        messenger.ready();
    });

    test('removes the element from the DOM', () => {
        messenger.add('hi', 'message');
        const alert = messenger.$container.querySelector('.alert');
        messenger.closeMessage(alert);
        expect(messenger.$container.contains(alert)).toBe(false);
    });

    test('clears any pending timeout for that alert', () => {
        messenger.add('hi', 'message', { persistant: false, timeout: 5 });
        const alert = messenger.$container.querySelector('.alert');
        const i = alert.dataset.i;
        expect(messenger.timeouts[i]).toBeDefined();

        messenger.closeMessage(alert);
        expect(messenger.timeouts[i]).toBeUndefined();
    });

    test('hides the container when it becomes empty', () => {
        messenger.add('hi', 'message');
        const alert = messenger.$container.querySelector('.alert');
        messenger.closeMessage(alert);
        expect(messenger.$container.style.display).toBe('none');
    });
});

describe('empty()', () => {
    beforeEach(() => {
        messenger.ready();
    });

    test('clears all alerts, hides the container, resets state', () => {
        messenger.add('a', 'message', { persistant: false, timeout: 5 });
        messenger.add('b', 'error');
        expect(messenger.$container.querySelectorAll('.alert').length).toBe(2);

        messenger.empty();

        expect(messenger.$container.innerText).toBe('');
        expect(messenger.$container.style.display).toBe('none');
        expect(messenger.$container.classList.contains('seethrough')).toBe(false);
        expect(messenger.$container.classList.contains('backgrounded')).toBe(false);
        expect(messenger.currentMessage).toBe(0);
        expect(messenger.timeouts).toEqual({});
    });

    test('cancels pending non-persistant timeouts so cleared alerts do not re-trigger', () => {
        messenger.add('a', 'message', { persistant: false, timeout: 2 });
        messenger.empty();
        expect(() => jest.advanceTimersByTime(5000)).not.toThrow();
    });
});

describe('check()', () => {
    beforeEach(() => {
        messenger.ready();
    });

    test('hides the container when it has no text content', () => {
        messenger.$container.style.display = 'block';
        messenger.check();
        expect(messenger.$container.style.display).toBe('none');
    });

    test('leaves the container visible when it still has content', () => {
        messenger.$container.innerText = 'still here';
        messenger.$container.style.display = 'block';
        messenger.check();
        expect(messenger.$container.style.display).toBe('block');
    });
});
