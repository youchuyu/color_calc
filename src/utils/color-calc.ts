import { tanh } from "./math";

// C：chroma饱和度; L：lightness明度; H：hue色调

/**
 * Calculate chroma
 * @param {number} a - Lab 中的 a
 * @param {number} b - Lab 中的 b
 * @returns {number} chroma
 */
export function chroma(a: number, b: number) {
  return Math.pow(a * a + b * b, 0.5);
}

/**
 * Calculate chroma
 * @param {number} a - Lab 中的 a
 * @param {number} b - Lab 中的 b
 * @returns {number} hueAngle
 */
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

function h_sy(lab: Lab) {
  let radian = Math.PI / 180;
  let h_ab = hueAngle(lab[1], lab[2]);
  let c_ab = chroma(lab[1], lab[2]);

  let e_c = 0.5 + 0.5 * Math.tanh(-2 + 0.5 * c_ab);

  let h_s =
    -0.08 -
    0.14 * Math.sin(h_ab * radian + 50 * radian) -
    0.07 * Math.sin(2 * h_ab * radian + 90 * radian);
  let p1 = (0.22 * lab[0] - 12.8) / 10;
  let p2 = Math.exp((90 - h_ab) / 10 - Math.exp((90 - h_ab) / 10));
  let e_y = p1 * p2;

  return e_c * (h_s + e_y);
}

/**
 * Calculate harmony
 * @param {Lab} labA - Lab of color A
 * @param {Lab} labB - Lab of color B
 * @returns {number} harmony
 */
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

  return h_C + h_L + h_H;
}

/**
 * Calculate deltaEab2000
 * @param {Lab} labA - Lab of color A
 * @param {Lab} labB - Lab of color B
 * @returns {number} deltaEab2000
 */
export function deltaEab2000(labA: Lab, labB: Lab) {
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

  //两样本的彩度值
  const CC1 = chroma(aa1, bb1);
  const CC2 = chroma(aa2, bb2);
  //两样本的色调角
  const hh1 = hueAngle(aa1, bb1);
  const hh2 = hueAngle(aa2, bb2);

  delta_LL = LL1 - LL2;
  delta_CC = CC1 - CC2;
  delta_hh = hueAngle(aa1, bb1) - hueAngle(aa2, bb2);
  delta_HH =
    2 * Math.sin((Math.PI * delta_hh) / 360) * Math.pow(CC1 * CC2, 0.5);

  //-------第三步--------------
  //计算公式中的加权函数SL,SC,SH,T
  const mean_LL = (LL1 + LL2) / 2;
  const mean_CC = (CC1 + CC2) / 2;
  // let mean_hh = (hh1 + hh2) / 2;

  const mean_hh = (hh1 + hh2) / 2;

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
  const mean_CC_pow7 = Math.pow(mean_CC, 7);
  const RC = 2 * Math.pow(mean_CC_pow7 / (mean_CC_pow7 + Math.pow(25, 7)), 0.5);
  const delta_xita = 30 * Math.exp(-Math.pow((mean_hh - 275) / 25, 2)); // △θ 以°为单位
  RT = -Math.sin((2 * delta_xita * Math.PI) / 180) * RC;

  const L_item = delta_LL / (kL * SL);
  const C_item = delta_CC / (kC * SC);
  const H_item = delta_HH / (kH * SH);

  E00 = Math.pow(
    L_item * L_item + C_item * C_item + H_item * H_item + RT * C_item * H_item,
    0.5
  );

  return E00;
}

export function getDeltaAndHarmony(entity: Lab[]) {
  let delta = Infinity;
  let _harmony = Infinity;
  for (let i = 0; i < entity.length; i++) {
    for (let j = i + 1; j < entity.length; j++) {
      delta = Math.min(delta, deltaEab2000(entity[i], entity[j]));
      _harmony = Math.min(_harmony, harmony(entity[i], entity[j]));
    }
  }
  delta = parseFloat(delta.toFixed(2));
  _harmony = parseFloat(_harmony.toFixed(2));
  return { delta, harmony };
}

export function fitness(labA: Lab, labB: Lab, a: number) {
  const delta = deltaEab2000(labA, labB);
  const _harmony = harmony(labA, labB);
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

export function getSeqDelta(palette: Lab[]) {
  const delta_arr = [];
  for (let i = 1; i < palette.length; i++) {
    delta_arr.push(Math.round(deltaEab2000(palette[i - 1], palette[i])));
  }

  let avg = Math.round(delta_arr.reduce((p, c) => p + c) / delta_arr.length);
  let SD = Math.round(
    Math.sqrt(delta_arr.reduce((p, c) => p + (c - avg) ** 2) / delta_arr.length)
  );

  return { avg, SD };
}
