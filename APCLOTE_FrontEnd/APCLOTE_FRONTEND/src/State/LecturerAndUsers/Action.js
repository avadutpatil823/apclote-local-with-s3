import axios from "axios"
import { GETALL_LEECTURERS_FAILURE, GETALL_LEECTURERS_REQUEST, GETALL_LEECTURERS_SUCCESS, GETALL_STUDENTS_FAILURE, GETALL_STUDENTS_REQUEST, GETALL_STUDENTS_SUCCESS, GETALL_USER_TESTANS_FAILURE, GETALL_USER_TESTANS_REQUEST, GETALL_USER_TESTANS_SUCCESS, GETALL_USERS_FAILURE, GETALL_USERS_REQUEST, GETALL_USERS_SUCCESS } from "./ActionType"
import { buildApiUrl, buildUrl } from "../../config/api"

export const getLecturers=(pageNumber, append = false)=>async (dispatch)=>{
    dispatch({type:GETALL_LEECTURERS_REQUEST})
    try{
   const response= await axios.get(buildUrl(`/admin/getAllLecturers?pageNumber=${pageNumber}&pageSize=20`),{headers:{
      "Content-Type": "application/json",
      "Authorization": `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`
    }})
    dispatch({type:GETALL_LEECTURERS_SUCCESS,payload:response.data,meta:{append}})
    }
    catch(error){
        dispatch({type:GETALL_LEECTURERS_FAILURE,payload:error.response.data.message})
    }
}

export const getSearchedLecturers = (key, pageNumber = 1, append = false) => async (dispatch) => {
  dispatch({ type: GETALL_LEECTURERS_REQUEST });
  try {
    const response = await axios.get(
      buildUrl(`/admin/getSearchLecturers?pageNumber=${pageNumber}&pageSize=20&key=${key}`),
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`,
        },
      }
    );
    dispatch({ type: GETALL_LEECTURERS_SUCCESS, payload: response.data, meta: { append } });
  } catch (error) {
    dispatch({
      type: GETALL_LEECTURERS_FAILURE,
      payload: error.response?.data?.message || "Search failed",
    });
  }
};

export const getUsers=(pageNumber = 1, append = false)=>async (dispatch)=>{
    dispatch({type:GETALL_USERS_REQUEST})
    try{
   const response= await axios.get(buildUrl(`/admin/getAllUsers?pageNumber=${pageNumber}&pageSize=20`),{headers:{
      "Content-Type": "application/json",
      "Authorization": `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`
    }})
    dispatch({type:GETALL_USERS_SUCCESS,payload:response.data,meta:{append}})
   
    }
    catch(error){
        dispatch({type:GETALL_USERS_FAILURE,payload:error.response.data.message})
    }
}

export const getAllUserTestAns=()=>async (dispatch)=>{
    dispatch({type:GETALL_USER_TESTANS_REQUEST})
    try{
   const response= await axios.get(buildApiUrl("/getUserTestAns"),{headers:{
      "Content-Type": "application/json",
      "Authorization": `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`
    }})
    dispatch({type:GETALL_USER_TESTANS_SUCCESS,payload:response.data})
    }
    catch(error){
        dispatch({type:GETALL_USER_TESTANS_FAILURE,payload:error.response.data.message})
    }
}


export const getAllStudents=(pageNumber, append = false)=>async (dispatch)=>{
    dispatch({type:GETALL_STUDENTS_REQUEST})
    try{
   const response= await axios.get(buildUrl(`/admin/getStudents?pageNumber=${pageNumber}&pageSize=20`),{headers:{
      "Content-Type": "application/json",
      "Authorization": `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`
    }})
    dispatch({type:GETALL_STUDENTS_SUCCESS,payload:response.data,meta:{append}})
    }
    catch(error){
        dispatch({type:GETALL_STUDENTS_FAILURE,payload:error.response.data.message})
    }
}

export const getSearchedStudents=(key,pageNumber, append = false)=>async (dispatch)=>{
    dispatch({type:GETALL_STUDENTS_REQUEST})
    try{
   const response= await axios.get(buildUrl(`/admin/getSearchedStudents?pageNumber=${pageNumber}&pageSize=20&key=${key}`),{headers:{
      "Content-Type": "application/json",
      "Authorization": `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`
    }})
    dispatch({type:GETALL_STUDENTS_SUCCESS,payload:response.data,meta:{append}})
    }
    catch(error){
        dispatch({type:GETALL_STUDENTS_FAILURE,payload:error.response.data.message})
    }
}
