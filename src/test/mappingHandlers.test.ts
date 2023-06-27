import { expect, test } from "@jest/globals";
//import { subqlTest } from '@subql/testing';

/*
// https://academy.subquery.network/build/testing.html
subqlTest(
  "testName", // test name
  1000003, // block height to process
  [], // dependent entities
  [], // expected entities
  "handleEvent" //handler name
);
*/
test("1 + 1 equals 2", () => {
    expect(1 + 1).toBe(2);
});
