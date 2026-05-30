import { combineReducers, configureStore } from "@reduxjs/toolkit";
//import { default as thunk } from "redux-thunk"; 

// Example slice (you can replace with your real slices)

import { authReducers } from "../State/Auth/Reducers";
import { batchReducer } from "../State/BatchsAndCoursesAndSubjects/Reducers";
import { addingReducer } from "../State/AddingOrCreating/Reducers";
import { lecturerUserReducer } from "../State/LecturerAndUsers/Reducers";
import { poAndPaymentreducer } from "../State/POAndPayment/Reducers";
import { lecturerWorkReducer } from "../State/lecutrersState/Reducers";

// Combine all slices
export const store = configureStore({
  reducer: {
    auth: authReducers,
    batchs: batchReducer,
    adding: addingReducer,
    lecturesAndUsers: lecturerUserReducer,
    poAndPa: poAndPaymentreducer,
    lecturerWork: lecturerWorkReducer,
  },
});
export default store;

