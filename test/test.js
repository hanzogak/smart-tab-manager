QUnit.test("first test", function (assert) {
  var actual = 5 - 4;

  //ok is boolean assertion that passes if the first argument is truthy.
  assert.ok(true, "passes because true is true");
  //actual == expected
  assert.equal(actual, 1, "passes because 1 == 1");
  //actual != expected
  assert.notEqual(actual, 0, "passes because 1 != 0");
});
