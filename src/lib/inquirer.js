const inquirer = require("inquirer");
const files = require("./files");
const drives = require("./drives");
const { configurationErrorTask } = require("simple-git/src/lib/tasks/task");

module.exports = {
  askSearchDetails: () => {
    const questions = [
      {
        name: "searchDirectory",
        type: "input",
        message: "Enter the starting directory",
        validate: function (value) {
          if (files.directoryExists(value)) {
            return true;
          } else {
            return "Please enter a valid directory";
          }
        },
      },
      {
        name: "drive",
        type: "list",
        message: "Select your backup drive",
        choices: async function () {
          const driveList = await drives.getNonSystemList();
          if (driveList.length > 0) {
            return driveList;
          } else {
            throw new Error("No-Drives");
          }
        },
        validate: function (value) {
          if (value.length) {
            return true;
          } else {
            return "Please enter drive";
          }
        },
      },
    ];

    try {
      return inquirer.prompt(questions);
    } catch (err) {
      return;
    }
  },

  askConfirm: () => {
    const questions = [
      {
        name: "ConfirmCopy",
        type: "confirm",
        message: "Do you want to copy these files",
        validate: function (value) {
          if (!["y", "n"].includes(value.toLowerCase())) {
            return true;
          } else {
            return "Please enter a valid choice [Y/N]";
          }
        },
      },
    ];
    return inquirer.prompt(questions);
  },
  Menu: () => {
    const questions = [
      {
        name: "action",
        type: "list",
        message: "Please select an action",
        choices: ["Search", "Exit"],
      },
    ];
    return inquirer.prompt(questions);
  },
};
