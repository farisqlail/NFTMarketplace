import { test } from "node:test";
import assert from "node:assert/strict";
import { formatAddress, getExplorerUrl } from "../src/lib/wallet-utils";

test("formatAddress truncates valid Tezos addresses correctly", () => {
  const full = "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb";
  assert.equal(formatAddress(full), "tz1VSU…jcjb");
});

test("formatAddress returns short or empty inputs as-is", () => {
  assert.equal(formatAddress(""), "");
  assert.equal(formatAddress("tz1short"), "tz1short");
});

test("getExplorerUrl builds correct TzKT links for ghostnet and mainnet", () => {
  const addr = "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb";
  assert.equal(getExplorerUrl(addr, "ghostnet"), "https://ghostnet.tzkt.io/tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb");
  assert.equal(getExplorerUrl(addr, "mainnet"), "https://tzkt.io/tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb");
});
