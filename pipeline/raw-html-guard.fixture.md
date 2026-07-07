<!-- markdownlint-disable MD033 -- this fixture contains raw HTML on purpose -->
<!-- Fixture for the raw-HTML prose guard (pipeline/markdown.js lintRawHtml).
     The repo has no test runner; verify manually with:
       node --input-type=module -e "import {lintRawHtml} from './pipeline/markdown.js'; import {readFileSync} from 'node:fs'; console.log(lintRawHtml(readFileSync('pipeline/raw-html-guard.fixture.md','utf8')))"
     Expect warnings ONLY for the four BAD lines below (iframe, video, style,
     section) — never for the allowed or the escaped ones. -->

# Raw HTML guard fixture

Good, allowed inline HTML: press <kbd>Cmd</kbd> and see <span class="tag">NEW</span>.

Good, blessed embed: <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="ok"></iframe>

Escaped — must stay quiet: use an `<iframe>` or `<video>` tag in your work.

Also quiet inside a fence:

```html
<iframe src="https://evil.example/x"></iframe>
<section>whatever</section>
```

BAD — bare iframe in prose: embed it with an <iframe> here.

BAD — bare video: play the <video> now.

BAD — raw style block:

<style>.x{color:red}</style>

BAD — stray structural tag: this <section> vanishes silently.
