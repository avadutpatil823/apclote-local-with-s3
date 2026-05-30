import { ASSIGN_FAILURE, ASSIGN_REQUEST, ASSIGN_SUCCESS, CREATE_BATCH_FAILURE, CREATE_BATCH_REQUEST, CREATE_BATCH_SUCCESS, CREATE_COURSE_FAILURE, CREATE_COURSE_REQUEST, CREATE_COURSE_SUCCESS, CREATE_LECTURER_FAILURE, CREATE_LECTURER_REQUEST, CREATE_LECTURER_SUCCESS, CREATE_SUBJECT_FAILURE, CREATE_SUBJECT_REQUEST, CREATE_SUBJECT_SUCCESS } from "./ActionType"

const initialState={
    message:null,
    error:null,
    isloading:false
}

export const addingReducer=(state=initialState,action)=>{
    switch(action.type){
        case CREATE_SUBJECT_REQUEST:
        case CREATE_BATCH_REQUEST:
        case CREATE_COURSE_REQUEST:
        case CREATE_LECTURER_REQUEST:
        case ASSIGN_REQUEST:
            return {...state,isloading:true,error:null}
        case CREATE_SUBJECT_FAILURE:
        case CREATE_BATCH_FAILURE:
        case CREATE_COURSE_FAILURE:
        case CREATE_LECTURER_FAILURE:
        case ASSIGN_FAILURE:
            return {...state,isloading:false,error:action.payload}
        case CREATE_SUBJECT_SUCCESS:
        case CREATE_BATCH_SUCCESS:
        case CREATE_COURSE_SUCCESS:
        case CREATE_LECTURER_SUCCESS:
        case ASSIGN_SUCCESS:
            return {...state,isloading:false,message:"created/assigned Successufully"}
        default:
            return state
    }
}