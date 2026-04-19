import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { signIn } from "src/firebase/auth";

interface LoginProps {
  onLoginSuccess?: () => void;
}

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function LoginView({ onLoginSuccess }: LoginProps) {
  const navigate = useNavigate();

  return (
    <Container
      maxWidth="sm"
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 6 }}
    >
      <Card sx={{ width: "100%", p: 4, boxShadow: 3 }}>
        <Typography
          variant="h4"
          sx={{ mb: 3, fontWeight: 700, textAlign: "center" }}
        >
          🔐 Admin Login
        </Typography>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setStatus }) => {
            try {
              await signIn(values.email, values.password);
              onLoginSuccess?.();
              navigate("/admin");
            } catch (err) {
              const message =
                err instanceof Error ? err.message : "Login failed";
              setStatus(message);
            }
          }}
        >
          {(formik) => (
            <>
              {formik.status && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {formik.status}
                </Alert>
              )}

              <Form>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    label="Email"
                    type="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={formik.isSubmitting}
                    required
                    fullWidth
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />

                  <TextField
                    label="Password"
                    type="password"
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={formik.isSubmitting}
                    required
                    fullWidth
                    error={
                      formik.touched.password && Boolean(formik.errors.password)
                    }
                    helperText={
                      formik.touched.password && formik.errors.password
                    }
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={formik.isSubmitting}
                    sx={{ mt: 2 }}
                  >
                    {formik.isSubmitting ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Login"
                    )}
                  </Button>
                </Box>
              </Form>
            </>
          )}
        </Formik>

        <Typography
          variant="body2"
          sx={{ mt: 3, textAlign: "center", color: "#666" }}
        >
          💡 Use your Firebase account credentials
        </Typography>
      </Card>
    </Container>
  );
}
