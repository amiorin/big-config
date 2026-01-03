import * as squint_core from 'squint-cljs/core.js';
import { expect, test } from 'vitest';
import { adder } from './my_lib.jsx';
test("my-component adder works", (function () {
return expect(adder(1, 2, 3)).toBe(6);

}));
