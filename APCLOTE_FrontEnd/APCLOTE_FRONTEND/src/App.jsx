import './App.css'
import { useEffect } from 'react';
import Register from './Auth/Register'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import ErrorBoundary from './assets/ErrorBoundary'
import Login from './Auth/Login';
import NavBar from './Compoents/User/NavBar';
import Home from './Compoents/User/Home';
import Batch from './Compoents/Batch';
import AddSubjectForm from './Compoents/Admin/AddSubjectForm';
//import CreateCourseForm from './Compoents/Admin/CreateCourseForm';
import CreateBatchForm from './Compoents/Admin/CreateBatchFrom';
import CreateLecturerForm from './Compoents/Admin/CreateLectureForm';
import AssignBatchLecturerSubject from './Compoents/Admin/AssignBatchLecturerSubject ';
import CreateCourseForm2 from './Compoents/Admin/CourseForm';
import MyBatches from './Compoents/Student/MyBatchs';
import Dashboard from './Compoents/Student/Dashboard';
import AllBatches from './Compoents/User/AllBatchs';
import AllLecturersTable from './Compoents/Admin/AllLecturers';
import LecturerDetails from './Compoents/Admin/LecturerDetails';
import CreateOrder from './Compoents/User/CreateOrder';
import BatchDetails from './Compoents/User/BatchDetails';
import MyPurchaseOrders from './Compoents/Student/MyPurchaseOrdes';
import Payment from './Compoents/User/Payment';
import UploadVideo from './Compoents/Lecturer/UploadVideo';
import CreateTest from './Compoents/Lecturer/CreateTest';
import LectersBatchs from './Compoents/Lecturer/LectersBatchs';
import LecturerClasses from './Compoents/Lecturer/LecturerClasses';
import StreamBatch from './Compoents/Stream/StreamBatch';
import CreateClassRoom from './Compoents/Lecturer/CreateClassRoom';
import CreateClass from './Compoents/Lecturer/CreateClass';
import StreamMyBatchs from './Compoents/Stream/StreamMyBatchs';
import StreamClassRoom from './Compoents/Stream/StreamClassRoom';
import StreamClass from './Compoents/Stream/StreamClass';
import UploadNotes from './Compoents/Lecturer/UploadNotes';
import VideoPlayer from './Compoents/Stream/VideoPlayer';
import NoteViewer from './Compoents/Stream/NoteViewer';
import UserAnswers from './Compoents/Stream/UserAnswers';
import UserTestAns from './Compoents/Stream/UserTestAns';
import UTA from './Compoents/Stream/UTA';
import UpdateLecturer from './Compoents/Admin/UpdateLecturer';
import AllStudentsTable from './Compoents/Admin/AllStudents';
import AllUsers from './Compoents/Admin/AllUsers';
import StudentDetails from './Compoents/Admin/StudentDetails';
import BatchStudents from './Compoents/Admin/BatchStudents';
import DeleteRequests from './Compoents/Admin/DeleteRequests';
import SubAdmins from './Compoents/Admin/SubAdmins';
import AdminLogs from './Compoents/Admin/AdminLogs';
import AdminCatalog from './Compoents/Admin/AdminCatalog';
import ForgotPassword from './Compoents/User/ForgotPassword';
import VerifyOtp from './Compoents/User/VerifyOtp';
import ResetPassword from './Compoents/User/ResetPassword';
import APCLOTEFooter from './Compoents/User/APCLOTEFooter';
import AboutUs from './Compoents/User/AboutUs';
import APCLOTEPricing from './Compoents/User/APCLOTEPricing';
import APCLOTEContact from './Compoents/User/APCLOTEContact';
import APCLOTEBlog from './Compoents/User/APCLOTEBlog';
import OAuth2RedirectHandler from './Auth/OAuth2RedirectHandler';
import Terms from './Compoents/User/Terms';
import Privacy from './Compoents/User/Privacy';
import ResourceRedirect from './Compoents/User/ResourceRedirect';
import FounderDetails from './Compoents/User/Founder';
import PaymentPage from './Compoents/User/PaymentPage';
import ChatBot from './Compoents/AI/ChatBot';
import AIMentor from './Compoents/AI/AIMentor';
import Shorts from './Compoents/shorts/Shorts';
import { consumeSessionLogoutMessage, installSessionGuard } from './config/sessionGuard';

function RequireLogin({ children }) {
  const location = useLocation();
  const redirect = `${location.pathname}${location.search}`;

  if (!localStorage.getItem("JWT")) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  return children;
}

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search]);

  return null;
}

function AppRoutes() {
  const location = useLocation();
  const immersiveRoutes = ["/chat", "/mentor", "/shorts"];
  const isImmersiveRoute = immersiveRoutes.includes(location.pathname);

  return (
    <>
      <ScrollToTop />
      <ToastContainer
        toastClassName="toast-theme"
        position="top-center"
        autoClose={10000}
        style={{ left: "50%", transform: "translateX(-50%)", width: "80vw", maxWidth: "80vw" }}
      />
      <NavBar/>
      <main className={isImmersiveRoute ? "app-main app-main--immersive" : "app-main"}>
      <Routes>
         <Route path='/' element={<ErrorBoundary> <Home/> </ErrorBoundary>}/>
        <Route path="/register" element={ <ErrorBoundary><Register/></ErrorBoundary>   }/>
        <Route path="/login" element={ <ErrorBoundary><Login/></ErrorBoundary>   }/>
        <Route path="/batch/:id" element={ <ErrorBoundary><Batch/></ErrorBoundary>   }/>
        <Route path='/oauth' element={<OAuth2RedirectHandler/>}/> 


        <Route path="/addSubject" element={ <ErrorBoundary><AddSubjectForm/></ErrorBoundary>   }/>
        <Route path="/createCourse" element={ <ErrorBoundary><CreateCourseForm2/></ErrorBoundary>   }/>
        <Route path="/createBatch" element={ <ErrorBoundary><CreateBatchForm/></ErrorBoundary>   }/>
        <Route path="/createLecturer" element={ <ErrorBoundary><CreateLecturerForm/></ErrorBoundary>   }/>
        <Route path="/assign" element={ <ErrorBoundary><AssignBatchLecturerSubject/></ErrorBoundary>   }/>
        <Route path="/myBatchs" element={ <ErrorBoundary><MyBatches/></ErrorBoundary>   }/>
        <Route path="/dashboard" element={ <ErrorBoundary><Dashboard/></ErrorBoundary>   }/>
        <Route path="/allBatchs" element={ <ErrorBoundary><AllBatches/></ErrorBoundary>   }/>
        <Route path="/allLecturers" element={ <ErrorBoundary><AllLecturersTable/></ErrorBoundary>   }/>
        <Route path="/lecturerDetails/:lecturerId" element={ <ErrorBoundary><LecturerDetails/></ErrorBoundary>   }/>
        <Route path="/createOrder" element={ <ErrorBoundary><CreateOrder/></ErrorBoundary>   }/>
        <Route path="/myPOs" element={ <ErrorBoundary><MyPurchaseOrders/></ErrorBoundary>   }/>
        <Route path="/pay" element={ <ErrorBoundary><Payment/></ErrorBoundary>   }/>

         <Route path="/dopay" element={ <ErrorBoundary><PaymentPage/></ErrorBoundary>   }/>

         <Route path="/uploadVideo" element={ <ErrorBoundary><UploadVideo/></ErrorBoundary>   }/>
          <Route path="/uploadNotes" element={ <ErrorBoundary><UploadNotes/></ErrorBoundary>   }/>
       <Route path="/createTest" element={ <ErrorBoundary><CreateTest/></ErrorBoundary>   }/>
        <Route path="/lecturerBatchs" element={ <ErrorBoundary><LectersBatchs/></ErrorBoundary>   }/>
        <Route path="/lecturerClasses" element={ <ErrorBoundary><RequireLogin><LecturerClasses/></RequireLogin></ErrorBoundary>   }/>
       <Route path="/streamBatch" element={ <ErrorBoundary><RequireLogin><StreamBatch/></RequireLogin></ErrorBoundary>   }/>
       <Route path="/streamMyBatchs" element={ <ErrorBoundary><StreamMyBatchs/></ErrorBoundary>   }/>
      < Route path="/streamClassRoom" element={ <ErrorBoundary><RequireLogin><StreamClassRoom/></RequireLogin></ErrorBoundary>   }/>
       < Route path="/streamClass" element={ <ErrorBoundary><RequireLogin><StreamClass/></RequireLogin></ErrorBoundary>   }/>
       < Route path="/videoPlayer" element={ <ErrorBoundary><VideoPlayer/></ErrorBoundary>   }/>
       < Route path="/noteViewer" element={ <ErrorBoundary><NoteViewer/></ErrorBoundary>   }/>
       < Route path="/userAnswers" element={ <ErrorBoundary><UserAnswers/></ErrorBoundary>   }/>
       < Route path="/userTestAns" element={ <ErrorBoundary><UserTestAns/></ErrorBoundary>   }/>
       < Route path="/UTA" element={ <ErrorBoundary><UTA/></ErrorBoundary>   }/>
       < Route path="/updateLecturer" element={ <ErrorBoundary><UpdateLecturer/></ErrorBoundary>   }/>
      < Route path="/allStudents" element={ <ErrorBoundary><AllStudentsTable/></ErrorBoundary>   }/>
      < Route path="/allUsers" element={ <ErrorBoundary><AllUsers/></ErrorBoundary>   }/>
      < Route path="/studentDetails/:studentId" element={ <ErrorBoundary><StudentDetails/></ErrorBoundary>   }/>
      < Route path="/batchStudents" element={ <ErrorBoundary><BatchStudents/></ErrorBoundary>   }/>
      < Route path="/adminStudentDashboard/:studentId" element={ <ErrorBoundary><Dashboard/></ErrorBoundary>   }/>
      < Route path="/deleteRequests" element={ <ErrorBoundary><DeleteRequests/></ErrorBoundary>   }/>
      < Route path="/subAdmins" element={ <ErrorBoundary><SubAdmins/></ErrorBoundary>   }/>
      < Route path="/adminLogs" element={ <ErrorBoundary><AdminLogs/></ErrorBoundary>   }/>
      < Route path="/adminCatalog" element={ <ErrorBoundary><AdminCatalog/></ErrorBoundary>   }/>
      < Route path="/batchDetails" element={ <ErrorBoundary><BatchDetails/></ErrorBoundary>   }/>

      < Route path="/chat" element={ <ErrorBoundary><ChatBot/></ErrorBoundary>   }/>
      < Route path="/mentor" element={ <ErrorBoundary><AIMentor/></ErrorBoundary>   }/>
      < Route path="/shorts" element={ <ErrorBoundary><Shorts/></ErrorBoundary>   }/>
      < Route path="/shorts" element={ <ErrorBoundary><Shorts/></ErrorBoundary>   }/>
       
     
       <Route path="/createClassRoom" element={ <ErrorBoundary><CreateClassRoom/></ErrorBoundary>   }/>
       <Route path="/createClass" element={ <ErrorBoundary><CreateClass/></ErrorBoundary>   }/>
      
       <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/about" element={<AboutUs />} />
      <Route path="/pricing" element={<APCLOTEPricing />} />
      <Route path="/contact" element={<APCLOTEContact />} />
       <Route path="/blog" element={<APCLOTEBlog />} />

      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/resourceRedirect" element={<ResourceRedirect />} />
      <Route path="/founders" element={<FounderDetails />} />

      



      </Routes>
      </main>
      {!isImmersiveRoute && <APCLOTEFooter/>}
    </>
  )
}

function App() {
  useEffect(() => {
    installSessionGuard();
    const message = consumeSessionLogoutMessage();
    if (message) {
      toast.error(message);
    }
  }, []);

  return (
    <div className="app-shell">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  )
}

export default App
