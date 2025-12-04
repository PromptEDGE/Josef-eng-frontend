import { logger } from "@/utils/logger";
  const generateAIResponse = (input: string): string => {
    const lower = input.toLowerCase();
    
    if (lower.includes('cooling load') || lower.includes('calculate')) {
      return `Based on your request for cooling load calculation, I'll help you determine the requirements for a 5000 sq ft office space:

**Heat Load Components:**
• Sensible heat gain from occupants: ~45,000 BTU/hr (150 people × 300 BTU/hr)
• Lighting load: ~25,000 BTU/hr (2.5 W/sq ft × 3.41 BTU/W)
• Equipment load: ~30,000 BTU/hr (estimated)
• Solar/envelope gains: ~20,000 BTU/hr (varies by orientation)

**Total Cooling Load:** ~120,000 BTU/hr (10 tons)

**Recommendations:**
• Consider variable air volume (VAV) system for efficiency
• Use ASHRAE 62.1 for ventilation requirements (15 cfm/person minimum)
• Include 10-15% safety factor for design conditions

Would you like me to provide detailed calculations for any specific component?`;
    }
    
    if (lower.includes('ashrae') || lower.includes('standard')) {
      return `Here are the key ASHRAE 90.1-2019 requirements for HVAC efficiency:

**Equipment Efficiency Requirements:**
• Air-cooled chillers >150 tons: minimum 9.562 EER, 14.04 IPLV
• Water-cooled chillers >300 tons: minimum 5.50 COP, 6.84 IPLV
• Packaged AC units: varies by capacity (13-14.4 EER typical)

**System Requirements:**
• Economizer controls required for units >54,000 BTU/hr in most climates
• Variable speed drives required for fans >7.5 HP
• Energy recovery required for systems >5,000 cfm with >70% outside air

**Building Envelope:**
• Updated insulation requirements
• Window performance standards (U-factor and SHGC)

Need specific details for your project's equipment or climate zone?`;
    }

    if (lower.includes('data center')) {
      return `For data center cooling design, here are my recommendations:

**Cooling Strategy:**
• Precision air conditioning units with close-coupled cooling
• Hot aisle/cold aisle containment to improve efficiency
• Target supply temperature: 64-72°F, return temp: 80-85°F

**Redundancy Requirements:**
• N+1 minimum for critical loads
• Consider 2N for high-availability requirements
• Independent cooling zones for different IT equipment

**Efficiency Measures:**
• Variable speed fans and pumps
• Economizer operation when ambient conditions allow
• Consider liquid cooling for high-density racks (>15kW per rack)

**Monitoring:**
• Temperature and humidity sensors throughout space
• Power usage effectiveness (PUE) monitoring
• Integration with building management system

Would you like specific equipment recommendations or load calculations?`;
    }

    return `I understand you're asking about "${input}". As your AI engineering assistant, I have access to extensive HVAC knowledge including:

• Technical standards (ASHRAE, SMACNA, NFPA)
• Equipment specifications and performance data
• Design best practices and methodologies
• Energy efficiency strategies
• Code compliance requirements

Could you provide more specific details about your project requirements? This will help me give you more targeted recommendations and calculations.`;
  };