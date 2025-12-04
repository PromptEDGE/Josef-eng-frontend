import { logger } from "@/utils/logger";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
// import VideoBg from "../assets/Generated File August 19, 2025 - 4_26AM.mp4"
import ImageBg from "../assets/authImage.png"
const ServicesCard = () => {
    // const summaryCards = [
    //   {
    //     title: "AI-Powered Engineering Assistant",
    //     description:
    //       "Get instant help with calculations, standards, design, and troubleshooting for HVAC projects.",
    //     color: "bg-gradient-primary text-primary-foreground",
    //   },
    //   {
    //     title: "Project & Proposal Management",
    //     description:
    //       "Create, manage, and track engineering projects and proposals with budgets, teams, and documents.",
    //     color: "bg-gradient-secondary text-secondary-foreground",
    //   },
    //   {
    //     title: "Document & Knowledge Library",
    //     description:
    //       "Upload, organize, and access technical documents, drawings, and standards in a centralized library.",
    //     color: "bg-gradient-accent text-accent-foreground",
    //   },
    // ];
    return ( 
      <div className="  relative lg:w-1/2 hidden  h-dvh lg:flex flex-col justify-center items-center bg-contain bg-no-repeat ">
      <div className="z-30 absolute bottom-0 max-w-lg w-full mb-8 p-4 rounded-xl bg-card/80 shadow-elegant text-left backdrop-blur">
        <h2 className="text-2xl font-bold text-primary mb-2">All-in-One HVAC Engineering Platform</h2>
        <p className="text-base text-muted-foreground">
          Get instant HVAC support for calculations, design, standards, and troubleshooting while planning and managing projects, proposals, budgets, and teams, all with a centralized library to upload, organize, and access technical documents and standards.
        </p>
      </div>
        <img src={ImageBg} alt="" className="w-full absolute h-full inset-0  " />
        <div className="w-full h-full absolute inset-0 bg-black opacity-10" />
      </div>
     );
}

export default ServicesCard;