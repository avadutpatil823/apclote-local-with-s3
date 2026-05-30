import React, { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUser, logOut } from "../../State/Auth/Action";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import LogoutIcon from "@mui/icons-material/Logout";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import PsychologyAltIcon from "@mui/icons-material/PsychologyAlt";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import { canAdminCreate, canAdminRead, canViewAdminPeople, isFullAdmin, isRootAdmin } from "./deleteResourceUtils";

const NavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const isLoggedIn = Boolean(localStorage.getItem("JWT"));

  const [anchorEl, setAnchorEl] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileOpen = () => setOpenProfile(true);
  const handleProfileClose = () => setOpenProfile(false);

  const handleLogout = () => {
    dispatch(logOut());
    handleProfileClose();
    navigate("/");
  };

  const userInitial = auth?.user?.name?.[0]?.toUpperCase() || "U";
  const userRole = auth?.user?.role?.replace("ROLE_", "")?.toLowerCase() || "member";
  const canViewPeople = canViewAdminPeople(auth?.user);
  const rootAdmin = isRootAdmin(auth?.user);
  const fullAdmin = isFullAdmin(auth?.user);
  const canViewDeleteRequests = fullAdmin || (auth?.user?.role === "ROLE_ADMIN" && auth?.user?.subAdmin && (auth?.user?.adminAction === "DELETE" || auth?.user?.adminAction === "FULL"));
  const profileDetails = [
    {
      label: "Name",
      value: auth?.user?.name || "Not available",
      icon: <PersonOutlineIcon fontSize="small" />,
    },
    {
      label: "Email",
      value: auth?.user?.email || "Not available",
      icon: <MailOutlineIcon fontSize="small" />,
    },
    {
      label: "Address",
      value: auth?.user?.address || "Not provided",
      icon: <HomeOutlinedIcon fontSize="small" />,
    },
  ];

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  return (
    <Box sx={{ flexGrow: 1, position: "sticky", top: 0, zIndex: 100 }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          borderRadius: 0,
          background: "linear-gradient(135deg, rgba(79,70,229,0.96), rgba(6,182,212,0.9))",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 18px 40px rgba(79, 70, 229, 0.18)",
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: "68px !important", sm: "72px !important", md: "76px !important" },
            gap: { xs: 1, sm: 1.25, md: 1.5 },
            width: { xs: "100%", sm: "min(1280px, calc(100% - 1.5rem))", md: "min(1280px, calc(100% - 2rem))" },
            mx: "auto",
            px: { xs: 1.25, sm: 0 },
          }}
        >
          <IconButton
            size="medium"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenuOpen}
            sx={{
              mr: { xs: 0, sm: 0.5, md: 1 },
              border: "1px solid rgba(255,255,255,0.14)",
              backgroundColor: "rgba(255,255,255,0.08)",
              flexShrink: 0,
              width: { xs: 42, sm: 44 },
              height: { xs: 42, sm: 44 },
              "&:hover": { backgroundColor: "rgba(255,255,255,0.16)" },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              minWidth: 0,
              display: "block",
            }}
          >
            <Link
              to="/"
              style={{
                color: "white",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                minWidth: 0,
              }}
            >
              <Box
                component="img"
                src="/logo.png"
                alt="APCLOTE"
                sx={{
                  width: { xs: 44, sm: 48, md: 52 },
                  height: { xs: 44, sm: 48, md: 52 },
                  borderRadius: { xs: 2, sm: 2.5 },
                  border: "1px solid rgba(255,255,255,0.3)",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                    fontWeight: 700,
                    fontSize: { xs: "0.98rem", sm: "1.06rem", md: "1.1rem" },
                    letterSpacing: "0.05em",
                    lineHeight: 1.1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  APCLOTE
                </Box>
                <Box
                  sx={{
                    display: { xs: "none", md: "block" },
                    fontSize: "0.8rem",
                    opacity: 0.82,
                    lineHeight: 1.3,
                    whiteSpace: "nowrap",
                  }}
                >
                  Learn, teach, and grow in one place
                </Box>
              </Box>
            </Link>
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: { xs: 0.75, sm: 1, md: 1.25 },
              flexShrink: 0,
            }}
          >
            {isLoggedIn && (
              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Button
                  component={Link}
                  to="/chat"
                  startIcon={<ChatBubbleOutlineIcon />}
                  sx={{
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.35)",
                    borderRadius: "999px",
                    px: 1.7,
                    py: 0.9,
                    textTransform: "none",
                    fontWeight: 700,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    whiteSpace: "nowrap",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.18)" },
                  }}
                >
                  Chat
                </Button>
                <Button
                  component={Link}
                  to="/mentor"
                  startIcon={<PsychologyAltIcon />}
                  sx={{
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.35)",
                    borderRadius: "999px",
                    px: 1.7,
                    py: 0.9,
                    textTransform: "none",
                    fontWeight: 700,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    whiteSpace: "nowrap",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.18)" },
                  }}
                >
                  AI Mentor
                </Button>
              </Box>
            )}

            {isLoggedIn ? (
              <Box
                sx={{
                  width: { xs: 42, sm: 46, md: 48 },
                  height: { xs: 42, sm: 46, md: 48 },
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f0f9ff",
                  color: "#4338ca",
                  fontWeight: 800,
                  border: "1px solid rgba(255,255,255,0.5)",
                  boxShadow: "0 10px 24px rgba(15,23,42,0.18)",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
                onClick={handleProfileOpen}
                title="View Profile"
              >
                {userInitial}
              </Box>
            ) : (
              <Button
                component={Link}
                to="/login"
                sx={{
                  color: "#312e81",
                  backgroundColor: "white",
                  borderRadius: "999px",
                  px: { xs: 1.8, sm: 2.4 },
                  py: 0.9,
                  textTransform: "none",
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  boxShadow: "0 10px 24px rgba(15,23,42,0.14)",
                  "&:hover": { backgroundColor: "#eef2ff" },
                }}
              >
                Sign In
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            mt: 1.5,
            borderRadius: 3,
            minWidth: { xs: 240, sm: 260 },
            border: "1px solid rgba(79,70,229,0.12)",
            boxShadow: "0 20px 60px rgba(26, 35, 33, 0.16)",
            overflow: "hidden",
          },
        }}
      >
        <MenuItem onClick={handleMenuClose} component={Link} to="/allBatchs">
          View Courses
        </MenuItem>

        {isLoggedIn && (
          <>
            <Divider sx={{ display: { md: "none" } }} />
            <MenuItem
              onClick={handleMenuClose}
              component={Link}
              to="/chat"
              sx={{ display: { md: "none" }, gap: 1.25 }}
            >
              <ChatBubbleOutlineIcon fontSize="small" />
              Chat
            </MenuItem>
            <MenuItem
              onClick={handleMenuClose}
              component={Link}
              to="/mentor"
              sx={{ display: { md: "none" }, gap: 1.25 }}
            >
              <PsychologyAltIcon fontSize="small" />
              AI Mentor
            </MenuItem>
          </>
        )}

        {auth?.user?.role === "ROLE_USER" && (
          <>
            <Divider />
            <MenuItem onClick={handleMenuClose} component={Link} to="/dashboard">
              Dashboard
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleMenuClose} component={Link} to="/myBatchs">
              Enrolled Courses
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleMenuClose} component={Link} to="/myPOs">
              Purchase Orders
            </MenuItem>
          </>
        )}

        {auth?.user?.role === "ROLE_ADMIN" && (
          <>
            <Divider />
            {(fullAdmin || auth?.user?.adminAction === "CREATE" || auth?.user?.adminAction === "FULL") && (
              <>
                {canAdminCreate("SUBJECT", auth?.user) && (
                <MenuItem onClick={handleMenuClose} component={Link} to="/addSubject">
                  Add New Subject
                </MenuItem>
                )}
                {canAdminCreate("COURSE", auth?.user) && (
                <MenuItem onClick={handleMenuClose} component={Link} to="/createCourse">
                  Create New Course
                </MenuItem>
                )}
                {canAdminCreate("BATCH", auth?.user) && (
                <MenuItem onClick={handleMenuClose} component={Link} to="/createBatch">
                  Create New Batch
                </MenuItem>
                )}
                {canAdminCreate("LECTURER", auth?.user) && (
                <MenuItem onClick={handleMenuClose} component={Link} to="/createLecturer">
                  Create Lecturer
                </MenuItem>
                )}
              </>
            )}
            {(fullAdmin || canAdminRead("SUBJECT", auth?.user) || canAdminRead("COURSE", auth?.user) || canAdminRead("BATCH", auth?.user)) && (
              <MenuItem onClick={handleMenuClose} component={Link} to="/adminCatalog">
                Subjects, Courses & Batches
              </MenuItem>
            )}
            {fullAdmin && (
              <MenuItem onClick={handleMenuClose} component={Link} to="/assign">
                Assign Lecturers To Batch
              </MenuItem>
            )}
            {canViewPeople && (
              <>
                <MenuItem onClick={handleMenuClose} component={Link} to="/allLecturers">
                  Lecturers
                </MenuItem>
                <MenuItem onClick={handleMenuClose} component={Link} to="/allStudents">
                  Students
                </MenuItem>
                <MenuItem onClick={handleMenuClose} component={Link} to="/allUsers">
                  Users
                </MenuItem>
              </>
            )}
            {canViewDeleteRequests && (
              <MenuItem onClick={handleMenuClose} component={Link} to="/deleteRequests">
                Delete Requests
              </MenuItem>
            )}
            {rootAdmin && (
              <>
                <MenuItem onClick={handleMenuClose} component={Link} to="/subAdmins">
                  Sub Admins
                </MenuItem>
                <MenuItem onClick={handleMenuClose} component={Link} to="/adminLogs">
                  Admin Logs
                </MenuItem>
              </>
            )}
          </>
        )}

        {auth?.user?.role === "ROLE_LECTURER" && (
          <>
            <Divider />
            <MenuItem onClick={handleMenuClose} component={Link} to="/lecturerClasses">
              My Classes
            </MenuItem>
            <MenuItem onClick={handleMenuClose} component={Link} to="/lecturerBatchs">
              Assigned Batchs
            </MenuItem>
          </>
        )}
      </Menu>

      <Dialog
        open={openProfile}
        onClose={handleProfileClose}
        PaperProps={{
          sx: {
            borderRadius: "24px",
            width: { xs: "calc(100vw - 28px)", sm: 440 },
            maxWidth: 440,
            overflow: "hidden",
            border: "1px solid rgba(79,70,229,0.14)",
            background: "rgba(255,255,255,0.98)",
            boxShadow: "0 26px 80px rgba(15,23,42,0.22)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            px: { xs: 2, sm: 2.5 },
            py: 2,
            color: "white",
            background: "linear-gradient(135deg, #4338ca, #06b6d4)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.35, minWidth: 0 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                border: "1px solid rgba(255,255,255,0.42)",
                backgroundColor: "rgba(255,255,255,0.18)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.24)",
                fontWeight: 900,
                fontSize: "1.35rem",
              }}
            >
              {userInitial}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                component="div"
                sx={{
                  fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  lineHeight: 1.15,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {auth?.user?.name || "User Details"}
              </Typography>
              <Box
                sx={{
                  mt: 0.55,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1,
                  py: 0.35,
                  borderRadius: "999px",
                  backgroundColor: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  textTransform: "capitalize",
                }}
              >
                <BadgeOutlinedIcon sx={{ fontSize: 15 }} />
                {userRole}
              </Box>
            </Box>
          </Box>
          <IconButton
            onClick={handleProfileClose}
            aria-label="Close user details"
            sx={{
              color: "white",
              border: "1px solid rgba(255,255,255,0.22)",
              backgroundColor: "rgba(255,255,255,0.12)",
              flexShrink: 0,
              "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            display: "grid",
            gap: 1.25,
            px: { xs: 2, sm: 2.5 },
            py: 2.4,
            background:
              "linear-gradient(180deg, rgba(248,250,255,0.96), rgba(255,255,255,0.98))",
          }}
        >
          {profileDetails.map((detail) => (
            <Box
              key={detail.label}
              sx={{
                display: "grid",
                gridTemplateColumns: "40px 1fr",
                alignItems: "center",
                gap: 1.25,
                p: 1.35,
                borderRadius: "16px",
                border: "1px solid rgba(79,70,229,0.1)",
                backgroundColor: "rgba(255,255,255,0.86)",
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "12px",
                  display: "grid",
                  placeItems: "center",
                  color: "#4338ca",
                  backgroundColor: "rgba(79,70,229,0.1)",
                }}
              >
                {detail.icon}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  component="div"
                  sx={{
                    color: "#64748b",
                    fontSize: "0.76rem",
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {detail.label}
                </Typography>
                <Typography
                  component="div"
                  sx={{
                    mt: 0.25,
                    color: "#111827",
                    fontWeight: 700,
                    lineHeight: 1.4,
                    overflowWrap: "anywhere",
                  }}
                >
                  {detail.value}
                </Typography>
              </Box>
            </Box>
          ))}
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 2,
            justifyContent: "space-between",
            gap: 1.25,
            borderTop: "1px solid rgba(79,70,229,0.1)",
            backgroundColor: "#fff",
          }}
        >
          <Button
            onClick={handleProfileClose}
            sx={{
              borderRadius: "12px",
              px: 2,
              py: 1,
              textTransform: "none",
              fontWeight: 800,
              color: "#4338ca",
              border: "1px solid rgba(79,70,229,0.16)",
              "&:hover": { backgroundColor: "rgba(79,70,229,0.06)" },
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              borderRadius: "12px",
              px: 2.4,
              py: 1,
              textTransform: "none",
              fontWeight: 900,
              background: "linear-gradient(135deg, #dc2626, #ef4444)",
              boxShadow: "0 12px 28px rgba(239,68,68,0.24)",
              "&:hover": {
                background: "linear-gradient(135deg, #b91c1c, #dc2626)",
                boxShadow: "0 16px 34px rgba(239,68,68,0.28)",
              },
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NavBar;
