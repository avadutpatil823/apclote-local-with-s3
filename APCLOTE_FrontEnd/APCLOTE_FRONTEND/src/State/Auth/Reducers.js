import { toast } from "react-toastify"
import { GETUSER_FAILURE, GETUSER_REQUEST, GETUSER_SUCCESS, LOGIN_FAILURE, LOGIN_REQUEST, LOGIN_SUCCESS, REGISTER_FAILURE, REGISTER_REQUEST, REGISTER_SUCCESS } from "./ActionType"

const initailState={
    user:null,
    isloading:false,
    error:null,
    jwt:"",
    loginMessage:""
}



export const authReducers=(state=initailState,action)=>{
    switch(action.type){
        case REGISTER_FAILURE:
            return {...state,isloading:false,error:action.payload}
        case LOGIN_FAILURE:
            return {...state,isloading:false,error:action.payload}
        case REGISTER_REQUEST:
             return {...state,isloading:true,error:null}
        case LOGIN_REQUEST:
            return {...state,isloading:true,error:null}
        case REGISTER_SUCCESS:
            return {...state,isloading:false,error:null,user:action.payload}
        case LOGIN_SUCCESS:
            return {...state,isloading:false,error:null,jwt:action.payload.token,loginMessage:action.payload.message}
        case GETUSER_REQUEST:
            return {...state,isloading:true,error:null}
        case GETUSER_SUCCESS:
            return {...state,isloading:false,error:null,user:action.payload}
        case GETUSER_FAILURE:
            return {...state,isloading:false,error:action.payload}
        default:
            return state
    }
}
