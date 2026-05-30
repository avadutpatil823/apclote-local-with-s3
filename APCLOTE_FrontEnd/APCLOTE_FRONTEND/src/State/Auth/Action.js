import { toast } from "react-toastify"
import { GETUSER_FAILURE, GETUSER_REQUEST, GETUSER_SUCCESS, LOGIN_FAILURE, LOGIN_REQUEST, LOGIN_SUCCESS, REGISTER_FAILURE, REGISTER_REQUEST, REGISTER_SUCCESS } from "./ActionType"
import axios from 'axios'
import { buildApiUrl, buildUrl } from "../../config/api"



export const register=(userData)=>async (dispatch)=>{
    dispatch({type:REGISTER_REQUEST})
  try{
   const response= await axios.post(buildUrl("/auth/register"),userData)
   const user=response.data
   toast.success(JSON.stringify(user.name+" is Registered Successufully"))
   dispatch({type:REGISTER_SUCCESS,payload:user})
   return true
}
catch(error){
     const errorMessage = error?.response?.data?.message || "Registration failed"
     toast.error(errorMessage)
     dispatch({type:REGISTER_FAILURE,payload:errorMessage})
     return false
}

}

export const login=(userData, redirectTo)=>async (dispatch)=>{
    
    dispatch({type:LOGIN_REQUEST})
  try{
    
   const response= await axios.post(buildUrl("/auth/login"),userData)
   const jwt=response.data.token
   if( response.data.token){
     localStorage.setItem("JWT",JSON.stringify(jwt));
       dispatch({type:LOGIN_SUCCESS,payload:response.data});
     toast.success("Login Successfully")
     window.location.href = redirectTo || "/"
     return true
   }

   dispatch({type:LOGIN_FAILURE,payload:"No User With This Email Found"});
   toast.error("No User With This Email Found")
   return false
}
catch(error){
     const errorMessage = error?.response?.data?.message || "Failed To Login"
     toast.error("Failed To Login Check Credentials..")
     dispatch({type:LOGIN_FAILURE,payload:errorMessage})
     return false
     
}

}

export const getUser=()=>async (dispatch)=>{
     if(localStorage.getItem("JWT")){
    dispatch({type:GETUSER_REQUEST})
  try{
    
   const response= await axios.get(buildApiUrl("/getUser"),{headers:{
      "Content-Type": "application/json",
      "Authorization": `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`
    }})
    
   dispatch({type:GETUSER_SUCCESS,payload:response.data})
    localStorage.setItem("USER",JSON.stringify(response.data))
}
catch(error){
     const errorMessage = error?.response?.data?.message || "Failed to fetch user"
     toast.error(errorMessage)
     dispatch({type:GETUSER_FAILURE,payload:errorMessage})
}
     }
}

export const logOut=()=>(dispatch)=>{

     localStorage.removeItem("JWT");
     localStorage.removeItem("USER")
     dispatch(getUser())
     window.location.reload()
}


