import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user : localStorage.getItem("user") ? (JSON.parse(localStorage.getItem("user"))) : null,
    Loading : false,
    InstructorDashboardData : [],
    InstructorCoursesData:[]
}

  const profileSlice = createSlice({
    name:"profile",
    initialState,
    reducers : {
        setUser(state , action){
            state.user = action.payload
        } , 
        setLoading(state , action){
          state.Loading = action.payload
        },
        setInstructorDashboardData(state , action){
          state.InstructorDashboardData = action.payload
        },
        setInstructorCoursesForDashboardData(state , action){
          state.InstructorCoursesData = action.payload
        },
        
      }
      })

  export const { setUser ,setLoading , setInstructorDashboardData , setInstructorCoursesForDashboardData} = profileSlice.actions
  export default profileSlice.reducer