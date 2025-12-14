import { logger } from "@/utils/logger";
import { ActivityItem } from "@/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Activities{
    activities: ActivityItem[]
}

const initialState: Activities={
    activities: []
}
const activitySlice = createSlice({
    name:"activities",
    initialState,
    reducers:{
        addActivity(state, action:PayloadAction<ActivityItem>){
            state.activities.push(action.payload);
        }
    }
})
export const {addActivity} = activitySlice.actions
export default activitySlice.reducer 