import { deltaEab2000 } from "../src";

test("adds two numbers correctly", () => {
  const res = deltaEab2000([1, 22, 33], [12, 33, 2]);

  expect(res).toBe(23.445645209878244);
});
