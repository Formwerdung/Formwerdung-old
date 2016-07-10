# Assemble Boilerplate

We're using [assemble v0.7.0+][assemble] to make microsites, marketing splash pages and rapid prototyping.

## Prerequisites
Node, npm, assemble, gulp, clone repository, edit templates, ```npm i```, ```bower i``` and assets. ```gulp-responsive-images``` requires GraphicsMagick: ```brew install graphicsmagick```. For more info see the readme here: [gulp-responsive-images][responsive]. Go wild!


## Usage
Essentially there's four commands:

1. ```assemble pre``` takes care of copying and image resizing tasks, which are quite resource intensive, so they should be run only once.

2. ```assemble dev``` renders for development.

3. ```assemble prod``` renders for production.

4. ```assemble serve``` serves the ```app```folder on a small BrowserSync Server (with reloads).

All rendering is done in the ```app```folder, there's no ```dist``` directory or similar for production.

## Features
- ```source``` can be used to cut images to size
- Images via Picturefill
- Nice permalinks (http://example.com/contact)
- Multilingual support via yaml front matter

## Planned
- Deploy to GitHub

## Known Issues
- Generation of Navigation means they end up in alphabetical order.

Code is MIT Licensed

Use of the drawings gratuitously permitted by [Franziska Staerkle][franziska], Copyright (c) Franziska Staerkle

[franziska]: http://franziskastaerkle.ch
[assemble]: https://github.com/assemble/assemble
[responsive]: https://github.com/mahnunchik/gulp-responsive
