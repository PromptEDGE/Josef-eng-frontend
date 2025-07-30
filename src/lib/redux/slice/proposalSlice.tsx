import { Proposal } from "@/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { jsPDF } from "jspdf";
interface ProposalType{
    proposal: Proposal[]
}
const initialState: ProposalType ={
    proposal:[]
}

const proposalSlice = createSlice({
    name: "proposal",
    initialState,
    reducers:{
        createNewProposal: (state,action:PayloadAction<Proposal>)=>{
            const proposal = action.payload
            const doc = new jsPDF();
            doc.text(proposal.conversation, 10, 10);

            // Get blob from PDF
            const blob = doc.output("blob");
            const url=URL.createObjectURL(blob)
            
            const pdfData = {
                name: "my-text.pdf",
                file: blob,
                url,
            };
            const addFile = {
                ...proposal,
                pdf: pdfData
            }
            const update = [...state.proposal,addFile]

            state.proposal = update
        }
    }
})
export const { createNewProposal } = proposalSlice.actions;
export default proposalSlice.reducer;