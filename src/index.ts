// @ts-ignore
import { tanh } from "./utils";

type Lab = [number, number, number];
type RGB = [number, number, number];

// C：chroma饱和度; L：lightness明度; H：hue色调

export function delta_Eab2000(labA: Lab, labB: Lab) {
  let E00 = 0; //CIEDE2000色差E00
  let LL1, LL2, aa1, aa2, bb1, bb2; //声明L',a',b',（1,2）
  let delta_LL, delta_CC, delta_hh, delta_HH; // 第二部的四个量: L：明度；C：彩度；H：色相
  let kL, kC, kH;
  let RT = 0; //旋转函数RT
  let G = 0; //G表示CIELab 颜色空间a轴的调整因子,是彩度的函数.
  let mean_Cab = 0; //两个样品彩度的算术平均值
  let SL, SC, SH, T;

  kL = 1;
  kC = 1;
  kH = 1;

  mean_Cab = (chroma(labA[1], labA[2]) + chroma(labB[1], labB[2])) / 2;
  let mean_Cab_pow7 = Math.pow(mean_Cab, 7); //两彩度平均值的7次方
  G =
    0.5 *
    (1 - Math.pow(mean_Cab_pow7 / (mean_Cab_pow7 + Math.pow(25, 7)), 0.5));

  LL1 = labA[0];
  aa1 = labA[1] * (1 + G);
  bb1 = labA[2];

  LL2 = labB[0];
  aa2 = labB[1] * (1 + G);
  bb2 = labB[2];

  let CC1, CC2; //两样本的彩度值
  CC1 = chroma(aa1, bb1);
  CC2 = chroma(aa2, bb2);
  let hh1, hh2; //两样本的色调角
  hh1 = hueAngle(aa1, bb1);
  hh2 = hueAngle(aa2, bb2);

  delta_LL = LL1 - LL2;
  delta_CC = CC1 - CC2;
  delta_hh = hueAngle(aa1, bb1) - hueAngle(aa2, bb2);
  delta_HH =
    2 * Math.sin((Math.PI * delta_hh) / 360) * Math.pow(CC1 * CC2, 0.5);

  //-------第三步--------------
  //计算公式中的加权函数SL,SC,SH,T
  let mean_LL = (LL1 + LL2) / 2;
  let mean_CC = (CC1 + CC2) / 2;
  // let mean_hh = (hh1 + hh2) / 2;

  let mean_hh = (hh1 + hh2) / 2;

  SL =
    1 +
    (0.015 * Math.pow(mean_LL - 50, 2)) /
      Math.pow(20 + Math.pow(mean_LL - 50, 2), 0.5);
  SC = 1 + 0.045 * mean_CC;
  T =
    1 -
    0.17 * Math.cos(((mean_hh - 30) * Math.PI) / 180) +
    0.24 * Math.cos((2 * mean_hh * Math.PI) / 180) +
    0.32 * Math.cos(((3 * mean_hh + 6) * Math.PI) / 180) -
    0.2 * Math.cos(((4 * mean_hh - 63) * Math.PI) / 180);
  SH = 1 + 0.015 * mean_CC * T;

  //------第四步--------
  //计算公式中的RT
  let mean_CC_pow7 = Math.pow(mean_CC, 7);
  let RC = 2 * Math.pow(mean_CC_pow7 / (mean_CC_pow7 + Math.pow(25, 7)), 0.5);
  let delta_xita = 30 * Math.exp(-Math.pow((mean_hh - 275) / 25, 2)); //△θ 以°为单位
  RT = -Math.sin((2 * delta_xita * Math.PI) / 180) * RC;

  let L_item, C_item, H_item;
  L_item = delta_LL / (kL * SL);
  C_item = delta_CC / (kC * SC);
  H_item = delta_HH / (kH * SH);

  E00 = Math.pow(
    L_item * L_item + C_item * C_item + H_item * H_item + RT * C_item * H_item,
    0.5
  );

  return E00;
}

export function harmony(labA: Lab, labB: Lab) {
  let deltaL = labA[0] - labB[0];

  let L_sum = labA[0] + labB[0];

  let deltaH = hueAngle(labA[1], labA[2]) - hueAngle(labB[2], labB[2]);
  let deltaC = chroma(labA[1], labA[2]) - chroma(labB[1], labB[2]);
  let h_C =
    0.04 +
    0.53 *
      tanh(
        0.8 -
          0.045 * Math.sqrt(Math.pow(deltaH, 2) + Math.pow(deltaC / 1.46, 2))
      );

  let h_Lsum = 0.28 + 0.54 * tanh(-3.88 + 0.029 * L_sum);
  let h_deltaL = 0.14 + 0.15 * tanh(-2 + 0.2 * Math.abs(deltaL));
  let h_L = h_Lsum + h_deltaL;

  let h_sy1 = h_sy(labA);
  let h_sy2 = h_sy(labB);
  let h_H = h_sy1 + h_sy2;
  console.log(h_C, h_L, h_H);

  return h_C + h_L + h_H;
}

// harmony(labA, labB) {
//   let deltaL = labA[0] - labB[0];
//
//   let deltaH = Math.abs(this.hueAngle(labA[1], labA[2]) - this.hueAngle(labB[1], labB[2]) )
//   let deltaC = Math.abs(this.chroma(labA[1], labA[2]) - this.chroma(labB[1], labB[2]))
//
//   let h_H = -0.7 * Math.tanh(-0.7 + 0.04 * deltaH)
//   let h_C = -0.3 * Math.tanh(-1.1 + 0.05 * deltaC)
//   let h_L = 0.4 * Math.tanh(-1.1 + 0.05 * deltaL)
//   let h_Lsum = 0.3 + 0.6 * Math.tanh(-4.2+0.028 * (labA[0] + labB[0]))
//
//   return h_C + h_L + h_H + h_Lsum
// }

export function lab2rgb(lab: Lab) {
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

export function rgb2lab(rgb: RGB) {
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

export function hex2rgb(hex: string) {
  return [
    parseInt("0x" + hex.slice(1, 3)),
    parseInt("0x" + hex.slice(3, 5)),
    parseInt("0x" + hex.slice(5, 7)),
  ];
}

export function rgb2hex(rgb: RGB) {
  let strHex = "#";
  for (let i = 0; i < rgb.length; i++) {
    let trans = Math.round(rgb[i]).toString(16);
    if (trans.length < 2) trans = "0" + trans;
    strHex += trans;
  }
  return strHex;
}

// l:0-100; a:-128-127; b:-128-127
export function getRandomColor(length: number) {
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

export function fitness(labA: Lab, labB: Lab, a: number) {
  let delta = delta_Eab2000(labA, labB);
  let _harmony = harmony(labA, labB);
  return delta + a * _harmony;
}

export function fitnessAll(entity: Lab[], factor: number) {
  let lowestGrade = 1000;
  for (let i = 0; i < entity.length; i++) {
    for (let j = i + 1; j < entity.length; j++) {
      let grade = fitness(entity[i], entity[j], factor);
      if (grade < lowestGrade) {
        lowestGrade = grade;
      }
    }
  }
  return lowestGrade;
}

export function getDeltaAndHarmony(entity: Lab[]) {
  console.log(entity);
  let delta = Infinity;
  let _harmony = Infinity;
  for (let i = 0; i < entity.length; i++) {
    for (let j = i + 1; j < entity.length; j++) {
      delta = Math.min(delta, delta_Eab2000(entity[i], entity[j]));
      _harmony = Math.min(_harmony, harmony(entity[i], entity[j]));
    }
  }
  delta = parseFloat(delta.toFixed(2));
  _harmony = parseFloat(_harmony.toFixed(2));
  return { delta, harmony };
}

export function getSeqDelta(palette: Lab[]) {
  let delta_arr = [];
  for (let i = 1; i < palette.length; i++) {
    delta_arr.push(Math.round(delta_Eab2000(palette[i - 1], palette[i])));
  }

  let avg = Math.round(delta_arr.reduce((p, c) => p + c) / delta_arr.length);
  let SD = Math.round(
    Math.sqrt(delta_arr.reduce((p, c) => p + (c - avg) ** 2) / delta_arr.length)
  );

  return { avg, SD };
}

export function h_sy(lab: Lab) {
  let radian = Math.PI / 180;
  let h_ab = hueAngle(lab[1], lab[2]);
  let c_ab = chroma(lab[1], lab[2]);

  let e_c = 0.5 + 0.5 * Math.tanh(-2 + 0.5 * c_ab);

  let h_s =
    -0.08 -
    0.14 * Math.sin(h_ab * radian + 50 * radian) -
    0.07 * Math.sin(2 * h_ab * radian + 90 * radian);

  let p1 = (0.22 * lab[0] - 12.8) / 10;
  // let p2 = Math.exp((90 * radian - h_ab) / 10 - Math.exp((90 * radian - h_ab) / 10))
  let p2 = Math.exp((90 - h_ab) / 10 - Math.exp((90 - h_ab) / 10));
  let e_y = p1 * p2;

  return e_c * (h_s + e_y);
}
//彩度计算
export function chroma(a: number, b: number) {
  return Math.pow(a * a + b * b, 0.5);
}
//色调角计算
export function hueAngle(a: number, b: number) {
  let h = 0;
  let hab = 0;

  // Math.atan(b / a)得到的值为弧度，需要将其转换为度数
  h = (180 / Math.PI) * Math.atan(b / a); //有正有负

  if (a > 0 && b > 0) {
    hab = h;
  } else if (a < 0 && b > 0) {
    hab = 180 + h;
  } else if (a < 0 && b < 0) {
    hab = 180 + h;
  } else {
    //a>0&&b<0
    hab = 360 + h;
  }
  return hab;
}
