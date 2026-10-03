# jizy-messenger

A simple JS DOM messaging library: flash messages ("alerts") stacked in a fixed container at the top
of the page, dismissible and optionally auto-closing. It also wires the messages the server already
rendered in that container.

## Install

```sh
npm i jizy-messenger
```

| Entry | What |
|---|---|
| `lib/index.js` | ESM entry, default export `jMessenger` (a class) |
| `dist/js/jizy-messenger.min.js` | Browser bundle, sets the global `window.jMessenger` |
| `dist/css/jizy-messenger.min.css` | Styles |

[`jizy-factory`](https://www.npmjs.com/package/jizy-factory) creates one as `JiZy.Messaging` and
starts it with `JiZy.run()`.

## Usage

```js
import jMessenger from 'jizy-messenger';

const messenger = new jMessenger();          // container selector: '[data-jizy-messaging]'

document.addEventListener('DOMContentLoaded', () => {
    messenger.ready();

    messenger.add('Saved.', 'success', { persistant: false, timeout: 3 });
    messenger.add('Something went wrong.', 'error');
});
```

Call `ready()` once the DOM is parsed, before any `add()`: it finds the container, or creates
`<div class="app-messages" data-jizy-messaging="app">` at the end of `<body>` when there is none.

### Server-rendered messages

`ready()` also wires the `.alert` elements already in the container: a `.closer` button inside one
closes it, and a `data-timeout` attribute (seconds) closes it automatically. It marks the container
`data-jizy-parsed`, so a second `ready()` does nothing.

```html
<div class="app-messages" data-jizy-messaging>
    <div class="alert alert-success" role="alert" data-timeout="5">
        <div>Your message was sent.</div>
        <button class="closer"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
    </div>
</div>
```

## API

| Method | Description |
|---|---|
| `new jMessenger(selector = '[data-jizy-messaging]')` | |
| `setSelector(selector)` | Changes the container selector (before `ready()`). |
| `ready()` | Finds or creates the container and wires its existing messages. |
| `add(message, type = 'message', config = {})` | Appends a message. `message` is inserted as HTML, so never pass untrusted text. Empty messages are ignored. |
| `setConfig(config)` | Changes the defaults used by every later `add()`. |
| `closeMessage(element)` | Removes one message (and its timer). |
| `empty()` | Removes every message and hides the container. |

`type` picks the colour: `success` / `message` (green), `info`, `primary`, `warning`, `error` /
`danger` (red); the message gets the classes `alert alert-<style>`.

### Message options

| Option | Default | Description |
|---|---|---|
| `persistant` | `true` | When `false`, the message closes itself after `timeout`. |
| `timeout` | `4` | Seconds before a non-persistent message closes. |
| `dismissible` | `true` | Adds a close button. Its screen-reader label is `JiZy.translate('CLOSE')` when a `JiZy` global with `translate()` exists, `Close` otherwise. |
| `fixed` | `false` | Adds the `backgrounded` class to the container: a full-height translucent backdrop behind the messages. |
| `seethrough` | `true` | Adds the `seethrough` class to the container (a hook for the site's CSS; the package does not style it). |

## Theming

Override these custom properties at `:root`, in a stylesheet loaded after this one:

| Variable | Default |
|---|---|
| `--jizy-messenger-fg-color` | `#fff` |
| `--jizy-messenger-closer-color` | `#fff` |
| `--jizy-messenger-backdrop-color` | `rgba(0, 0, 0, .4)` |
| `--jizy-messenger-success-bg-color` | `#28a745` |
| `--jizy-messenger-info-bg-color` | `#17a2b8` |
| `--jizy-messenger-primary-bg-color` | `#888` |
| `--jizy-messenger-warning-bg-color` | `#ff8400` |
| `--jizy-messenger-danger-bg-color` | `#dc3545` |

## Build and test

```sh
npm run jpack:dist      # rebuild dist/ from lib/ (dist/ is committed)
npm test                # jest (jsdom), ESM mode
```

## License

MIT — see [LICENSE](LICENSE).
