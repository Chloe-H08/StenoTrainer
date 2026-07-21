Steno Trainer
=============

This repo is my fork of Joshua Grams's `steno-jig`.

I made it because I wanted a way to try steno on a regular QWERTY keyboard without needing to fully commit to a steno setup first. The main goal of this fork is to make it easier to learn the keyboard layout, practice basic chord patterns, and try simple real-word drills before deciding whether to keep going with steno and eventually set up Plover.

I also started revamping the web design to make the app feel more modern and easier to navigate, though it's still a work in progress and not as clean as I want it to be yet.

The original lesson and drill structure from `steno-jig` is still the foundation of this project, but the QWERTY input mode is the reason I created this fork.

That said, the QWERTY approach is still a bit finicky on some of the longer drills. I'm still working on improving that and making the regular keyboard option more reliable across the longer practice modes on the site. If you want the most reliable experience for actual steno writing, getting Plover is probably the better option. The regular keyboard option is best as a low-friction way to learn the layout, get a feel for steno, and decide whether you want to continue.

Repo layout
-----------

- `index.html`: landing page for the static site
- `pages/`: lesson, drill, and setup pages
- `scripts/`: shared app logic and page-specific JavaScript
- `data/`: large word lists, sentence sets, and translation data
- `assets/`: stylesheets and images
