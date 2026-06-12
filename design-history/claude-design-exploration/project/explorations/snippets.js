// HTML snippets for the GRID options canvas. Plain script — exports to window.
window.GRID_SNIPPETS = {

  context: `
    <div class="masthead">
      <div class="brandmark">
        <span class="bm-row"><span class="bm-dot"></span><span class="bm-dot"></span></span>
        <span class="bm-row"><span class="bm-dot"></span><span class="bm-dot"></span></span>
      </div>
      <div class="wordmark">GRID · FALL 2026</div>
      <span class="term-pill">IDMX-225</span>
    </div>
    <div class="module-label">WEEK 1: FILE SYSTEMS &amp; HOW THE WEB WORKS</div>
    <div class="content">
      <h2 class="h2-rule">Topic Overview</h2>
      <p>In this topic we will be discussing what files and folders are on a computer
      system. Web developers must be both experienced and confident with naming,
      renaming, finding, copying, moving, deleting, downloading, and uploading files.</p>
    </div>`,

  videoA: `
    <div class="content">
      <div class="video-card">
        <a class="video-poster" href="https://youtu.be/hw7TwIf1rOw">
          <img src="https://img.youtube.com/vi/hw7TwIf1rOw/hqdefault.jpg" alt="Video 1: File System Basics">
          <span class="play-overlay">▶</span>
        </a>
        <div class="video-meta">
          <div class="video-text">
            <span class="video-kicker">VIDEO 1</span>
            <a class="video-title" href="https://youtu.be/hw7TwIf1rOw">File System Basics</a>
          </div>
          <span class="chip-time">~15 MIN</span>
        </div>
      </div>
    </div>`,

  videoB: `
    <div class="content">
      <div class="video-card">
        <a class="video-poster-plain" href="https://youtu.be/hw7TwIf1rOw">
          <img src="https://img.youtube.com/vi/hw7TwIf1rOw/hqdefault.jpg" alt="Video 1: File System Basics">
        </a>
        <div class="video-meta">
          <span class="play-tile">▶</span>
          <div class="video-text">
            <span class="video-kicker">VIDEO 1 · YOUTUBE</span>
            <a class="video-title" href="https://youtu.be/hw7TwIf1rOw">File System Basics</a>
          </div>
          <span class="chip-time">~15 MIN</span>
        </div>
      </div>
    </div>`,

  videoC: `
    <div class="content">
      <div class="video-card">
        <div class="video-meta video-meta-top">
          <span class="play-tile">▶</span>
          <div class="video-text">
            <span class="video-kicker">VIDEO 1</span>
            <span class="video-title">File System Basics</span>
          </div>
          <span class="chip-time">~15 MIN</span>
        </div>
        <iframe class="video-embed" src="https://www.youtube-nocookie.com/embed/hw7TwIf1rOw" title="Video 1: File System Basics" allowfullscreen></iframe>
        <div class="video-printurl">youtu.be/hw7TwIf1rOw</div>
      </div>
    </div>`,

  headingsA: `
    <div class="content">
      <h2 class="h2-rule">Reading</h2>
      <p>You should choose the reading assignment for the computer(s) you will be
      using for your web development assignments this semester.</p>
      <h3>Working With Files</h3>
      <p>Web developers must be confident with naming, renaming, finding, copying,
      moving, deleting, downloading, and uploading files.</p>
      <h4>Before you start</h4>
      <p>Make sure filename extensions are visible on your machine.</p>
    </div>`,

  headingsB: `
    <div class="content">
      <h2 class="h2-big">Reading</h2>
      <p>You should choose the reading assignment for the computer(s) you will be
      using for your web development assignments this semester.</p>
      <h3 class="h3-big">Working With Files</h3>
      <p>Web developers must be confident with naming, renaming, finding, copying,
      moving, deleting, downloading, and uploading files.</p>
      <h4 class="h4-big">Before you start</h4>
      <p>Make sure filename extensions are visible on your machine.</p>
    </div>`,

  objectivesA: `
    <div class="content">
      <div class="objectives">
        <span class="objectives-kicker">LEARNING OBJECTIVES</span>
        <p>When you have completed this topic you will be able to:</p>
        <ul>
          <li>Understand how the folder and file system works on your computer</li>
          <li>Understand the importance of filename extensions</li>
          <li>Know the file naming rules for web development</li>
        </ul>
      </div>
    </div>`,

  objectivesB: `
    <div class="content">
      <h3>Learning Objectives</h3>
      <p>When you have completed this topic you will be able to:</p>
      <ul>
        <li>Understand how the folder and file system works on your computer</li>
        <li>Understand the importance of filename extensions</li>
        <li>Know the file naming rules for web development</li>
      </ul>
    </div>`,

  resourcesA: `
    <div class="content">
      <h3>Working With Files</h3>
      <div class="link-stack">
        <div class="link-row">
          <span class="link-ico">↗</span>
          <span class="link-body">
            <a href="https://edu.gcfglobal.org/en/windowsbasics/working-with-files/1/">Windows Basics — Working with Files</a>
            <span class="link-url">edu.gcfglobal.org/en/windowsbasics</span>
          </span>
        </div>
        <div class="link-row">
          <span class="link-ico">↗</span>
          <span class="link-body">
            <a href="https://edu.gcfglobal.org/en/osxbasics/working-with-files/1/">OS X Basics — Working with Files</a>
            <span class="link-url">edu.gcfglobal.org/en/osxbasics</span>
          </span>
        </div>
        <div class="link-row">
          <span class="link-ico">↗</span>
          <span class="link-body">
            <a href="https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/Dealing_with_files">MDN — Dealing with files</a>
            <span class="link-url">developer.mozilla.org/en-US/docs/Learn</span>
          </span>
        </div>
        <div class="link-row">
          <span class="link-ico">↗</span>
          <span class="link-body">
            <a href="https://www.computerhope.com/issues/ch000573.htm">Computer Hope — How to view file extensions</a>
            <span class="link-url">computerhope.com/issues/ch000573</span>
          </span>
        </div>
      </div>
    </div>`,

  resourcesB: `
    <div class="content">
      <h3>Working With Files</h3>
      <div class="link-stack">
        <div class="link-row">
          <span class="link-ico">↗</span>
          <span class="link-body">
            <a href="https://edu.gcfglobal.org/en/windowsbasics/working-with-files/1/">Windows Basics — Working with Files</a>
            <span class="link-url">edu.gcfglobal.org/en/windowsbasics</span>
          </span>
        </div>
      </div>
      <p>Optional extras if you want to go deeper:</p>
      <ul class="plain-links">
        <li><a href="https://edu.gcfglobal.org/en/osxbasics/working-with-files/1/">OS X Basics — Working with Files</a><span class="link-url">edu.gcfglobal.org</span></li>
        <li><a href="https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/Dealing_with_files">MDN — Dealing with files</a><span class="link-url">developer.mozilla.org</span></li>
        <li><a href="https://www.computerhope.com/issues/ch000573.htm">Computer Hope — How to view file extensions</a><span class="link-url">computerhope.com</span></li>
      </ul>
    </div>`,

  estA: `
    <div class="content">
      <p>In this topic we will be discussing what files and folders are on a computer system.</p>
      <p class="est-chip">EST. TIME · 25–30 MIN</p>
    </div>`,

  estB: `
    <div class="content">
      <p>In this topic we will be discussing what files and folders are on a computer system.</p>
      <p class="est-line"><strong>Estimated time:</strong> 25–30 minutes</p>
    </div>`,

  checkpoint: `
    <div class="content">
      <div class="checkpoint">
        <span class="checkpoint-mark">✓</span>
        <div class="checkpoint-body">
          <span class="checkpoint-title">CHECKPOINT</span>
          <p>You can rename a file, show filename extensions, and zip a folder.
          If any of those feel shaky, rewatch Video 1 before starting the assignment.</p>
        </div>
      </div>
    </div>`,

  support: `
    <div class="content">
      <div class="callout callout-warning">
        <div class="callout-head"><span class="callout-ico">!</span><span class="callout-title">WARNING</span></div>
        <p>Don't edit files on github.com directly — always pull, edit locally,
        commit, and push. <a href="#">See the Git workflow page</a> for a refresher.</p>
      </div>
      <div class="callout callout-note">
        <div class="callout-head"><span class="callout-ico">i</span><span class="callout-title">NOTE</span></div>
        <p>Spaces in filenames become <code>%20</code> in URLs. Use hyphens instead.</p>
      </div>
      <p>Read the page <a class="wikilink" href="#">web-dev-file-naming-rules-2</a> and be
      ready to be tested on its content. Press <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>.</kbd>
      to show hidden files.</p>
      <pre><code>.profile-card {
  border-radius: 14px;
  box-shadow: 0 2px 8px hsl(220 30% 10% / 0.08);
}</code></pre>
    </div>`
};
