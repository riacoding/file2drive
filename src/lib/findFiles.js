const fs = require("fs");
const path = require("path");
const settings = require("../../settings");
const db = require("./db");
const files = require("./files");
const { File } = require("../entity/File");
const logger = require("./logger");
const { createConnection, getConnection, getRepository } = require("typeorm");
const { excludeDirs } = settings;

/**
 * iterates the files in a directory
 *
 * @param {*} directory
 * @param {string} [fileType=".jpg"]
 * @param {*} callback
 */
async function iterateFiles(directory, fileType = ".jpg", callback) {
  try {
    const dir = await fs.promises.opendir(directory);
    for await (const dirent of dir) {
      if (dirent.isFile()) {
        const ext = path.extname(dirent.name);
        //Matches allowed file extentions
        if (settings.fileExtensions.includes(ext.toLowerCase())) {
          const f = path.join(directory, dirent.name);
          const stats = fs.statSync(f);
          await callback(directory, dirent.name, ext, stats);
        }
      } else {
        if (
          dirent.isDirectory() &&
          //is NOT an excluded directory
          !excludeDirs.includes(dirent.name) &&
          //is NOT a hidden directory
          !dirent.name.startsWith(".")
        ) {
          await iterateFiles(`${directory}/${dirent.name}`, fileType, callback);
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
}

async function iterateDatabase(destinationDirectory) {
  //TODO make imcomplete from current job not just all incomplete images
  const results = await db.incomplete();

  //Cannot use forEach with async await
  for (let i = 0; i < results.length; i++) {
    const {
      id,
      srcFilename,
      destFilename,
      srcDirectory,
      fileType,
      checkedSignature,
      complete,
    } = results[i];

    const source = srcDirectory + "/" + srcFilename;
    let destination = destinationDirectory + "/" + destFilename;

    try {
      fs.copyFileSync(source, destination, 0);
      const updated = await db.markFileCompleted(id);
      logger.log("info", `${srcFilename} was copied`);
    } catch (err) {
      logger.log("error", err);
    }
  }
  return true;
}

async function fileLogger(path, fileName, fileType) {
  console.log(path, fileName, fileType);
}

async function fileList(dir) {
  await iterateFiles(dir, ".jpg", fileLogger);
}

async function fileCopy(srcDirectory, destinationDirectory) {
  await iterateDatabase(destinationDirectory);
  await db.deleteCompleted();
  await db.markJobCompleted(destinationDirectory);
}

async function filePreProcess(filePath, jobName, fileType = ".jpg") {
  let count = 0;

  const job = await db.findJobByName(jobName);
  if (!job) {
    throw new Error("job not found");
  }

  await iterateFiles(
    filePath,
    fileType,
    async (directory, fileName, fileType) => {
      if (settings.fileExtensions.includes(fileType.toLowerCase())) {
        count += 1;
      }
      if (count > 0) {
        try {
          //lookup filename
          const results = await db.findFileByName(fileName);
          if (results) {
            //file name already exists create an extension
            const updatedFileName = files.resolveDuplicate(fileName, fileType);
            db.saveFile(directory, fileName, updatedFileName, fileType, job);
            logger.log("info", `${directory}/${updatedFileName}`);
          } else {
            const savedFile = db.saveFile(
              directory,
              fileName,
              fileName,
              fileType,
              job
            );
            logger.log("info", `${directory}/${fileName}`);
          }
        } catch (err) {
          logger.log("error", err);
        }
      }
    }
  );
  return count;
}

async function fileCount(filePath, fileType = ".jpg") {
  let count = 0;
  let total = 0;
  try {
    const dir = await fs.promises.opendir(filePath);
    for await (const dirent of dir) {
      if (dirent.isFile()) {
        console.log(dirent.name);
        const ext = await path.extname(dirent.name);
        if (settings.fileExtensions.includes(ext.toLowerCase())) {
          count += 1;
        }
      } else {
        if (
          dirent.isDirectory() &&
          //is NOT an excluded directory
          !excludeDirs.includes(dirent.name) &&
          //is NOT a hidden directory
          !dirent.name.startsWith(".")
        ) {
          total += await fileCount(`${filePath}/${dirent.name}`, fileType);
        }
      }
    }
    if (count > 0) {
      logger.log("info", `${count} Files found in ${filePath}`);
      //console.log("%d Files found in %s ", count, filePath);
    }
    total += count;
  } catch (err) {
    console.log(err);
  }

  return total;
}

module.exports = {
  filePreProcess: filePreProcess,
  fileCopy: fileCopy,
  fileList: fileList,
};
