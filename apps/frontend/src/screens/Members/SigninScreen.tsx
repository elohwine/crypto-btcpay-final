import { useState } from "react";

import { Link, useNavigate, useSearchParams } from "react-router-dom";

// hooks
import useFormEvents from "../../hooks/useFormEvents";
import { useAuth } from "../../lib/auth";

// components
import Box from "../../components/Common/Box";
import MainLayout from "../../layouts/MainLayout";
import FormInput from "../../components/Forms/FormInput";
import FormButton from "../../components/Forms/FormButton";

// interfaces
interface IFormProps {
  email: string;
  password: string;
}

const SigninScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  useFormEvents();
  const { signin } = useAuth();
  const [formValues, setFormValues] = useState<IFormProps>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // auth
  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signin(email, password);
      navigate(searchParams.get("redirect") || "/dashboard");
    } catch (error) {
      // Error is handled in auth.tsx with notify
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles input changes in the sign-in form.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   * @returns {void}
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  /**
   * Handles the form submission for the sign-in screen.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   * @returns {void}
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    handleLogin(formValues.email, formValues.password);
  };

  return (
    <MainLayout>
      <div className="flex flex-center full-height">
        <div className="login no-select">
          <Box>
            <div className="box-vertical-padding box-horizontal-padding">
              <div>
                <div className="form-logo center">
                  <img
                    draggable="false"
                    alt="Magnum"
                    src={`${process.env.PUBLIC_URL}/images/logo.png`}
                  />
                </div>
                <h1 className="form-title center">Sign in</h1>
                <p className="form-desc center">
                  Please make sure that <strong>https://pro.magnum.com</strong>{" "}
                  is written in your browser's address bar.
                </p>
                <form noValidate className="form" onSubmit={handleSubmit}>
                  <div className="form-elements">
                    <div className="form-line">
                      <div className="full-width">
                        <label htmlFor="email">Email</label>
                        <FormInput
                          type="email"
                          name="email"
                          onChange={handleChange}
                          value={(formValues as any).email}
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                    <div className="form-line">
                      <div className="full-width">
                        <label htmlFor="password">Password</label>
                        <FormInput
                          type="password"
                          name="password"
                          onChange={handleChange}
                          value={formValues.password}
                          placeholder="Enter your password"
                        />
                      </div>
                    </div>
                    <div className="form-line">
                      <div className="full-width right">
                        <Link to="/members/forgot-password">
                          Forgot password
                        </Link>
                      </div>
                    </div>
                    <div className="form-line">
                      <div className="buttons">
                        <FormButton text="Sign in" disabled={isLoading} />
                      </div>
                    </div>
                    <div className="form-line">
                      <div className="center">
                        <p>
                          If you don't have an account, create a{" "}
                          <Link to="/members/signup">new account</Link>.
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </Box>
        </div>
      </div>
    </MainLayout>
  );
};

export default SigninScreen;
