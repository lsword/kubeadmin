<template>
  <div class="markdown_body" v-html="markdown.render(markdownData?markdownData:'')"></div>
</template>

<script lang="ts" setup>
  import MarkdownIt from "markdown-it"; 
  import MarkdownItAnchor from "markdown-it-anchor";
  import MarkdownItHighlightjs from "markdown-it-highlightjs";
  import MarkdownItTOC from "markdown-it-toc-done-right";
  // import MarkdownItAbbr from "markdown-it-abbr";
  // import MarkdownItFootnote from "markdown-it-footnote";
  // import MarkdownItSub from "markdown-it-sub";
  // import MarkdownItSup from "markdown-it-sup";
  // import MarkdownItTasklists from "markdown-it-task-lists";

  const props = defineProps({
    markdownData: String,
  })

  const markdown = new MarkdownIt({
    html: true,
    langPrefix: '',
    typographer: true,
    linkify: true
  })
  .use(MarkdownItAnchor)
  .use(MarkdownItHighlightjs)
  .use(MarkdownItTOC);

  /*
  .use(MarkdownItAbbr)
  .use(MarkdownItFootnote)
  .use(MarkdownItSub)
  .use(MarkdownItSup)
  .use(MarkdownItTasklists)
  */

</script>

<script lang="ts">
  export default {
    name: 'ConfEditor',
  };
</script>

<style scoped lang="less">
  .topo {
    padding: 0 20px 20px 20px;
  }
</style>

<style lang="less">
  .markdown_body {
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
    line-height: 1.5;
    // color: #fff;
    // color: #333;
    color: currentColor;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    font-size: 14px;
    line-height: 1.5;
    word-wrap: break-word;
  }

  .markdown_body .pl-c {
    color: #969896;
  }

  .markdown_body .pl-c1,
  .markdown_body .pl-s .pl-v {
    color: #0086b3;
  }

  .markdown_body .pl-e,
  .markdown_body .pl-en {
    color: #795da3;
  }

  .markdown_body .pl-smi,
  .markdown_body .pl-s .pl-s1 {
    color: #333;
  }

  .markdown_body .pl-ent {
    color: #63a35c;
  }

  .markdown_body .pl-k {
    color: #a71d5d;
  }

  .markdown_body .pl-s,
  .markdown_body .pl-pds,
  .markdown_body .pl-s .pl-pse .pl-s1,
  .markdown_body .pl-sr,
  .markdown_body .pl-sr .pl-cce,
  .markdown_body .pl-sr .pl-sre,
  .markdown_body .pl-sr .pl-sra {
    color: #183691;
  }

  .markdown_body .pl-v {
    color: #ed6a43;
  }

  .markdown_body .pl-id {
    color: #b52a1d;
  }

  .markdown_body .pl-ii {
    color: #f8f8f8;
    background-color: #b52a1d;
  }

  .markdown_body .pl-sr .pl-cce {
    font-weight: bold;
    color: #63a35c;
  }

  .markdown_body .pl-ml {
    color: #693a17;
  }

  .markdown_body .pl-mh,
  .markdown_body .pl-mh .pl-en,
  .markdown_body .pl-ms {
    font-weight: bold;
    color: #1d3e81;
  }

  .markdown_body .pl-mq {
    color: #008080;
  }

  .markdown_body .pl-mi {
    font-style: italic;
    color: #333;
  }

  .markdown_body .pl-mb {
    font-weight: bold;
    color: #333;
  }

  .markdown_body .pl-md {
    color: #bd2c00;
    background-color: #ffecec;
  }

  .markdown_body .pl-mi1 {
    color: #55a532;
    background-color: #eaffea;
  }

  .markdown_body .pl-mdr {
    font-weight: bold;
    color: #795da3;
  }

  .markdown_body .pl-mo {
    color: #1d3e81;
  }

  .markdown_body .octicon {
    display: inline-block;
    vertical-align: text-top;
    fill: currentColor;
  }

  .markdown_body a {
    background-color: transparent;
    -webkit-text-decoration-skip: objects;
  }

  .markdown_body a:active,
  .markdown_body a:hover {
    outline-width: 0;
  }

  .markdown_body strong {
    font-weight: inherit;
  }

  .markdown_body strong {
    font-weight: bolder;
  }

  .markdown_body h1 {
    font-size: 2em;
    margin: 0.67em 0;
  }

  .markdown_body img {
    border-style: none;
  }

  .markdown_body svg:not(:root) {
    overflow: hidden;
  }

  .markdown_body code,
  .markdown_body kbd,
  .markdown_body pre {
    font-family: monospace, monospace;
    font-size: 1em;
  }

  .markdown_body hr {
    box-sizing: content-box;
    height: 0;
    overflow: visible;
  }

  .markdown_body input {
    font: inherit;
    margin: 0;
  }

  .markdown_body input {
    overflow: visible;
  }

  .markdown_body [type="checkbox"] {
    box-sizing: border-box;
    padding: 0;
  }

  .markdown_body * {
    box-sizing: border-box;
  }

  .markdown_body input {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
  }

  .markdown_body a {
    color: #4078c0;
    text-decoration: none;
  }

  .markdown_body a:hover,
  .markdown_body a:active {
    text-decoration: underline;
  }

  .markdown_body strong {
    font-weight: 600;
  }

  .markdown_body hr {
    height: 0;
    margin: 15px 0;
    overflow: hidden;
    background: transparent;
    border: 0;
    border-bottom: 1px solid #ddd;
  }

  .markdown_body hr::before {
    display: table;
    content: "";
  }

  .markdown_body hr::after {
    display: table;
    clear: both;
    content: "";
  }

  .markdown_body table {
    border-spacing: 0;
    border-collapse: collapse;
  }

  .markdown_body td,
  .markdown_body th {
    padding: 0;
  }

  .markdown_body h1,
  .markdown_body h2,
  .markdown_body h3,
  .markdown_body h4,
  .markdown_body h5,
  .markdown_body h6 {
    margin-top: 0;
    margin-bottom: 0;
  }

  .markdown_body h1 {
    font-size: 32px;
    font-weight: 600;
  }

  .markdown_body h2 {
    font-size: 24px;
    font-weight: 600;
  }

  .markdown_body h3 {
    font-size: 20px;
    font-weight: 600;
  }

  .markdown_body h4 {
    font-size: 16px;
    font-weight: 600;
  }

  .markdown_body h5 {
    font-size: 14px;
    font-weight: 600;
  }

  .markdown_body h6 {
    font-size: 12px;
    font-weight: 600;
  }

  .markdown_body p {
    margin-top: 0;
    margin-bottom: 10px;
  }

  .markdown_body blockquote {
    margin: 0;
  }

  .markdown_body ul,
  .markdown_body ol {
    padding-left: 0;
    margin-top: 0;
    margin-bottom: 0;
  }

  .markdown_body ol ol,
  .markdown_body ul ol {
    list-style-type: lower-roman;
  }

  .markdown_body ul ul ol,
  .markdown_body ul ol ol,
  .markdown_body ol ul ol,
  .markdown_body ol ol ol {
    list-style-type: lower-alpha;
  }

  .markdown_body dd {
    margin-left: 0;
  }

  .markdown_body code {
    font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace;
    font-size: 12px;
  }

  .markdown_body pre {
    margin-top: 0;
    margin-bottom: 0;
    font: 12px Consolas, "Liberation Mono", Menlo, Courier, monospace;
  }

  .markdown_body .octicon {
    vertical-align: text-bottom;
  }

  .markdown_body input {
    -webkit-font-feature-settings: "liga" 0;
    font-feature-settings: "liga" 0;
  }

  .markdown_body::before {
    display: table;
    content: "";
  }

  .markdown_body::after {
    display: table;
    clear: both;
    content: "";
  }

  .markdown_body>*:first-child {
    margin-top: 0 !important;
  }

  .markdown_body>*:last-child {
    margin-bottom: 0 !important;
  }

  .markdown_body a:not([href]) {
    color: inherit;
    text-decoration: none;
  }

  .markdown_body .anchor {
    float: left;
    padding-right: 4px;
    margin-left: -20px;
    line-height: 1;
  }

  .markdown_body .anchor:focus {
    outline: none;
  }

  .markdown_body p,
  .markdown_body blockquote,
  .markdown_body ul,
  .markdown_body ol,
  .markdown_body dl,
  .markdown_body table,
  .markdown_body pre {
    margin-top: 0;
    margin-bottom: 16px;
  }

  .markdown_body hr {
    height: 0.25em;
    padding: 0;
    margin: 24px 0;
    background-color: #e7e7e7;
    border: 0;
  }

  .markdown_body blockquote {
    padding: 0 1em;
    color: #777;
    border-left: 0.25em solid #ddd;
  }

  .markdown_body blockquote>:first-child {
    margin-top: 0;
  }

  .markdown_body blockquote>:last-child {
    margin-bottom: 0;
  }

  .markdown_body kbd {
    display: inline-block;
    padding: 3px 5px;
    font-size: 11px;
    line-height: 10px;
    color: #555;
    vertical-align: middle;
    background-color: #fcfcfc;
    border: solid 1px #ccc;
    border-bottom-color: #bbb;
    border-radius: 3px;
    box-shadow: inset 0 -1px 0 #bbb;
  }

  .markdown_body h1,
  .markdown_body h2,
  .markdown_body h3,
  .markdown_body h4,
  .markdown_body h5,
  .markdown_body h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
  }

  .markdown_body h1 .octicon-link,
  .markdown_body h2 .octicon-link,
  .markdown_body h3 .octicon-link,
  .markdown_body h4 .octicon-link,
  .markdown_body h5 .octicon-link,
  .markdown_body h6 .octicon-link {
    color: #000;
    vertical-align: middle;
    visibility: hidden;
  }

  .markdown_body h1:hover .anchor,
  .markdown_body h2:hover .anchor,
  .markdown_body h3:hover .anchor,
  .markdown_body h4:hover .anchor,
  .markdown_body h5:hover .anchor,
  .markdown_body h6:hover .anchor {
    text-decoration: none;
  }

  .markdown_body h1:hover .anchor .octicon-link,
  .markdown_body h2:hover .anchor .octicon-link,
  .markdown_body h3:hover .anchor .octicon-link,
  .markdown_body h4:hover .anchor .octicon-link,
  .markdown_body h5:hover .anchor .octicon-link,
  .markdown_body h6:hover .anchor .octicon-link {
    visibility: visible;
  }

  .markdown_body h1 {
    padding-bottom: 0.3em;
    font-size: 2em;
    border-bottom: 1px solid #eee;
  }

  .markdown_body h2 {
    padding-bottom: 0.3em;
    font-size: 1.5em;
    border-bottom: 1px solid #eee;
  }

  .markdown_body h3 {
    font-size: 1.25em;
  }

  .markdown_body h4 {
    font-size: 1em;
  }

  .markdown_body h5 {
    font-size: 0.875em;
  }

  .markdown_body h6 {
    font-size: 0.85em;
    color: #777;
  }

  .markdown_body ul,
  .markdown_body ol {
    padding-left: 2em;
  }

  .markdown_body ul ul,
  .markdown_body ul ol,
  .markdown_body ol ol,
  .markdown_body ol ul {
    margin-top: 0;
    margin-bottom: 0;
  }

  .markdown_body li>p {
    margin-top: 16px;
  }

  .markdown_body li+li {
    margin-top: 0.25em;
  }

  .markdown_body dl {
    padding: 0;
  }

  .markdown_body dl dt {
    padding: 0;
    margin-top: 16px;
    font-size: 1em;
    font-style: italic;
    font-weight: bold;
  }

  .markdown_body dl dd {
    padding: 0 16px;
    margin-bottom: 16px;
  }

  .markdown_body table {
    display: block;
    width: 100%;
    overflow: auto;
  }

  .markdown_body table th {
    font-weight: bold;
  }

  .markdown_body table th,
  .markdown_body table td {
    padding: 6px 13px;
    border: 1px solid #ddd;
  }

  .markdown_body table tr {
    // background-color: #fff;
    background-color: transparent;
    border-top: 1px solid #ccc;
  }

  .markdown_body table tr:nth-child(2n) {
    // background-color: #f8f8f8;
    background-color: rgba(0,0,0,0.04);
  }

  .markdown_body img {
    max-width: 100%;
    box-sizing: content-box;
    background-color: #fff;
  }

  .markdown_body code {
    padding: 0;
    padding-top: 0.2em;
    padding-bottom: 0.2em;
    margin: 0;
    font-size: 85%;
    background-color: rgba(0,0,0,0.04);
    border-radius: 3px;
  }

  .markdown_body code::before,
  .markdown_body code::after {
    letter-spacing: -0.2em;
    content: "\00a0";
  }

  .markdown_body pre {
    word-wrap: normal;
  }

  .markdown_body pre>code {
    padding: 0;
    margin: 0;
    font-size: 100%;
    word-break: normal;
    white-space: pre;
    background: transparent;
    border: 0;
  }

  .markdown_body .highlight {
    margin-bottom: 16px;
  }

  .markdown_body .highlight pre {
    margin-bottom: 0;
    word-break: normal;
  }

  .markdown_body .highlight pre,
  .markdown_body pre {
    padding: 16px;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
    // background-color: #f7f7f7;
    background-color: rgba(0,0,0,0.04);
    border-radius: 3px;
  }

  .markdown_body pre code {
    display: inline;
    max-width: auto;
    padding: 0;
    margin: 0;
    overflow: visible;
    line-height: inherit;
    word-wrap: normal;
    background-color: transparent;
    border: 0;
  }

  .markdown_body pre code::before,
  .markdown_body pre code::after {
    content: normal;
  }

  .markdown_body .pl-0 {
    padding-left: 0 !important;
  }

  .markdown_body .pl-1 {
    padding-left: 3px !important;
  }

  .markdown_body .pl-2 {
    padding-left: 6px !important;
  }

  .markdown_body .pl-3 {
    padding-left: 12px !important;
  }

  .markdown_body .pl-4 {
    padding-left: 24px !important;
  }

  .markdown_body .pl-5 {
    padding-left: 36px !important;
  }

  .markdown_body .pl-6 {
    padding-left: 48px !important;
  }

  .markdown_body .full-commit .btn-outline:not(:disabled):hover {
    color: #4078c0;
    border: 1px solid #4078c0;
  }

  .markdown_body kbd {
    display: inline-block;
    padding: 3px 5px;
    font: 11px Consolas, "Liberation Mono", Menlo, Courier, monospace;
    line-height: 10px;
    color: #555;
    vertical-align: middle;
    background-color: #fcfcfc;
    border: solid 1px #ccc;
    border-bottom-color: #bbb;
    border-radius: 3px;
    box-shadow: inset 0 -1px 0 #bbb;
  }

  .markdown_body :checked+.radio-label {
    position: relative;
    z-index: 1;
    border-color: #4078c0;
  }

  .markdown_body .task-list-item {
    list-style-type: none;
  }

  .markdown_body .task-list-item+.task-list-item {
    margin-top: 3px;
  }

  .markdown_body .task-list-item input {
    margin: 0 0.2em 0.25em -1.6em;
    vertical-align: middle;
  }

  .markdown_body hr {
    border-bottom-color: #eee;
  }
</style>
