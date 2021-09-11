<?php

// Base URL of the website, without trailing slash.
$base_url = 'http://www.peoplevip.cn';

// Path to the directory to save the notes in, without trailing slash.
// Should be outside of the document root, if possible.
$save_path = '_tmp';

// Disable caching.
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// If no name is provided or it contains invalid characters or it is too long.
if (!isset($_GET['note']) || !preg_match('/^[a-zA-Z0-9_-]+$/', $_GET['note']) || strlen($_GET['note']) > 64) {

    // Generate a name with 5 random unambiguous characters. Redirect to it.
    header("Location: $base_url/" . substr(str_shuffle('234579abcdefghjkmnpqrstwxyz'), -5));
    die;
}

$path = $save_path . '/' . $_GET['note'];

if (isset($_POST['text'])) {

    // Update file.
    file_put_contents($path, $_POST['text']);

    // If provided input is empty, delete file.
    if (!strlen($_POST['text'])) {
        unlink($path);
    }
    die;
}

// Print raw file if the client is curl, wget, or when explicitly requested.
if (isset($_GET['raw']) || strpos($_SERVER['HTTP_USER_AGENT'], 'curl') === 0 || strpos($_SERVER['HTTP_USER_AGENT'], 'Wget') === 0) {
    if (is_file($path)) {
        header('Content-type: text/plain');
        print file_get_contents($path);
    } else {
        header('HTTP/1.0 404 Not Found');
    }
    die;
}
?><!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="generator" content="Minimalist Web Notepad (https://github.com/pereorga/minimalist-web-notepad)">
    <title><?php print $_GET['note']; ?></title>
    <link rel="shortcut icon" href="<?php print $base_url; ?>/favicon.ico">
    <link rel="stylesheet" href="<?php print $base_url; ?>/css/style.css" />
    <link rel="stylesheet" href="<?php print $base_url; ?>/css/prism.css" />
    <meta http-equiv="x-dns-prefetch-control" content="on" />
    <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />
    <script src="js/msg.js"></script>
    <!--dis-->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror/lib/codemirror.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror/theme/mdn-like.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror/addon/dialog/dialog.css" />
</head>
<body>
<div id="box">
      <div class="title">
        ✍️ 📔 on ☁️ ,😄
      </div>
      <br />

      <div class="content">
        <textarea class="text" name="text" cols="100" rows="25" style="display: none"><?php
            if (is_file($path)) {
                print htmlspecialchars(file_get_contents($path), ENT_QUOTES, 'UTF-8');
            }
        ?></textarea>
        <div class="markdown" style="display: none"></div>
      </div>

      <div id="btn">
        <hr />
        <button id="btn01">URL QrCode</button>
        <button id="btn02">Copy Text</button>
        <div class="lab">
          <input type="checkbox" name="" id="markdownSwitch" />
          <label id="md" class="switch" for="markdownSwitch">
            <span class="ball"></span>
          </label>
          <span class="btntext">Markdown View</span>
        </div>
      </div>
    </div>
    <script>
        const showMarkdown = <?php print is_file($path) ? 'true' : 'false';?>;
    </script>
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/codemirror/lib/codemirror.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/codemirror/addon/edit/continuelist.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/codemirror/addon/edit/matchbrackets.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/codemirror/addon/edit/closebrackets.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/codemirror/mode/markdown/markdown.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/codemirror/keymap/sublime.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/codemirror/addon/search/search.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/codemirror/addon/search/searchcursor.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/codemirror/addon/dialog/dialog.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/codemirror/addon/comment/comment.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/codemirror/addon/wrap/hardwrap.js"></script>
    <script src="<?php print $base_url; ?>/js/prism.js"></script>
    <script src="<?php print $base_url; ?>/js/main.js"></script>
</body>
</html>
