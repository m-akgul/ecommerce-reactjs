import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../utils/constants";
import { useDialog } from "../../contexts/DialogContext";

const schema = yup.object().shape({
  email: yup.string().email().required("Email is required"),
  username: yup.string().min(3).required("Username is required"),
  password: yup.string().min(6).required("Password is required"),
});

function Register() {
  const { login } = useAuth();
  const { showDialog } = useDialog();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(API_ENDPOINTS.REGISTER, data);
      login(res.data.data.token);
      toast.success("Registration successful!");
      navigate("/profile");
    } catch (err) {
      toast.error(err.response?.data?.Message || "Registration failed.");
      showDialog({
        type: "alert",
        message: err.response?.data?.Message || "Registration failed.",
      });
    }
  };

  return (
    <div className="container my-5 d-flex justify-content-center">
      <div
        className="p-4 bg-white shadow rounded-4 w-100"
        style={{ maxWidth: "420px" }}
      >
        <h2 className="text-center mb-4">Create Account</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label fw-medium">Email</label>
            <input
              type="email"
              className="form-control"
              {...register("email")}
              placeholder="Enter your email"
            />
            {errors.email && (
              <div className="text-danger small mt-1">
                {errors.email.message}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Username</label>
            <input
              className="form-control"
              {...register("username")}
              placeholder="Choose a username"
            />
            {errors.username && (
              <div className="text-danger small mt-1">
                {errors.username.message}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Password</label>
            <input
              type="password"
              className="form-control"
              {...register("password")}
              placeholder="Create a password"
            />
            {errors.password && (
              <div className="text-danger small mt-1">
                {errors.password.message}
              </div>
            )}
          </div>

          <button className="btn btn-primary w-100 mt-2" type="submit">
            Register
          </button>
        </form>

        <p className="mt-4 text-center">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-decoration-none fw-bold text-primary"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;
