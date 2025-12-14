import { logger } from "@/utils/logger";
//   const createProposal = async (conversation: string)=> {
//     const { 
//         id:project_uid,
//         name: projectName,
//         type:projectType,
//         priority,
//         startDate,
//         endDate,
//         budget,
//         description,
//         systems,
//         location,
//         client
//     } = project
//     const create: Proposal ={
//       id: uuidv4(),
//       client,
//       project_uid,
//       projectName,
//       projectType,
//       priority,
//       startDate,
//       endDate,
//       budget,
//       location,
//       description,
//       systems,
//       createdAt: new Date().toISOString(),
//       conversation,
//     } 
//     await dispatch(createNewProposal(create))
//     const activity:ActivityItem = {
//       icon: FileText,
//       id: uuidv4(),
//       type: "document",
//       title: "You have created a proposal.",
//       time: new Date().toISOString(),
//     }
//     await dispatch(addActivity(activity))
//   }