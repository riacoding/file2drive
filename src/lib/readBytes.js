const fs = require("fs");

const getFileSignature = (filePath) => {
  return new Promise(function (resolve, reject) {
    fs.open(filePath, "r", function (status, fd) {
      if (status) {
        reject(status.message);
        return;
      }
      const buffer = Buffer.alloc(2);
      fs.read(fd, buffer, 0, 2, 0, function (err, num) {
        const retVal = buffer.toString("hex", 0, num);
        resolve(retVal);
      });
    });
  });
};

module.exports = {
  getFileSignature: getFileSignature,
};

getFileSignature("/Users/leebutton/projects/find-all-images/test/boot.jpg")
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });
