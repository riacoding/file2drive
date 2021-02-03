#!/usr/bin/env node
import path from "path"
import "reflect-metadata";
import chalk from "chalk";
import clear from 'clear';
import figlet from 'figlet';
import {Spinner} from "clui"
import { createConnection, Connection, Db } from "typeorm";
import inquirer from './lib/inquirer';
import findFiles from './lib/findFiles';
import files from './lib/files'
import * as db from './lib/db'

let connection


//Clear console
clear();

//display App name
console.log(
  chalk.yellow(
    figlet.textSync("file2Drive", { horizontalLayout: "full" })
  )
);

async function init() {
   //setup database from ormconfig.js
  connection =  await createConnection();
}

async function cleanup() {
  console.log("closing connection");
  connection.close()
}
 
//main App
const searchFiles = async () => {
 try {
    const searchSpinner = new Spinner('Searching for files...');
    
    //get user input
    const searchDetailsResults = await inquirer.askSearchDetails();
  
     //set timestamped directory to copy files to
    const saveDir = files.createDirPath(searchDetailsResults.drive);
     await db.saveJob(saveDir)
  
    //Search matching files and append to database
    searchSpinner.start()
    const totalFiles = await findFiles.filePreProcess(
      searchDetailsResults.searchDirectory,saveDir
    );
    searchSpinner.stop()
  
    //TODO update with total bytes
    console.log("Files to Copy: ", totalFiles);
  
   // const updatedJob = await db.findJobWithFiles(saveDir)
  
    //confirm copy files
    //TODO implement  total bytes to be copied and check available space on destination drive
    const confirm = await inquirer.askConfirm();
  
    if (confirm.ConfirmCopy) {
      const saveDirExists = files.directoryExists(saveDir);
  
      if (!saveDirExists) {
        files.mkdir(saveDir);
        console.log("Directory %s created", saveDir);
      }
      //copy images
      //TODO implement file check - readBytes - to check file contents matched the extension
      await findFiles.fileCopy(searchDetailsResults.searchDirectory, saveDir);
       return
    } else {
      await db.markJobCanceled(saveDir)
      return
    }
 } catch (err) {
   if (err.message === "No-Drives") {

     console.error(chalk.redBright("No External Drives Connected"));
   }
 }
};

const menuDisplay =  () => {
  //display the menu
   inquirer.Menu().then(async (answers) => {
     switch (answers.action) {
       case "Search":
         await searchFiles() 
         break;
         case "Exit":
         await cleanup()
         process.exit()
          break; 
       default:
         break;
     }     
      inquirer.Menu()
   })
}

//init
init()

// main app
menuDisplay();
