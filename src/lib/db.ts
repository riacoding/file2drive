import { createConnection, getConnection, getRepository } from 'typeorm';
import { File } from "../entity/File"
import {Job} from "../entity/Job"
import logger = require('./logger');


export async function saveJob(jobName:string) {
   try {
        const repository = getConnection().getRepository(Job)
        const job = new Job()
        job.jobName = jobName
        job.complete = false
        job.canceled = false
        return await repository.save(job)   
   } catch (err) {
    logger.log("error", err)
   }
}

export async function findJobByName(jobName: string) {
   try {
        const repository = getConnection().getRepository(Job)
        return await repository.findOne({ jobName: jobName })
   } catch (err) {
    logger.log("error", err)
   }
    
}

export async function findJobWithFiles(jobName: string) {
    try {
        const repository = getConnection().getRepository(Job)
        return await repository.find({
            where: {
                jobName: jobName,
                complete: false
            },
            relations: ["files"],
          })
    } catch (err) {
        logger.log("error", err)
    }
    
}

export async function markJobCompleted(jobName: string) {
   try {
        const repository = getConnection().getRepository(Job)
        const job = await repository.findOne({ jobName: jobName })
        const updated = await repository.update(job.id, { complete: true });
        return updated
   } catch (err) {
       logger.log("error", err)
   }
}

export async function markJobCanceled(jobName: string) {
    try {
         const repository = getConnection().getRepository(Job)
         const job = await repository.findOne({ jobName: jobName })
         const updated = await repository.update(job.id, { canceled: true });
         return updated
    } catch (err) {
        logger.log("error", err)
    }
 }

export  async function saveFile(srcDirectory: string, srcFilename: string, destFilename:string, fileType: string, job: Job) {
   try {
        const repository = getConnection().getRepository(File)
        const file = new File();
        file.srcFilename = srcFilename
        file.complete = false
        file.srcDirectory = srcDirectory
        file.destFilename = destFilename
        file.fileType = fileType
        file.checkedSignature = false
        file.job = job
        return  await repository.save(file, { transaction: false })
   } catch (err) {
        logger.log("error", err)
   }
}


export async function findFileByName(filename: string) {
   try {
        const repository = getConnection().getRepository(File)
        return await repository.findOne({ srcFilename: filename })    
   } catch (err) {
     logger.log("error", err)
   }
}

export async function markFileCompleted(id:number) {
   try {
        const repository = getConnection().getRepository(File)
        const updated = await repository.update(id, { complete: true });
        return updated
   } catch (err) {
     logger.log("error", err)
   }
}

export async  function incomplete() {
    try {
        const repository = getConnection().getRepository(File)
        const files = await repository.find({where: { complete: false }})
        return files
    } catch (err) {
        logger.log("error", err)
    }
}


export async  function deleteCompleted() {
    try {
        const repository = getConnection().getRepository(File)
        const files = await repository.find({ where: { complete: true } })
        const ids = files.reduce((ids, file) => {
            ids.push(file.id)
            return ids   
        },[])
        const deleted = await repository.delete(ids);
        logger.log("info", `${ids.length} Files deleted`);
        return true
    } catch (err) {
        logger.log("error", err)
    }
}



