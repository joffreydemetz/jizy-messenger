# jizy-messenger 

A simple JS DOM messaging library.

```javascript
import { jMessenger } from 'jizy-messenger';

const messenger = new jMessenger();
messenger.add('Hello World!', 'message', { timeout: 5 });
messenger.add('This is an error message!', 'error', { timeout: 10 });
messenger.add('This is an info message!', 'info', { timeout: 15 });
messenger.add('This is a warning message!', 'warning', { timeout: 20 });
```