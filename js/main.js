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
    matchBrackets: true, //括号匹配
    extraKeys: { Enter: "newlineAndIndentContinueMarkdownList" },
    // placeholder:,
  });
  // prettier-ignore
  editor.on("change",debounce((cm) => {
      uploadContent(cm.getValue());
    }, 1000)
  );

  editor.on("paste", function (editor, e) {
    // console.log(e.clipboardData)
    if (!(e.clipboardData && e.clipboardData.items)) {
      msg.failure("该浏览器不支持操作");
      return;
    }
    for (var i = 0, len = e.clipboardData.items.length; i < len; i++) {
      var item = e.clipboardData.items[i];
      // console.log(item.kind+":"+item.type);
      if (item.kind === "string") {
        item.getAsString(function (str) {
          // str 是获取到的字符串
        });
      } else if (item.kind === "file") {
        var pasteFile = item.getAsFile();
        // pasteFile就是获取到的文件
        fileUpload(pasteFile, (url) => {
          if (!url) {
            msg.failure("未获取到地址");
            return;
          }
          editor.replaceSelection(`![临时图片](${url})\n`);
        });
      }
    }
  });

  editor.on("drop", function (editor, e) {
    // console.log(e.dataTransfer.files[0]);
    if (!(e.dataTransfer && e.dataTransfer.files)) {
      msg.failure("该浏览器不支持操作");
      return;
    }
    for (var i = 0; i < e.dataTransfer.files.length; i++) {
      console.log(e.dataTransfer.files[i]);
      fileUpload(e.dataTransfer.files[i], (url) => {
        if (!url) {
          msg.failure("未获取到地址");
          return;
        }
        editor.replaceSelection(`![临时图片](${url})\n`);
      });
    }
    e.preventDefault();
  });

  // Copy Text
  $("#btn02").click(() => {
    copyToClip(editor.getValue());
    msg.success("复制成功");
  });

  // 删除
  $("#btn03").click(() => {
    let txt = editor.getValue();
    if (!txt) {
      // 没有文本
      msg.failure("没有获取到任何内容,无需进行此操作");
      return;
    }
    msg.confirm({
      text: "确定要删除吗？此操作将清空当前内容,请谨慎操作",
      buttons: {
        确定: function () {
          editor.setValue("");
          uploadContent("");
          msg.loading("同步中");
          setTimeout(() => {
            location.reload();
            msg.close();
          }, 1000);
        },
        取消: function () {
          msg.success("已取消");
        },
      },
    });
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
      markdown.html(marked.parse(txt));
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

  $(".code_box").submit(function () {
    var btn = $("#id_btn_edit");
    var txt = $("#id_code_txt");

    if (btn.hasClass("btn_edit")) {
      btn.removeClass("btn_edit").addClass("btn_go");
      txt.attr("disabled", false).addClass("txt_edit_able");
      $(".btn_delete").attr("disabled", true);
    } else if (btn.hasClass("btn_go")) {
      var code_val = txt.val();
      code_val = $.trim(code_val);
      if (/\W/.test(code_val)) {
        msg.failure("只允许英文与数字");
        return false;
      }
      console.log(baseUrl + "/" + encodeURI(code_val));
      window.location.href = baseUrl + "/" + encodeURI(code_val);
    }

    return false;
  });

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
      markdown.html(marked.parse(txt));
      $(".markdown pre code").each(function (i, block) {
        Prism.highlightElement(block);
      });
      msg.close();
      markdown.show(); // 显示元素
    }
    // window.location.pathname
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
      request.send("text=" + encodeURIComponent(zip(text)));
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

/**
 * 压缩
 * @param {*} str
 * @returns
 */
function zip(str) {
  if (!str) {
    return "";
  }
  const binaryString = pako.gzip(str, { to: "string" });
  return btoa(binaryString);
}

/**
 * 文件上传
 * @param {*} fileObj 文件
 * @param {*} callback 回调函数
 */
function fileUpload(fileObj, callback) {
  var data = new FormData();
  msg.loading("上传中...");
  /**以下上传代码根据实际情况替换 */
  data.append("image", fileObj);
  data.append("token", "8337effca0ddfcd9c5899f3509b23657");
  var xhr = new XMLHttpRequest();
  xhr.open("post", "https://xx.img", true);
  /************ */
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      const result = JSON.parse(xhr.responseText || "{}");
      msg.close();
      msg.success("上传成功，图片将在24后删除");
      if (callback) {
        callback(result.url || "");
      }
    }
  };
  xhr.send(data);
}

/**
 * 阻止浏览器默认打开拖拽文件的行为
 */
window.addEventListener(
  "drop",
  (e) => {
    e = e || event;
    e.preventDefault();
    if (e.target.tagName == "textarea") {
      // check wich element is our target
      e.preventDefault();
    }
  },
  false
);

if (!window.localStorage.getItem("msg")) {
  msg.confirm({
    text: "使用说明：\n第一步：点上面的齿轮(会变成蓝色箭头)，设置一个用来传递消息的地址（可以使用常用的ID、特殊简写或手机号等任意内容，最好跟别人不冲突），点击蓝色箭头进入该地址。 \n第二步：输入或粘贴内容到这里，此内容将会自动保存。(支持markdown、支持图片粘贴/拖拽上传)。\n第三步：以二维码方式或复制URL地址分享给别人/其他设备。\n第四步：在另一台设备上以同样的方式进入之前的地址，就会看到之前保存的内容。\n\n保存后内容仅保留48小时".replaceAll(
      "\n",
      "<br>"
    ),
    buttons: {
      不再弹出: function () {
        window.localStorage.setItem("msg", false);
      },
      确定: function () {},
    },
  });
}
