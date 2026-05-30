import axios from "axios"
import { CREATE_TEST_FAILURE, CREATE_TEST_REQUEST, CREATE_TEST_SUCCESS, CREATECLASS_FAILURE, CREATECLASS_REQUEST, CREATECLASS_SUCCESS, CREATECLASSROOM_FAILURE, CREATECLASSROOM_REQUEST, CREATECLASSROOM_SUCCESS, LECTURER_PROGRESS_RESET, LECTURER_PROGRESS_SET, SUBMIT_TEST_FAILURE, SUBMIT_TEST_REQUEST, SUBMIT_TEST_SUCCESS, UPLOAD_NOTES_FAILURE, UPLOAD_NOTES_REQUEST, UPLOAD_NOTES_SUCCESS, UPLOAD_VIDEO_FAILURE, UPLOAD_VIDEO_REQUEST, UPLOAD_VIDEO_SUCCESS } from "./ActionType"
import { toast } from "react-toastify"
import { buildApiUrl, buildUrl } from "../../config/api"

const getErrorMessage = (error, fallback) => {
    const data = error?.response?.data

    if (typeof data === "string") {
        return data
    }

    if (data?.message) {
        return data.message
    }

    if (data?.error) {
        return data.error
    }

    return error?.message || fallback
}

export const createClassrOOM=(name,batchId,subjectId)=>async (dispatch)=>{
    dispatch({type:CREATECLASSROOM_REQUEST})
   
    try{
   const response= await axios.get(buildUrl(`/lecturer/createClassRoom?name=${encodeURIComponent(name)}&batchId=${batchId}&subjectId=${subjectId}`),{headers:{
      "Content-Type": "application/json",
      "Authorization": `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`
    }})
    dispatch({type:CREATECLASSROOM_SUCCESS,payload:"ClassRoom Created Succesufully"})
    toast.success("ClassRoom Created Successufully")
    return true
    }
    catch(error){
        dispatch({type:CREATECLASSROOM_FAILURE,payload:error?.response?.data?.message || "Failed To Created ClassRoom"})
         toast.error("Failed To Created ClassRoom")
         return false
    }
}

export const createClass=(class1)=>async (dispatch)=>{
    dispatch({type:CREATECLASS_REQUEST})
    try{
   const response= await axios.post(buildUrl("/lecturer/createClass"),class1,{headers:{
      "Content-Type": "application/json",
      "Authorization": `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`
    }})
    dispatch({type:CREATECLASS_SUCCESS,payload:"Class Created Succesufully"})
    toast.success("Class Created Successfully. Student email notifications are being sent.")
    return true
    }
    catch(error){
        const message = getErrorMessage(error, "Failed To Create Class")
        dispatch({type:CREATECLASS_FAILURE,payload:message})
        toast.error(message)
        return false
    }
    
}

export const uploadVideo = (formData) => async (dispatch) => {

  dispatch({ type: UPLOAD_VIDEO_REQUEST });
  dispatch({ type: LECTURER_PROGRESS_RESET });

  try {

    const response = await axios.post(
      buildUrl("/lecturer/uploadVideo"),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`
        },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) {
            return;
          }

          const progress = Math.min(100, Math.round((progressEvent.loaded * 100) / progressEvent.total));
          dispatch({ type: LECTURER_PROGRESS_SET, payload: progress });
        },
      }
    );


    dispatch({
      type: UPLOAD_VIDEO_SUCCESS,
      payload: "Video stream prepared successfully"
    });

    toast.success("Video stream prepared successfully");
    return true;

  } catch (error) {

    dispatch({
      type: UPLOAD_VIDEO_FAILURE,
      payload: error?.response?.data?.message || "Upload failed"
    });

    toast.error("Failed to upload video");
    return false;
  }
};

export const uploadNotes=(title,classId,formData)=>async (dispatch)=>{
    dispatch({type:UPLOAD_NOTES_REQUEST})
    dispatch({type:LECTURER_PROGRESS_RESET})
    try{
   const response= await axios.post(buildUrl(`/lecturer/uploadNotes?title=${encodeURIComponent(title)}&classId=${classId}`),formData,{headers:{
      "Content-Type": "multipart/form-data",
      "Authorization": `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`
    },
    onUploadProgress: (progressEvent) => {
      if (!progressEvent.total) {
        return;
      }

      const progress = Math.min(100, Math.round((progressEvent.loaded * 100) / progressEvent.total));
      dispatch({ type: LECTURER_PROGRESS_SET, payload: progress });
    }})
    dispatch({type:UPLOAD_NOTES_SUCCESS,payload:"Notes Uploaded Succesufully"})
    toast.success("Notes Uploaded Successfully")
    return true
    }
    catch(error){
        dispatch({type:UPLOAD_NOTES_FAILURE,payload:error?.response?.data?.message || "Failed to Upload Notes"})
        toast.error("Failed to Upload Notes")
        return false
    }
}

export const createTest=(test,classId)=>async (dispatch)=>{
    dispatch({type:CREATE_TEST_REQUEST})
    dispatch({type:LECTURER_PROGRESS_RESET})
    
    try{
   const response= await axios.post(buildUrl(`/lecturer/crateTest?classId=${classId}`),test,{headers:{
      "Content-Type": "application/json",
      "Authorization": `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`
    }})
    dispatch({type:CREATE_TEST_SUCCESS,payload:"Test Created Succesufully"})
    toast.success("Test Created Successfully")
    return true
    }
    catch(error){
        dispatch({type:CREATE_TEST_FAILURE,payload:error?.response?.data?.message || "Failed To Create Test"})
        toast.error("Failed To Create Test")
        return false
    }
}

export const submitTest=(testId,userAnswers)=>async (dispatch)=>{
    dispatch({type:SUBMIT_TEST_REQUEST})
    
    try{
   const response= await axios.get(buildApiUrl(`/submitTest?testId=${testId}&userAnswers=${userAnswers}`),{headers:{
      "Content-Type": "application/json",
      "Authorization": `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`
    }})

   
    dispatch({type:SUBMIT_TEST_SUCCESS,payload:response.data})
     response.data.test==null?toast.error("AllReady Submitted Cant Submit Again"):toast.success("Test Submitted Successfully")
     return response.data.test != null
     
    }
    catch(error){
        dispatch({type:SUBMIT_TEST_FAILURE,payload:error?.response?.data?.message || "Failed To Submit The Test"})
        toast.error("Failed To Submit The Test")
        return false
    }
}
