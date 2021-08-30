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
  editor.on("change", editorOnHandler);

  function editorOnHandler(cm, co) {
    console.log(cm.getValue());
  }

  //Copy Text
  $("#btn02").click(() => {
    copyToClip(editor.getValue());
    msg.success("复制成功");
  });

  //Copy Url
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
    console.log(isChecked);
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
