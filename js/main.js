(function () {
  // marked
  const markedRender = new marked.Renderer();
  marked.setOptions({
    renderer: markedRender,
    gfm: true,
    tables: true,
    breaks: true, // '>' 换行，回车换成 <br>
    pedantic: false,
    smartLists: true,
    smartypants: false,
  });

  // codemirror editor
  const editor = CodeMirror.fromTextArea($(".text").get(0), {
    mode: "markdown",
    lineNumbers: true,
    autoCloseBrackets: true,
    showCursorWhenSelecting: true,
    lineWrapping: true, // 长句子折行
    theme: "mdn-like", // "material",
    keyMap: "sublime",
    matchBrackets: true, //括号匹配
    extraKeys: { Enter: "newlineAndIndentContinueMarkdownList" },
  });
  // prettier-ignore
  editor.on("change",debounce((cm) => {
      uploadContent(cm.getValue());
    }, 2000)
  );

  // Copy Text
  $("#btn02").click(() => {
    copyToClip(editor.getValue());
    msg.success("复制成功");
  });

  // Qrcode 生成
  $("#btn01").click(async () => {
    let thisPageUrl = window.location.href;
    let img = await generateQR(thisPageUrl);
    console.log(img);
    msg.popups({
      text: `<img src='${img}' >`,
      padding: "1px",
      width: "10rem",
      height: "10rem",
    });
  });

  // MarkDown View
  let markdown = $(".markdown");
  let text = $(".CodeMirror");
  $("#md").click(() => {
    let isChecked = document.getElementById("markdownSwitch").checked;
    if (!isChecked) {
      let txt = editor.getValue();
      if (!txt) {
        // 没有文本
        msg.failure("没有获取到任何内容");
        document.getElementById("markdownSwitch").checked = true;
        return;
      }
      text.hide();
      msg.loading("转换中");
      markdown.html(marked(txt));
      $(".markdown pre code").each(function (i, block) {
        Prism.highlightElement(block);
      });
      msg.close();
      markdown.show(); // 显示元素
    } else {
      markdown.hide();
      text.show();
    }
  });

  function copyToClip(content) {
    var aux = document.createElement("textarea");
    aux.value = content;
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);
  }

  const generateQR = async (text) => {
    try {
      return await QRCode.toDataURL(text);
    } catch (err) {
      console.error(err);
    }
  };

  function init() {
    if (showMarkdown) {
      let txt = editor.getValue() || $(".text").val();
      if (!txt) {
        // 没有文本
        msg.failure("没有获取到任何内容");
        document.getElementById("markdownSwitch").checked = false;
        return;
      }
      document.getElementById("markdownSwitch").checked = true;
      editor.setValue(txt);
      text.hide();
      msg.loading("转换中");
      markdown.html(marked(txt));
      $(".markdown pre code").each(function (i, block) {
        Prism.highlightElement(block);
      });
      msg.close();
      markdown.show(); // 显示元素
    }
  }
  init();
})();
let content = $(".text").val();
/**
 * 上传函数
 * @param {*} text 文本
 */
function uploadContent(text) {
  try {
    // If textarea value changes.
    if (content !== text) {
      var request = new XMLHttpRequest();

      request.open("POST", window.location.href, true);
      request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
      request.onload = function () {
        if (request.readyState === 4) {
          // 请求已结束
          content = text;
        }
      };
      request.onerror = function () {
        // 发生错误，1s后重试
        setTimeout(uploadContent(text), 1000);
      };
      request.send("text=" + encodeURIComponent(text));
    }
  } catch (e) {
    console.log("可能是未初始化的错误，忽略此信息", e);
  }
}

/**
 * 防抖函数
 * @param {*} func 函数
 * @param {*} wait 时间 单位毫秒
 * @returns
 */
function debounce(func, wait) {
  var timer;
  return function () {
    var args = arguments; // arguments中存着event

    if (timer) clearTimeout(timer);

    timer = setTimeout(function () {
      func.apply(this, args);
    }, wait);
  };
}
