import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
// import VideoBg from "../assets/Generated File August 19, 2025 - 4_26AM.mp4"
const ServicesCard = () => {
    const summaryCards = [
      {
        title: "AI-Powered Engineering Assistant",
        description:
          "Get instant help with calculations, standards, design, and troubleshooting for HVAC projects.",
        color: "bg-gradient-primary text-primary-foreground",
      },
      {
        title: "Project & Proposal Management",
        description:
          "Create, manage, and track engineering projects and proposals with budgets, teams, and documents.",
        color: "bg-gradient-secondary text-secondary-foreground",
      },
      {
        title: "Document & Knowledge Library",
        description:
          "Upload, organize, and access technical documents, drawings, and standards in a centralized library.",
        color: "bg-gradient-accent text-accent-foreground",
      },
    ];
    return (
      <div
        className="relative lg:w-1/2 hidden bg-gradient-hero lg:flex flex-col justify-center items-center px-8 py-12"
          // style={{
          //   minHeight: '100vh',
          //   // width: '100%',
          //   background: 'linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 50%, #c7d2fe 100%)',
          //   backgroundRepeat: 'no-repeat',
          //   backgroundSize: 'cover',
          // }}
        >
        <div className="z-20 max-w-md w-full space-y-8">
          {summaryCards.map((card, idx) => (
            <Card key={idx} className={`shadow-elegant backdrop-blur ${card.color} text-center`}>
              <CardHeader>
                <CardTitle className="text-xl font-bold mb-2">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground mb-2">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* <video playsInline src={VideoBg} autoPlay={true} loop={true} muted={true}  className="absolute inset-0 object-cover h-full w-full mix-blend-multiply " ></video> */}
      </div>
    );
}

export default ServicesCard;