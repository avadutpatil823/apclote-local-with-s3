import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { getLecturerBatchs } from '../../State/BatchsAndCoursesAndSubjects/Action'
import StreamMyBatchs from '../Stream/StreamMyBatchs'
import axios from 'axios'
import { buildUrl } from '../../config/api'

const LectersBatchs = () => {
  const dispatch=useDispatch()
  const navigate=useNavigate()
  const {batchs}=useSelector(store=>store)
   const [lbs,setLbs]=useState([])
  // Fetch batches from backend
  useEffect(() => {
    dispatch(getLecturerBatchs())
    getLBS()
  }, [dispatch]);

const getLBS = async () => {
    try {
      const response = await axios.get(buildUrl("/lecturer/getLBS"), {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`
        },
      });

      const data = await response.data;
      setLbs(data);
    } catch (error) {
    }
  };

  return (
    <div className='min-h-screen'>
        <StreamMyBatchs lbs={lbs} />
    </div>
   
  );
}

export default LectersBatchs
