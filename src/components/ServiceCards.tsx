import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

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
      <div className="lg:w-1/2 hidden lg:flex flex-col justify-center items-center px-8 py-12 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-md w-full space-y-8">
          {summaryCards.map((card, idx) => (
            <Card key={idx} className={`shadow-elegant ${card.color} text-center`}>
              <CardHeader>
                <CardTitle className="text-xl font-bold mb-2">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-muted-foreground mb-2">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
     );
}

export default ServicesCard;