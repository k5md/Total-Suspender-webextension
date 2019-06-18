# Total Suspender

[![Maintainability](https://api.codeclimate.com/v1/badges/1b43f13948551c56f3ff/maintainability)](https://codeclimate.com/github/k5md/Total-Suspender-webextension/maintainability)
[![Build Status](https://travis-ci.com/k5md/Total-Suspender-webextension.svg?branch=master)](https://travis-ci.com/k5md/Total-Suspender-webextension)

A not-so-minimalistic web extension for Firefox that suspends natively (with tabs.discard) not-active tabs.

[Addon page on mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/total-suspender/)

## Features

- Only minimal user-permissions are required (storage to save configuration and tabs)
- Whitelisting and blacklisting features. You can enter URLs or their parts to the corresponding field and the tabs, which url's contain these patterns will (not) be discarded. May be useful when reading manuals or browsing tubes.
- Supports regex (for some reason)
- Can ignore tabs playing sound
- Implements delayed suspend feature
- Suspends inactive loaded tabs only if their number exceeds the threshold set

## Internationalization

The extension has been rewritten to use [i18n](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/Internationalization), so if you want to suggest a translation to your language, make a pull request with localized messages.json!
