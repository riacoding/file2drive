const assert = require("assert");
const { pathToFileURL } = require("url");
const readBytes = require("../src/lib/readBytes");
const path = require("path");

describe("readBytes", function () {
  describe("getBytes", function () {
    it("should return correct bytes of test jpg image", async function () {
      const myVal = await readBytes.getFileSignature(
        path.join(__dirname, "boot.jpg")
      );
      assert.strictEqual(myVal.toUpperCase(), "FFD8");
    });
  });
});
