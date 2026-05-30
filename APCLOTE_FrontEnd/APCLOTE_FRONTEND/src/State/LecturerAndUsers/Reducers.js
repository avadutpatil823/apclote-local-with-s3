import { GETALL_LEECTURERS_FAILURE, GETALL_LEECTURERS_REQUEST, GETALL_LEECTURERS_SUCCESS, GETALL_STUDENTS_FAILURE, GETALL_STUDENTS_REQUEST, GETALL_STUDENTS_SUCCESS, GETALL_USER_TESTANS_REQUEST, GETALL_USER_TESTANS_SUCCESS, GETALL_USERS_FAILURE, GETALL_USERS_REQUEST, GETALL_USERS_SUCCESS } from "./ActionType"

const initialState={
    lecturers:[],
    users:[],
    students:[],
    error:null,
    isloading:false,
    userAllTA:null,
    page:1,
    totalPages:1
    }

export const lecturerUserReducer=(state=initialState,action)=>{
    switch(action.type){
        case GETALL_LEECTURERS_REQUEST:
            return {...state,isloading:true,error:null}
        case GETALL_LEECTURERS_SUCCESS:
            return {...state,isloading:false,error:null,lecturers:action.meta?.append ? [...state.lecturers, ...(action.payload.content || [])] : action.payload.content,page:action.payload.number+1,totalPages:action.payload.totalPages}
        case GETALL_LEECTURERS_FAILURE:
            return {...state,isloading:false,error:action.payload}
        case GETALL_USERS_REQUEST:
            return {...state,isloading:true,error:null}
        case GETALL_USERS_SUCCESS:
            return {...state,isloading:false,error:null,users:action.meta?.append ? [...state.users, ...(action.payload.content || [])] : action.payload.content,page:action.payload.number+1,totalPages:action.payload.totalPages}
        case GETALL_USERS_FAILURE:
            return {...state,isloading:false,error:action.payload}
        case GETALL_USER_TESTANS_REQUEST:
            return {...state,isloading:true,error:null}
        case GETALL_USER_TESTANS_SUCCESS:
            return {...state,isloading:false,error:null,userAllTA:action.payload}
        case GETALL_USER_TESTANS_SUCCESS:
            return {...state,isloading:false,error:action.payload}
        case GETALL_STUDENTS_REQUEST:
            return {...state,isloading:true,error:null}
        case GETALL_STUDENTS_SUCCESS:
            return {...state,isloading:false,error:null,students:action.meta?.append ? [...state.students, ...(action.payload.content || [])] : action.payload.content,page:action.payload.number+1,totalPages:action.payload.totalPages}
        case GETALL_STUDENTS_FAILURE:
            return {...state,isloading:false,error:action.payload}
        default:
            return state
    }
}
