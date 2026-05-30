import { toast } from "react-toastify"
import { CREATE_PO_FAILURE, CREATE_PO_REQUEST, CREATE_PO_SUCCESS, GETALL_PO_FAILURE, GETALL_PO_REQUEST, GETALL_PO_SUCCESS, GETMY_PO_FAILURE, GETMY_PO_REQUEST, GETMY_PO_SUCCESS, MAKE_PAYMENT_FAILURE, MAKE_PAYMENT_REQUEST, MAKE_PAYMENT_SUCCESS } from "./ActionType"

const initialState={
    isloading:false,
    po:null,
    allPos:[],
    myPos:[],
    error:null,
    payment:null
}

export const poAndPaymentreducer=(state=initialState,action)=>{
    switch(action.type){
        case CREATE_PO_REQUEST:
        case GETALL_PO_REQUEST:
        case GETMY_PO_REQUEST:
        case MAKE_PAYMENT_REQUEST:
            return {...state,isloading:true,error:null}
        case CREATE_PO_FAILURE:
        case GETALL_PO_FAILURE:
        case GETMY_PO_FAILURE:
        case MAKE_PAYMENT_FAILURE:
            return {...state,isloading:false,error:action.payload}
        case CREATE_PO_SUCCESS:
            return {...state,isloading:false,error:null,po:action.payload}
        case GETALL_PO_SUCCESS:
            return {...state,isloading:false,error:null,allPos:action.payload}
        case GETMY_PO_SUCCESS:
            
            return {...state,isloading:false,error:null,myPos:action.payload}
        case MAKE_PAYMENT_SUCCESS:
            return {...state,isloading:false,error:null,payment:action.payload}
        default:
            return state
        

    }
}