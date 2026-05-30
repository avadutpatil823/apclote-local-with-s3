import { GET_COURSES_FAILURE, GET_COURSES_REQUEST, GET_COURSES_SUCCESS, GETALL_BATCHS_FAILURE, GETALL_BATCHS_REQUEST, GETALL_BATCHS_SUCCESS, GETMY_BATCHS_FAILURE, GETMY_BATCHS_REQUEST, GETMY_BATCHS_SUCCESS, LECTURER_GETMY_BATCHS_FAILURE, LECTURER_GETMY_BATCHS_REQUEST, LECTURER_GETMY_BATCHS_SUCCESS, SEARCH_BATCHS_FAILURE, SEARCH_BATCHS_REQUEST, SEARCH_BATCHS_SUCCESS, SUBJECTS_FAILURE, SUBJECTS_REQUEST, SUBJECTS_SUCCESS } from "./ActionType"

const initialState={
    allBatchs:[],
    isloading:null,
    error:null,
    myBatchs:[],
    lecturerBatchs:[],
    subjects:[],
    coursess:[],
    page:1,
    totalPages:1,
}


export const batchReducer=(state=initialState,action)=>{
    switch(action.type){
        case GETALL_BATCHS_REQUEST:
            return {...state,isloading:true,error:null}
        case GETALL_BATCHS_SUCCESS:
            return {...state,isloading:false,error:null,allBatchs:action.meta?.append ? [...state.allBatchs, ...(action.payload.content || [])] : action.payload.content,page:action.payload.number+1,totalPages:action.payload.totalPages}
        case GETALL_BATCHS_FAILURE:
            return {...state,isloading:false,error:action.payload}
        case GETMY_BATCHS_REQUEST:
            return {...state,isloading:true,error:null}
        case GETMY_BATCHS_SUCCESS:
            return {...state,isloading:false,error:null,myBatchs:action.payload}
        case GETMY_BATCHS_FAILURE:
            return {...state,isloading:false,error:action.payload}
         case LECTURER_GETMY_BATCHS_REQUEST:
            return {...state,isloading:true,error:null,lecturerBatchs:[]}
        case LECTURER_GETMY_BATCHS_SUCCESS:
            return {...state,isloading:false,error:null,lecturerBatchs:action.payload}
        case LECTURER_GETMY_BATCHS_FAILURE:
            return {...state,isloading:false,error:action.payload}
        case SUBJECTS_REQUEST:
            return {...state,isloading:true,error:null}
        case SUBJECTS_SUCCESS:
            return {...state,isloading:false,error:null,subjects:action.payload}
        case SUBJECTS_FAILURE:
            return {...state,isloading:false,error:action.payload}
        case SEARCH_BATCHS_REQUEST:
            return {...state,isloading:true,error:null}
        case SEARCH_BATCHS_SUCCESS:
            return {...state,isloading:false,error:null,allBatchs:action.payload}
        case SEARCH_BATCHS_FAILURE:
            return {...state,isloading:false,error:action.payload}
        case GET_COURSES_REQUEST:
            return {...state,isloading:true,error:null}
        case GET_COURSES_SUCCESS:
            return {...state,isloading:false,error:null,coursess:action.payload}
        case GET_COURSES_FAILURE:
            return {...state,isloading:false,error:action.payload}
        default:
            return state
    }
}
