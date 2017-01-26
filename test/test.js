test("first test", 3, function() {
    var actual = 5 - 4;

    ok(true, "passes because true is true");
    //ok is boolean assertion that passes if the first argument is truthy.
    equal(actual, 1, "passes because 1 == 1");
    //actual == expected
    notEqual(actual, 0, "passes because 1 != 0");
    //actual != expected
});
