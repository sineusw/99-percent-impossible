Run `npm install --prefix tests` and `npm test --prefix tests` with Node 20 or later.

The suite loads the production scripts in page order in Happy DOM and exercises synthetic touch/click events, result cancellation, and reaction input. It is a DOM regression suite, not a substitute for physical iPhone or WKWebView testing. Audio is muted and speech is stubbed.
