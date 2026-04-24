import type { ReactNode } from "react";
import { Box, Typography, AppBar, Toolbar, Button } from "@mui/material";
import {
  Logout as LogoutIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  Login as LoginIcon,
  List as ListIcon,
} from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "src/firebase/auth";
import { useAuth } from "src/firebase/useAuth";

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function Layout({ children, title, subtitle }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminPage = location.pathname === "/admin";

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      <AppBar position="sticky" elevation={1}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Link
              to="/"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#fff",
              }}
            >
              <HomeIcon />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                IMS Community
              </Typography>
            </Link>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            {user ? (
              <>
                {!isAdminPage && (
                  <Link to="/admin" style={{ textDecoration: "none" }}>
                    <Button
                      color="inherit"
                      startIcon={<SettingsIcon />}
                      sx={{
                        "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                      }}
                    >
                      Manage
                    </Button>
                  </Link>
                )}
                {isAdminPage && (
                  <Link to="/" style={{ textDecoration: "none" }}>
                    <Button
                      color="inherit"
                      startIcon={<ListIcon />}
                      sx={{
                        "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                      }}
                    >
                      All Events
                    </Button>
                  </Link>
                )}
                <Button
                  color="inherit"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login" style={{ textDecoration: "none" }}>
                <Button
                  color="inherit"
                  startIcon={<LoginIcon />}
                  sx={{
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  Login
                </Button>
              </Link>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <Box sx={{ flex: 1 }}>
          <Box sx={{ py: 3, textAlign: "center", bgcolor: "#f5f7fa" }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="body1" sx={{ color: "#666" }}>
              {subtitle}
            </Typography>
          </Box>
          <Box>{children}</Box>
        </Box>

        <Box
          sx={{
            py: 3,
            textAlign: "center",
            borderTop: "1px solid #ddd",
            bgcolor: "#fafbfc",
          }}
        >
          <Typography variant="body2" sx={{ color: "#999" }}>
            © 2024 IMS Community. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </>
  );
}
