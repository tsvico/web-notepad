function msg_init(fun) {
  if (typeof EventSource !== "undefined") {
    var source = new EventSource(`stream.php?note=${note}`);
    //监听test事件
    source.addEventListener("content", (event) => {
      const data = unzip(event.data);
      fun(data);
    });
  } else {
    msg.failure("您的浏览器不支持SSE,无法实时刷新");
  }
}

/**
 * 解压
 * @param {*} base64str base64压缩串
 * @returns
 */
function unzip(base64str) {
  let strData = atob(base64str);
  const charData = strData.split("").map((x) => x.charCodeAt(0));
  const binData = new Uint8Array(charData);
  const data = pako.inflate(binData);
  strData = Utf8ArrayToStr(data);
  return strData;
}

/**
 * utf-8 Array 转化字符串
 * @param array Utf8Array
 * @returns {string}
 * @constructor
 */
function Utf8ArrayToStr(array) {
  var charCache = new Array(128); // Preallocate the cache for the common single byte chars
  var charFromCodePt = String.fromCodePoint || String.fromCharCode;
  var result = [];
  var codePt, byte1;
  var buffLen = array.length;

  result.length = 0;

  for (var i = 0; i < buffLen; ) {
    byte1 = array[i++];

    if (byte1 <= 0x7f) {
      codePt = byte1;
    } else if (byte1 <= 0xdf) {
      codePt = ((byte1 & 0x1f) << 6) | (array[i++] & 0x3f);
    } else if (byte1 <= 0xef) {
      codePt = ((byte1 & 0x0f) << 12) | ((array[i++] & 0x3f) << 6) | (array[i++] & 0x3f);
    } else if (String.fromCodePoint) {
      codePt = ((byte1 & 0x07) << 18) | ((array[i++] & 0x3f) << 12) | ((array[i++] & 0x3f) << 6) | (array[i++] & 0x3f);
    } else {
      codePt = 63; // Cannot convert four byte code points, so use "?" instead
      i += 3;
    }

    result.push(charCache[codePt] || (charCache[codePt] = charFromCodePt(codePt)));
  }

  return result.join("");
}
