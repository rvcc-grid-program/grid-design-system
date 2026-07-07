---
title: "Specimen: every GRID component"
module_title: "Grid design system — regression specimen"
type: page
---

This page exercises every component in the GRID course-content design
system. Rebuild it after ANY change to the system CSS and compare both
outputs. The text mimics real course content on purpose.

**Estimated time: 25-30 minutes.**

::: objectives

When you have completed this topic you will be able to:

- Understand how the folder and file system works on your computer
- Understand the importance of filename extensions
- Know the file naming rules for web development

:::

## Watching

### Video 1: File System Basics (~15min)

[![Video](https://img.youtube.com/vi/hw7TwIf1rOw/hqdefault.jpg)](https://youtu.be/hw7TwIf1rOw)

## Reading

You should choose the reading assignment for the computer(s) you will be
using for your web development assignments this semester.

### Working with files

Web developers must be confident with naming, renaming, finding, copying,
moving, deleting, downloading, and uploading files.

#### Before you start

Make sure filename extensions are visible on your machine. Press
<kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>.</kbd> to show hidden files in the
Finder open dialog.

Filenames are [case-sensitive]{.hl} on most servers, so treat
[my-file.html]{.hl-pill} and [My-File.html]{.hl-pill} as two different
files. When in doubt, [lowercase everything]{.hl-highlighter}.
<span class="tag">Tested</span>

::: link-row
[Windows Basics — Working with Files](https://edu.gcfglobal.org/en/windowsbasics/working-with-files/1/)
:::

Optional extras if you want to go deeper:

- [OS X Basics — Working with Files](https://edu.gcfglobal.org/en/osxbasics/working-with-files/1/)
- [MDN — Dealing with files](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/Dealing_with_files)

Read the page [[web-dev-file-naming-rules-2]] and be ready to be tested on
its content.

## Doing

Work through these steps in order:

1. Clone your repo and open it in VS Code
2. Rename `My File.HTML` to `my-file.html`
3. Commit with the message `rename: lowercase and hyphens` and push

::: callout-warning
Don't edit files on github.com directly — always pull, edit locally, commit,
and push, or your local copy and the repo will fall out of sync.
:::

::: callout-note
Spaces in filenames become `%20` in URLs. Use hyphens instead.
:::

Add this rule to your stylesheet:

```css
.profile-card {
  border-radius: 14px;
  box-shadow: 0 2px 8px hsl(220 30% 10% / 0.08);
}
```

### Common file extensions

::: data-list

- **.html** — HTML document, the page itself
- **.css** — stylesheet
- **.jpg, .png** — images (photo, lossless)
- **.svg** — vector image, scales without blur

:::

::: checkpoint
You can rename a file, show filename extensions, and zip a folder. If any of
those feel shaky, rewatch Video 1 before starting the assignment.
:::

Questions? Post in the discussion — someone else is probably stuck on the
same thing.
