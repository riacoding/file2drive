const fs = require("fs");
const path = require("path");

module.exports = {
  getCurrentDirectoryBase: () => {
    return path.basename(process.cwd());
  },

  directoryExists: (filePath) => {
    return fs.existsSync(filePath);
  },

  mkdir: (path) => {
    fs.mkdirSync(path, { recursive: true });
  },

  createDirPath: (drive) => {
    const d = new Date();
    let formattedDate = `${
      d.getMonth() + 1
    }-${d.getDate()}-${d.getFullYear()}-${d.getTime()}`;

    const createDir = path.join(
      "/Volumes",
      drive,
      "file2Drive",
      formattedDate.toString()
    );

    return createDir;
  },
  makeid: (length) => {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },
  resolveDuplicate: (filePath, fileType) => {
    const fname = path.basename(filePath, fileType);
    const id = module.exports.makeid(4);
    const newName = fname + "_" + id + fileType;
    return newName;
  },
};
