import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "../../axios";

const VerifyPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const verify = async () => {
      try {
        await instance.get(`/auth/verify/${token}`);
        setStatus("success");

        setTimeout(() => {
          navigate("/login");
        }, 2000);

      } catch (err) {
        setStatus("error");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      {status === "loading" && <p>Verifying your email...</p>}
      {status === "success" && (
        <p className="text-green-600 font-semibold">
          Email verified successfully! Redirecting to login...
        </p>
      )}
      {status === "error" && (
        <p className="text-red-600">
          Invalid or expired verification link.
        </p>
      )}
    </div>
  );
};

export default VerifyPage;