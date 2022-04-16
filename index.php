<?php

// Base URL of the website, without trailing slash.
// $base_url = 'http://localhost';
$base_url = 'https://www.tooln.cn';

// Path to the directory to save the notes in, without trailing slash.
// Should be outside of the document root, if possible.
$save_path = '_tmp';

/**
 * 文件默认过期时间，单位：天
 */
$expired_day = 2;

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

/**
 * 文件过期 处理
 */
function fileExpiredHandle()
{
  global $path;
  global $expired_day;
  if (is_file($path)) {
    $mtime = filemtime($path);
    if ((time() - $mtime) >= ($expired_day * 24 * 3600)) {
      unlink($path);
    }
  }
}
fileExpiredHandle();

if (isset($_POST['text'])) {
  if (!empty($_POST['text'])) {
    $text = gzdecode(base64_decode($_POST['text']));
  } else {
    $text = "";
  }

  if ($text !== false) {
    // Update file.
    file_put_contents($path, $text);
    // var_dump($text);
    // If provided input is empty, delete file.
    if (!strlen($text)) {
      unlink($path);
    }
    die;
  }
}

// 如果客户端是curl、wget，或明确要求时，打印原始文件。
if (isset($_GET['raw']) || strpos($_SERVER['HTTP_USER_AGENT'], 'curl') === 0 || strpos($_SERVER['HTTP_USER_AGENT'], 'Wget') === 0) {
  if (is_file($path)) {
    header('Content-type: text/plain');
    print file_get_contents($path);
  } else {
    header('HTTP/1.0 404 Not Found');
  }
  die;
}
?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php print $_GET['note']; ?></title>
  <link rel="icon" href="./favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="./css/style.css" />
  <link rel="stylesheet" href="./css/smstyle.css" />
  <link rel="stylesheet" href="./css/prism.css" />
  <meta http-equiv="x-dns-prefetch-control" content="on" />
  <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />
  <script src="js/msg.js"></script>
  <!--dis-->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror/lib/codemirror.min.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror/theme/mdn-like.min.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror/addon/dialog/dialog.min.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror/addon/hint/show-hint.min.css" />
</head>

<body>
  <div id="box">
    <div class="title">
      <div class="title-text">
        <h4 style="transform:translate(50%, -50%);">✍️ 📔 on ☁️ ,😄</h4>
      </div>
      <?php
      if(is_file($path)){
        echo "<div class=\"time_view\">自动删除倒计时：<span id=\"time_left\"></span></div>";
      }
      ?>
      <form action="/" class="code_box">
        <input type="text" name="code" id="id_code_txt" class="code_txt" value="<?php echo $_GET['note']; ?>" disabled="disabled">
        <div class="code_input_icon"></div>
        <input type="submit" id="id_btn_edit" class="code_btn btn_edit" value="">
      </form>

    </div>
    <br />

    <div class="content">
      <textarea class="text" name="text" cols="100" rows="25" style="display: none"><?php
          if (is_file($path)) {
            print htmlspecialchars(file_get_contents($path), ENT_QUOTES, 'UTF-8');
          }?></textarea>
      <div class="markdown" style="display: none"></div>
    </div>
    <div id="btn">
      <hr />
      <button id="btn01">扫码</button>
      <button id="btn02">复制</button>
      <button id="btn03" class="btn_delete">删除</button>
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
    const showMarkdown = <?php print is_file($path) ? 'true' : 'false'; ?>;
    const baseUrl = "<?php print $base_url; ?>";
    const modifiedTime = <?php print is_file($path) ? filemtime($path) + ($expired_day * 24 * 3600) : 'null' ?>;

    
    window.onload = () => {
      function setTimeView() {
        if (sec > 0) {
            var second = Math.floor(sec % 60);
            var minite = Math.floor((sec / 60) % 60);
            var hour = Math.floor((sec / 3600) % 24);
            var day = Math.floor((sec / 3600) / 24);

            var minite_view = minite + "分钟";
            var hour_view = hour + "小时";
            var day_view = day + "天";

            if(minite === 0) {
                minite_view = '';
            }
            if(hour === 0) {
                hour_view = '';
            }
            if(day === 0) {
                day_view = '';
            }
            second = prefixInteger(second,2);
            $("#time_left").html(`${day_view}${hour_view}${minite_view}${second}秒`);
            sec = sec - 1;
        }
        else {
            window.location.reload();
        }
      }

      function prefixInteger(num, length) {
        return (Array(length).join('0') + num).slice(-length);
      }


      if($(".time_view").length > 0){
        var now = new Date().getTime();
        var sec = Math.ceil(modifiedTime - (now /1000));
        if (sec > 1){
            window.setInterval(setTimeView, 1000);
        }
      }
    }
  </script>
  <script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/codemirror/lib/codemirror.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/codemirror/addon/edit/continuelist.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/codemirror/addon/edit/matchbrackets.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/codemirror/addon/edit/closebrackets.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/codemirror/mode/markdown/markdown.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/codemirror/addon/search/search.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/codemirror/addon/search/searchcursor.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/codemirror/addon/dialog/dialog.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/codemirror/addon/display/placeholder.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/codemirror/addon/wrap/hardwrap.min.js"></script>
  <!--提示-->
  <script src="https://cdn.jsdelivr.net/npm/codemirror/addon/hint/show-hint.min.js"></script>
  <script src="./js/prism.js"></script>
  <script src="./js/main.js"></script>
  <!--gzip-->
  <script async src="https://cdn.jsdelivr.net/npm/pako@1.0.10/dist/pako.min.js"></script>
</body>

</html>