import { hsl2rgb, hsv2rgb, rgb2hsl, rgb2hsv } from "../src";

test("adds two numbers correctly", () => {
  const res = rgb2hsl([245, 23, 23]);
  const res2 = hsl2rgb(res);
  const res3 = rgb2hsv([245, 23, 23]);
  const res4 = hsv2rgb(res3);

  console.log(res);
  console.log(res2);
  console.log(res3);
  console.log(res4);

  // expect(res).toBe([60, 100, 50]);
});
