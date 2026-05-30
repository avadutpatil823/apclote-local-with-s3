import { SUBJECTS_FAILURE } from "../BatchsAndCoursesAndSubjects/ActionType"
import { CREATE_TEST_FAILURE, CREATE_TEST_REQUEST, CREATE_TEST_SUCCESS, CREATECLASS_FAILURE, CREATECLASS_REQUEST, CREATECLASS_SUCCESS, CREATECLASSROOM_FAILURE, CREATECLASSROOM_REQUEST, CREATECLASSROOM_SUCCESS, LECTURER_PROGRESS_RESET, LECTURER_PROGRESS_SET, SUBMIT_TEST_FAILURE, SUBMIT_TEST_REQUEST, SUBMIT_TEST_SUCCESS, UPLOAD_NOTES_FAILURE, UPLOAD_NOTES_REQUEST, UPLOAD_NOTES_SUCCESS, UPLOAD_VIDEO_FAILURE, UPLOAD_VIDEO_REQUEST, UPLOAD_VIDEO_SUCCESS } from "./ActionType"

const initialState={
    isloading:null,
    error:null,
    message:"",
    userTestAnswer:null,
    uploadProgress:0
}

export const lecturerWorkReducer=(state=initialState,action)=>{
    switch(action.type){
        case CREATECLASSROOM_REQUEST:
        case CREATECLASS_REQUEST:
        case UPLOAD_VIDEO_REQUEST:
        case UPLOAD_NOTES_REQUEST:
        case CREATE_TEST_REQUEST:
        case SUBMIT_TEST_REQUEST:
            return {...state,isloading:true,error:null,uploadProgress:0}
        case CREATECLASSROOM_SUCCESS:
        case CREATECLASS_SUCCESS:
        case UPLOAD_VIDEO_SUCCESS:
        case UPLOAD_NOTES_SUCCESS:
        case CREATE_TEST_SUCCESS:
            return {...state,isloading:false,error:null,message:action.payload,uploadProgress:100}
        case SUBMIT_TEST_SUCCESS:
            return {...state,isloading:false,error:null,userTestAnswer:action.payload}
        case CREATECLASSROOM_FAILURE:
        case CREATECLASS_FAILURE:
        case UPLOAD_VIDEO_FAILURE:
        case UPLOAD_NOTES_FAILURE:
        case CREATE_TEST_FAILURE:
        case SUBMIT_TEST_FAILURE:
        case SUBJECTS_FAILURE:
            return {...state,isloading:false,error:action.payload,uploadProgress:0}
        case LECTURER_PROGRESS_SET:
            return {...state,uploadProgress:action.payload}
        case LECTURER_PROGRESS_RESET:
            return {...state,uploadProgress:0}
        default:
            return state
    }
}
