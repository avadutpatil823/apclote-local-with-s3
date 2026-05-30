import React, { useEffect, useMemo, useState } from "react";
import { SyncLoader } from "react-spinners";
import { toast } from "react-toastify";
import axios from "axios";
import { buildUrl } from "../../config/api";

const CreateLecturerForm = () => {
  const [pass,setPass]=useState("")
  const [loader,setLoader]=useState(false)
  const [mode, setMode] = useState("new");
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "ROLE_LECTURER",
    password: "",
    phono: "",
    address: ""
  });

  const [lecturer, setLecturer] = useState({
    salary: "",
    dateOfJoining: ""
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await axios.get(buildUrl("/admin/getAllUsers?pageNumber=1&pageSize=100"), {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`
          }
        });
        setUsers(response.data?.content || []);
      } catch (error) {
      }
    };

    loadUsers();
  }, []);

  const availableUsers = useMemo(() => {
    const key = userSearch.trim().toLowerCase();

    return users
      .filter((item) => item.role !== "ROLE_LECTURER")
      .filter((item) => {
        if (!key) {
          return true;
        }

        return item.name?.toLowerCase().includes(key) || item.email?.toLowerCase().includes(key);
      });
  }, [users, userSearch]);

  const getErrorMessage = async (response, fallback) => {
    try {
      const data = await response.json();
      return data?.message || data?.error || fallback;
    } catch (error) {
      return fallback;
    }
  };

  // Handle input changes
  const handleUserChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };
  const passwordChange=(e)=>{
    setPass(e.target.value)
  }

  const handleLecturerChange = (e) => {
    setLecturer({ ...lecturer, [e.target.name]: e.target.value });
  };

  // Submit form (Register User -> Create Lecturer)
  const handleSubmit = async (e) => {
    setLoader(true)
    e.preventDefault();

    try {
      let savedUser = null;

      if (mode === "existing") {
        savedUser = users.find((item) => item.id === Number(selectedUserId));
        if (!savedUser) {
          toast.error("Select an existing user first.");
          setLoader(false);
          return;
        }
      } else {
        const userRes = await fetch(buildUrl("/auth/register"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(user)
        });

        if (!userRes.ok) throw new Error(await getErrorMessage(userRes, "Failed to register user"));
        savedUser = await userRes.json();
      }

      // 2. Create Lecturer with userId
      const senderParam = pass ? `&sender=${encodeURIComponent(pass)}` : "";
      const lecturerRes = await fetch(
        buildUrl(`/admin/createLecturer?userId=${savedUser.id}${senderParam}`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
           "Authorization": `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`
          },
          body: JSON.stringify(lecturer)
        }
      );

      if (!lecturerRes.ok) throw new Error(await getErrorMessage(lecturerRes, "Failed to create lecturer"));
      const savedLecturer = await lecturerRes.json();
       setLoader(false)
      toast.success("Lecturer Created Successfully!");

      // Reset form
      setUser({
        name: "",
        email: "",
        role: "ROLE_LECTURER",
        password: "",
        phono: "",
        address: ""
      });
      setLecturer({
        salary: "",
        dateOfJoining: ""
      });
      setSelectedUserId("");
      setPass("");
    } catch (err) {
      setLoader(false)
      toast.error(err.message || "Something went wrong!");
    }
  };

  return (
    <div className="page-shell">
      <form onSubmit={handleSubmit} className="form-shell surface-panel space-y-5">
        <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Lecturer Setup</span>
        <h2 className="title-dark text-3xl">Create Lecturer</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" className={mode === "new" ? "primary-btn" : "ghost-btn"} onClick={() => setMode("new")} disabled={loader}>
            New User
          </button>
          <button type="button" className={mode === "existing" ? "primary-btn" : "ghost-btn"} onClick={() => setMode("existing")} disabled={loader}>
            Existing User
          </button>
        </div>

        {/* User Info */}
        {mode === "existing" ? (
          <>
            <label className="field-label">Search Existing User</label>
            <input
              type="text"
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              className="field-input"
              placeholder="Search by name or email"
              disabled={loader}
            />
            <label className="field-label">Select User</label>
            <select className="field-select" value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)} required disabled={loader}>
              <option value="">Select user</option>
              {availableUsers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.email})
                </option>
              ))}
            </select>
          </>
        ) : (
          <>
            <label className="field-label">Full Name</label>
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleUserChange}
              className="field-input"
              placeholder="Enter Name"
              required
              disabled={loader}
            />

            <label className="field-label">Email</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleUserChange}
              className="field-input"
              placeholder="Enter Email"
              required
              disabled={loader}
            />

            <label className="field-label">Password</label>
            <input
              type="password"
              name="password"
              value={user.password}
              onChange={(e)=>{
                handleUserChange(e);
                passwordChange(e);
              }}
              className="field-input"
              placeholder="Enter Password"
              required
              disabled={loader}
            />

            <label className="field-label">Phone</label>
            <input
              type="text"
              name="phono"
              value={user.phono}
              onChange={handleUserChange}
              className="field-input"
              placeholder="Enter Phone"
              required
              disabled={loader}
            />

            <label className="field-label">Address</label>
            <input
              type="text"
              name="address"
              value={user.address}
              onChange={handleUserChange}
              className="field-input"
              placeholder="Enter Address"
              required
              disabled={loader}
            />
          </>
        )}

        {/* Lecturer Info */}
        <label className="field-label">Salary</label>
        <input
          type="number"
          name="salary"
          value={lecturer.salary}
          onChange={handleLecturerChange}
          className="field-input"
          placeholder="Enter Salary"
          required
          disabled={loader}
        />

        <label className="field-label">Date of Joining</label>
        <input
          type="date"
          name="dateOfJoining"
          value={lecturer.dateOfJoining}
          onChange={handleLecturerChange}
          className="field-input"
          required
          disabled={loader}
        />

        {/* Submit */}
       
        <button
          type="submit"
          disabled={loader}
          className="primary-btn w-full disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loader? <SyncLoader color='white'/>:"Create Lecturer"} 
        </button>
      </form>
    </div>
  );
};

export default CreateLecturerForm;
