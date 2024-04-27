import { delta_Eab2000 } from "../src";

test("adds two numbers correctly", () => {
  const res = delta_Eab2000([1, 22, 33], [12, 33, 2]);

  expect(res).toBe(23.445645209878244);
});
