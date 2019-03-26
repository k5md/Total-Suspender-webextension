# Total Suspender

[![Maintainability](https://api.codeclimate.com/v1/badges/1b43f13948551c56f3ff/maintainability)](https://codeclimate.com/github/k5md/Total-Suspender-webextension/maintainability)
[![Build Status](https://travis-ci.com/k5md/Total-Suspender-webextension.svg?branch=master)](https://travis-ci.com/k5md/Total-Suspender-webextension)

A minimalistic web extension for firefox that suspends natively (with tabs.discard) not-active tabs.

[Addon page on mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/total-suspender/)

## Features

- Only minimal user-permissions are required (storage to save configuration and tabs for whitelisting)
- Implements whitelisting feature. You can enter URLs or their parts to the corresponding field and the tabs, which url's contain these patterns will not be discarded. May be useful when reading manuals or browsing tubes.
- Can ignore tabs playing sound
- Implements delayed suspend feature
