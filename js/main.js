(function () {
  const inputChange = debounce((changeValue) => {
    uploadContent(changeValue);
  }, 1000);
  let txt = $(".text").val();

  function changePreviewStatus(vditor) {
    vditor.vditor.toolbar.elements.preview.firstElementChild.dispatchEvent(new CustomEvent("click"));
  }

  const vditor = new Vditor("vditor", {
    mode: "sv",
    height: "100%",
    debugger: false,
    // 禁用缓存
    cache: {
      enable: false,
    },
    cdn: "https://unpkg.com/vditor@3.8.15",
    input(changeValue) {
      inputChange(changeValue);
    },
    preview: {
      markdown: {
        toc: true,
        mark: true,
        footnotes: true,
        autoSpace: true,
      },
      hljs: {
        enable: true,
        style: "monokailight",
      },
      math: {
        engine: "KaTeX",
      },
    },
    toolbar: [
      "emoji",
      "headings",
      "bold",
      "italic",
      "strike",
      "link",
      "|",
      "list",
      "ordered-list",
      "check",
      "outdent",
      "indent",
      "|",
      "quote",
      "line",
      "code",
      "inline-code",
      "insert-before",
      "insert-after",
      "|",
      "upload",
      "table",
      "|",
      "undo",
      "redo",
      "|",
      "fullscreen",
      "edit-mode",
      {
        name: "more",
        toolbar: ["both", "code-theme", "content-theme", "outline", "preview"],
      },
    ],
    upload: {
      url: "#",
      accept: "image/*",
      multiple: false,
      handler(file) {
        if (file[0].size > 20 * 1024) {
          msg.failure("暂时不支持太大的图片<br>可以在新页面上传后<br>复制markdown格式链接粘贴到此处");
          setTimeout(() => {
            let aDom = document.createElement("a");
            aDom.target = "_blank";
            aDom.href = "https://imgtu.com/";
            aDom.click();
          }, 2000);
          return;
        }
        fileUpload(file[0], (url) => {
          if (!url) {
            msg.failure("未获取到地址");
            return;
          }
          vditor.insertValue(`![tmp](${url})\n\n`);
        });
      },
    },
    after: () => {
      if (showMarkdown) {
        if (!txt) {
          // 没有文本
          msg.failure("没有获取到任何内容");
          document.getElementById("markdownSwitch").checked = false;
          return;
        }
        document.getElementById("markdownSwitch").checked = true;
        changePreviewStatus(vditor);
      }
    },
  });

  // Copy Text
  $("#btn02").click(() => {
    copyToClip(vditor.getValue());
    msg.success("复制成功");
  });

  // 删除
  $("#btn03").click(() => {
    let txt = vditor.getValue();
    if (!txt) {
      // 没有文本
      msg.failure("没有获取到任何内容,无需进行此操作");
      return;
    }
    msg.confirm({
      text: "确定要删除吗？此操作将清空当前内容,请谨慎操作",
      buttons: {
        确定: function () {
          vditor.setValue("");
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

  // 预览按钮
  $("#md").click(() => {
    let isChecked = document.getElementById("markdownSwitch").checked;
    if (!isChecked) {
      let txt = vditor.getValue();
      if (!txt) {
        // 没有文本
        msg.failure("没有获取到任何内容");
        document.getElementById("markdownSwitch").checked = true;
        return;
      }
      vditor.disabled();
      changePreviewStatus(vditor);
    } else {
      vditor.enable();
      changePreviewStatus(vditor);
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
  msg.loading("上传中...");
  var reader = new FileReader();
  reader.onload = function (e) {
    msg.close();
    msg.success("上传成功,点击Markdown View可以预览");
    if (callback) {
      callback(e.target.result || "");
    }
  };
  reader.readAsDataURL(fileObj);
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
