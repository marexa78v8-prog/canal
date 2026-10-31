# CANAL+ RDC

This repository contains the standalone CANAL+ static site.

## Deploy on Render

1. Push the contents of this folder to the GitHub repository `canalplus-rdc`.
2. In Render, create a **Static Site** and connect that repository, or create a
   Blueprint from its `render.yaml`.
3. If configuring the site manually, set the build command to blank and the
   publish directory to `.`.
4. Deploy. The site is served from `index.html`.

The `assets` directory is required by the page; keep it at the repository root.
