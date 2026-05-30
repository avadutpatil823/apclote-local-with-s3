import { useDispatch, useSelector } from "react-redux";
import StreamStuentBatchs from "./StreamStudentBatchs";
import { useWorkspaceRefresh } from "../../hooks/useWorkspaceRefresh";

function MyBatches() {
  const dispatch=useDispatch()
  const {auth}=useSelector(store=>store)
  const userRole = auth?.user?.role || JSON.parse(localStorage.getItem("USER") || "null")?.role || "ROLE_USER";
  useWorkspaceRefresh(dispatch, userRole);

  return (
    <div className="min-h-screen">
        <StreamStuentBatchs/>
    </div>
   
  );
}

export default MyBatches;
