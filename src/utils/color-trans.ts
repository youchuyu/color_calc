/**
 * RGB to HSL
 * @param {[number, number, number]} rgb - Red,Green,Blue: 0~255
 * @return {[number, number, number]} hsl - Hue: 0~360, Saturation:0~100%, Lightness: 0~100%
 */
export function rgb2hsl([r, g, b]: RGB): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  let l = (max + min) / 2;
  let s = 0;

  if (max === min) {
    h = 0;
  } else if (max === r && g >= b) {
    h = 60 * ((g - b) / diff);
  } else if (max === r && g < b) {
    h = 60 * ((g - b) / diff) + 360;
  } else if (max === g) {
    h = 60 * ((b - r) / diff) + 120;
  } else if (max === b) {
    h = 60 * ((r - g) / diff) + 240;
  }

  if (l === 0 || max === min) {
    s = 0;
  } else if (0 < l && l <= 0.5) {
    s = diff / (2 * l);
  } else if (l > 0.5) {
    s = diff / (2 - 2 * l);
  }

  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function rgb(t: number, p: number, q: number) {
  if (t < 1.0 / 6.0) {
    return p + (q - p) * 6.0 * t;
  } else if (t >= 1.0 / 6.0 && t < 1.0 / 2.0) {
    return q;
  } else if (t >= 1.0 / 2.0 && t < 2.0 / 3.0) {
    return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
  } else {
    return p;
  }
}

function _rgb(t: number) {
  if (t < 0) {
    return t + 1.0;
  } else if (t > 1) {
    return t - 1.0;
  } else {
    return t;
  }
}
/**
 * HSL to RGB
 * @param {[number, number, number]} hsl - Hue: 0~360, Saturation:0~100%, Lightness: 0~100%
 * @param {[number, number, number]} rgb - Red,Green,Blue: 0~255
 */
export function hsl2rgb([h, s, l]: HSL): RGB {
  h /= 360;
  s /= 100;
  l /= 100;

  let r = 0;
  let g = 0;
  let b = 0;
  let p = 0;
  let q = 0;

  if (s === 0) {
    r = g = b = l;
  } else {
    q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
    p = 2.0 * l - q;
    r = rgb(_rgb(h + 1.0 / 3.0), p, q);
    g = rgb(_rgb(h), p, q);
    b = rgb(_rgb(h - 1.0 / 3.0), p, q);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * @param {[number, number, number]} rgb - Red,Green,Blue: 0~255
 * @return {[number, number, number]} hsv - Hue: 0~360, Saturation:0~100%, Value: 0~100%
 */
export function rgb2hsv([r, g, b]: RGB): HSV {
  r /= 255;
  g /= 255;
  b /= 255;
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var diff = max - min;
  var h = 0;
  var v = max;
  var s = max === 0 ? 0 : diff / max; // h

  if (max === min) {
    h = 0;
  } else if (max === r && g >= b) {
    h = 60 * ((g - b) / diff);
  } else if (max === r && g < b) {
    h = 60 * ((g - b) / diff) + 360;
  } else if (max === g) {
    h = 60 * ((b - r) / diff) + 120;
  } else if (max === b) {
    h = 60 * ((r - g) / diff) + 240;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(v * 100)];
}

/**
 * @param {[number, number, number]} hsv - Hue: 0~360, Saturation:0~100%, Value: 0~100%
 * @return {[number, number, number]} rgb - Red,Green,Blue: 0~255
 */
export function hsv2rgb([h, s, v]: HSV): RGB {
  h /= 1;
  s /= 100;
  v /= 100;
  var r = 0;
  var g = 0;
  var b = 0;

  if (s === 0) {
    r = g = b = v;
  } else {
    var _h = h / 60;

    var i = Math.floor(_h);
    var f = _h - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch (i) {
      case 0:
        r = v;
        g = t;
        b = p;
        break;

      case 1:
        r = q;
        g = v;
        b = p;
        break;

      case 2:
        r = p;
        g = v;
        b = t;
        break;

      case 3:
        r = p;
        g = q;
        b = v;
        break;

      case 4:
        r = t;
        g = p;
        b = v;
        break;

      case 5:
        r = v;
        g = p;
        b = q;
        break;
    }
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Lab to RGB
 * @param {[number, number, number]} Lab - Lightness: 0~100, a:-128~127, b:-128~127
 * @returns {[number, number, number]} RGB - Red,Green,Blue: 0~255
 */
export function lab2rgb(lab: Lab): RGB {
  let y = (lab[0] + 16) / 116,
    x = lab[1] / 500 + y,
    z = y - lab[2] / 200,
    r,
    g,
    b;

  x = 0.95047 * (x * x * x > 0.008856 ? x * x * x : (x - 16 / 116) / 7.787);
  y = 1.0 * (y * y * y > 0.008856 ? y * y * y : (y - 16 / 116) / 7.787);
  z = 1.08883 * (z * z * z > 0.008856 ? z * z * z : (z - 16 / 116) / 7.787);

  r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  b = x * 0.0557 + y * -0.204 + z * 1.057;

  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

  return [
    Math.round(Math.max(0, Math.min(1, r)) * 255),
    Math.round(Math.max(0, Math.min(1, g)) * 255),
    Math.round(Math.max(0, Math.min(1, b)) * 255),
  ];
}

/**
 * RGB to Lab
 * @param {[number, number, number]} RGB - Red,Green,Blue: 0~255
 * @returns {[number, number, number]} Lab - Lightness: 0~100, a:-128~127, b:-128~127
 */
export function rgb2lab(rgb: RGB): Lab {
  let r = rgb[0] / 255,
    g = rgb[1] / 255,
    b = rgb[2] / 255,
    x,
    y,
    z;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

  return [
    Math.round(116 * y - 16),
    Math.round(500 * (x - y)),
    Math.round(200 * (y - z)),
  ];
}

/**
 * Hex to RGB
 * @param hex - #RRGGBB
 * @returns {RGB} RGB - Red,Green,Blue: 0~255
 */
export function hex2rgb(hex: string) {
  return [
    parseInt("0x" + hex.slice(1, 3)),
    parseInt("0x" + hex.slice(3, 5)),
    parseInt("0x" + hex.slice(5, 7)),
  ];
}

/**
 * RGB to Hex
 * @param {RGB} rgb - Red,Green,Blue: 0~255
 * @returns {string} hex - #RRGGBB
 */
export function rgb2hex(rgb: RGB) {
  let strHex = "#";
  for (let i = 0; i < rgb.length; i++) {
    let trans = Math.round(rgb[i]).toString(16);
    if (trans.length < 2) trans = "0" + trans;
    strHex += trans;
  }
  return strHex;
}

export function getRandomLabList(length: number) {
  let colorSet = [];
  let l = Math.round(50 + Math.random() * 30);
  for (let i = 0; i < length; i++) {
    let flag = Math.round(Math.random());
    let a = Math.round(10 + Math.random() * 100);
    a = flag === 0 ? a : -a;
    let b = Math.round(10 + Math.random() * 100);
    b = flag === 0 ? b : -b;

    colorSet.push([l, a, b]);
  }
  return colorSet;
}
