import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../utils/constants";
import { useDialog } from "../../contexts/DialogContext";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const schema = yup.object().shape({
  Email: yup.string().required("Email is required"),
  Password: yup.string().required("Password is required"),
});

function Login() {
  const { login } = useAuth();
  const { showDialog } = useDialog();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(API_ENDPOINTS.LOGIN, data);
      login(response.data.data.token); // Save token to context
      toast.success("Login successful!");
      navigate("/profile"); // Redirect to profile
    } catch (error) {
      toast.error(error.response?.data?.Message || "Login failed.");
      showDialog({
        type: "alert",
        message: error.response?.data?.Message || "Login failed.",
      });
    }
  };

  const handleGoogleSuccess = async (response) => {
    const idToken = response.credential; // This is the idToken you need

    try {
      // Send the Google idToken to your API for login
      const result = await axios.post(API_ENDPOINTS.GOOGLE_LOGIN, { idToken });

      // On success, save the JWT token in your context or localStorage
      login(result.data.data.token);
      toast.success("Login successful!");
      navigate("/profile"); // Redirect to profile
    } catch (error) {
      toast.error(error.response?.data?.Message || "Google login failed.");
      showDialog({
        type: "alert",
        message: error.response?.data?.Message || "Google login failed.",
      });
    }
  };
  const handleGoogleFailure = (error) => {
    console.error(error);
    toast.error("Google login failed.");
  };

  return (
    <div className="container my-5 d-flex justify-content-center">
      <div
        className="p-4 bg-white shadow rounded-4 w-100"
        style={{ maxWidth: "420px" }}
      >
        <h2 className="text-center mb-4">Login</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label fw-medium">Email</label>
            <input
              className="form-control"
              {...register("Email")}
              placeholder="Enter your email"
            />
            {errors.Email && (
              <div className="text-danger small mt-1">
                {errors.Email.message}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Password</label>
            <input
              type="password"
              className="form-control"
              {...register("Password")}
              placeholder="Enter your password"
            />
            {errors.Password && (
              <div className="text-danger small mt-1">
                {errors.Password.message}
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-2">
            Login
          </button>
        </form>

        <p className="mt-4 text-center">
          Not a user?{" "}
          <Link
            to="/register"
            className="text-decoration-none fw-bold text-primary"
          >
            Register
          </Link>
        </p>

        <div className="border-top my-4"></div>

        <div className="d-flex justify-content-center">
          <GoogleOAuthProvider clientId="959373315541-v1j386lqe8q0cmcpuhnp61m1k6cgopue.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
            />
          </GoogleOAuthProvider>
        </div>
      </div>
    </div>
  );
}

export default Login;
