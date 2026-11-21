import { test } from "node:test";
import assert from "node:assert/strict";
import { matchesPriceRange, isAvailable } from "../src/lib/filters";
import { generateTezosOpHash } from "../src/lib/purchases";

test("matchesPriceRange filters by tez threshold properly", () => {
  /* 1 tez = 1,000,000 mutez */
  const lowPrice = 10_000_000;    /* 10 XTZ */
  const midPrice = 50_000_000;    /* 50 XTZ */
  const highPrice = 150_000_000;  /* 150 XTZ */

  assert.equal(matchesPriceRange(lowPrice, "all"), true);
  assert.equal(matchesPriceRange(lowPrice, "under-25"), true);
  assert.equal(matchesPriceRange(midPrice, "under-25"), false);

  assert.equal(matchesPriceRange(midPrice, "25-100"), true);
  assert.equal(matchesPriceRange(lowPrice, "25-100"), false);
  assert.equal(matchesPriceRange(highPrice, "25-100"), false);

  assert.equal(matchesPriceRange(highPrice, "over-100"), true);
  assert.equal(matchesPriceRange(midPrice, "over-100"), false);
});

test("isAvailable correctly checks placed owners against editions", () => {
  assert.equal(isAvailable(0, 100), true);
  assert.equal(isAvailable(99, 100), true);
  assert.equal(isAvailable(100, 100), false);
  assert.equal(isAvailable(105, 100), false);
  assert.equal(isAvailable(10, 0), true); /* Unlimited editions */
});

test("generateTezosOpHash outputs valid Tezos op format", () => {
  const hash = generateTezosOpHash();
  assert.ok(hash.startsWith("op"));
  assert.equal(hash.length, 51);
});
