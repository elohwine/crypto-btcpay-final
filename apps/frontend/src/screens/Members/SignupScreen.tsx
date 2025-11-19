import { useState, useEffect } from "react";

import { Link, useNavigate, useSearchParams } from "react-router-dom";

// hooks
import useFormEvents from "../../hooks/useFormEvents";
import { useAuth } from "../../lib/auth";

// components
import Box from "../../components/Common/Box";
import TopLayout from "../../layouts/TopLayout";
import FormInput from "../../components/Forms/FormInput";
import FormButton from "../../components/Forms/FormButton";
import FormCheckbox from "../../components/Forms/FormCheckbox";

// mantine
import { DateInput } from "@mantine/dates";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

// interfaces
interface IFormProps {
  email: string;
  phone: string;
  password: string;
  password1: string;
  name: string;
  lastname: string;
  citizenship: boolean;
  identityType: string;
  identityNumber: string;
  dateOfBirth: string;
  referralCode: string;
  agreeToPolicies1: boolean;
  agreeToPolicies2: boolean;
  agreeToPolicies3: boolean;
}

const SignupScreen: React.FC = () => {
  const { onlyEmail } = useFormEvents();
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [searchParams] = useSearchParams();

  const [formValues, setFormValues] = useState<IFormProps>({
    email: "",
    phone: "",
    password: "",
    password1: "",
    name: "",
    lastname: "",
    citizenship: false,
    identityType: "",
    identityNumber: "",
    dateOfBirth: "",
    referralCode: "",
    agreeToPolicies1: false,
    agreeToPolicies2: false,
    agreeToPolicies3: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Extract referral code from URL
  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      setFormValues((prev) => ({ ...prev, referralCode: refCode }));
    }
  }, [searchParams]);

  /**
   * Handles input changes in the sign-up form.
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
   * Handles checkbox changes in the sign-up form.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The checkbox change event.
   * @returns {void}
   */
  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, checked } = e.target;

    setFormValues({
      ...formValues,
      [name]: checked,
    });
  };

  /**
   * Handles the form submission for the sign-up screen.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   * @returns {void}
   */
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signup(
        formValues.email,
        formValues.password,
        formValues.name,
        formValues.dateOfBirth || undefined,
        formValues.phone
      );
      navigate("/dashboard");
    } catch (error) {
      // Error handled in auth.tsx
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TopLayout>
      <div className="flex flex-center">
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
                <h1 className="form-title center">Sign up</h1>
                <p className="form-desc center">
                  Please enter the information below. We will send your
                  activation details to your phone number.
                </p>
                <form noValidate className="form" onSubmit={handleSubmit}>
                  <div className="form-elements">
                    <div className="form-line">
                      <div className="full-width">
                        <label htmlFor="email">Email address</label>
                        <FormInput
                          type="email"
                          name="email"
                          onKeyDown={onlyEmail}
                          onChange={handleChange}
                          value={formValues.email}
                          placeholder="Enter your email address"
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
                      <div className="full-width">
                        <label htmlFor="password1">Password confirmation</label>
                        <FormInput
                          type="password"
                          name="password1"
                          onChange={handleChange}
                          value={formValues.password1}
                          placeholder="Re-enter your password"
                        />
                      </div>
                    </div>
                    <div className="form-line">
                      <div className="full-width">
                        <label htmlFor="name">Name</label>
                        <FormInput
                          type="text"
                          name="name"
                          onChange={handleChange}
                          value={formValues.name}
                          placeholder="Enter your name"
                        />
                      </div>
                    </div>
                    <div className="form-line">
                      <div className="full-width">
                        <label htmlFor="lastname">Last name</label>
                        <FormInput
                          type="text"
                          name="lastname"
                          onChange={handleChange}
                          value={formValues.lastname}
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>

                    <div className="form-line">
                      <div className="full-width">
                        <label htmlFor="dateOfBirth">Date of Birth</label>
                        <DateInput
                          value={
                            formValues.dateOfBirth
                              ? new Date(formValues.dateOfBirth)
                              : null
                          }
                          onChange={(date: any) =>
                            setFormValues({
                              ...formValues,
                              dateOfBirth: date
                                ? new Date(date).toISOString().split("T")[0]
                                : "",
                            })
                          }
                          placeholder="Select your date of birth"
                        />
                      </div>
                    </div>

                    <div className="form-line">
                      <div className="full-width">
                        <label htmlFor="phone">Phone Number</label>
                        <PhoneInput
                          value={formValues.phone}
                          onChange={(value) =>
                            setFormValues({ ...formValues, phone: value || "" })
                          }
                          placeholder="Enter your phone number"
                          international
                          defaultCountry="US"
                        />
                      </div>
                    </div>

                    <div className="form-line">
                      <div className="full-width">
                        <label htmlFor="referralCode">Referral Code (Optional)</label>
                        <FormInput
                          type="text"
                          name="referralCode"
                          onChange={handleChange}
                          value={formValues.referralCode}
                          placeholder="Enter referral code if you have one"
                        />
                      </div>
                    </div>

                    <div className="form-line">
                      <div className="full-width">
                        <FormCheckbox
                          name="agreeToPolicies1"
                          onChange={handleCheckboxChange}
                          checked={formValues.agreeToPolicies1}
                          text={`I have read the Privacy Policy and Terms of Use, and I accept the User Agreement.`}
                        />
                      </div>
                    </div>
                    <div className="form-line">
                      <div className="buttons">
                        <FormButton text="Sign up" disabled={isLoading} />
                      </div>
                    </div>
                    <div className="form-line">
                      <div className="center">
                        <p>
                          Do you have an account? <Link to="/">Sign in</Link>.
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
    </TopLayout>
  );
};

export default SignupScreen;
