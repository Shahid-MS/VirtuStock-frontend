import { useEffect, useState } from "react";

import { ChevronLeftIcon } from "../../icons";
import { otpSchema, signUpSchema, SignUpSchemaType } from "./AuthSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import apiClient from "@/API/ApiClient";
import { AxiosError } from "axios";
import { Link, useNavigate } from "react-router";
import Button from "../ui/button/Button";
import { toast } from "sonner";
import {
  CheckIcon,
  Collapse,
  EMAIL_REGEX,
  FormAlert,
  OTP_LENGTH,
  OtpInput,
  PasswordField,
  PasswordStrength,
  Spinner,
  Stepper,
  TextField,
  type StepState,
} from "./AuthFields";

/* ---------- form ---------- */

export default function SignUpForm() {
  const [loader, setLoader] = useState({
    generateOtp: false,
    verifyOtp: false,
    signup: false,
  });
  const [countdown, setCountdown] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState<{
    verified: boolean;
    token: string | null;
  }>({
    verified: false,
    token: null,
  });
  const [otpGenerated, setOtpGenerated] = useState(false);

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
  });

  const {
    watch: watchOtp,
    register: registerOtp,
    setValue: setValueOtp,
    trigger: triggerOtp,
    formState: { errors: otpErrors },
  } = useForm<{ otp: string }>({
    resolver: zodResolver(otpSchema),
  });

  // The code box is driven through setValue, so register the field once.
  useEffect(() => {
    registerOtp("otp");
  }, [registerOtp]);

  const verified = isEmailVerified.verified;
  const firstName = watch("firstName") ?? "";
  const email = watch("email") ?? "";
  const password = watch("password") ?? "";
  const otpValue = watchOtp("otp") ?? "";
  const emailLooksValid = EMAIL_REGEX.test(email.trim());

  useEffect(() => {
    if (countdown === 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Editing any field clears the server error. Editing the email after a code
  // was sent means that code no longer matches, so start that step again.
  useEffect(() => {
    const subscription = watch((_values, { name }) => {
      setServerError(null);
      if (name === "email") {
        setOtpGenerated(false);
        setCountdown(0);
        setValueOtp("otp", "");
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValueOtp]);

  const handleSignUp = async (data: SignUpSchemaType) => {
    try {
      setLoader((prev) => ({ ...prev, signup: true }));
      setServerError(null);
      const res = await apiClient.post("/auth/register", data, {
        headers: {
          "x-otp-verify-token": isEmailVerified.token,
        },
      });
      toast.success(res.data.message);
      navigate("/signin");
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as AxiosError<any>;
      if (error?.response?.data?.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError("Something went wrong");
      }
    } finally {
      setLoader((prev) => ({ ...prev, signup: false }));
    }
  };

  const handleGenerateOtp = async () => {
    try {
      setLoader((prev) => ({ ...prev, generateOtp: true }));
      const valid = await trigger("email");
      if (!valid) return;
      const email = watch("email");
      const res = await apiClient.post("/auth/register/send-otp", {
        email,
      });
      toast.success(res.data.message);
      setValueOtp("otp", "");
      setOtpGenerated(true);
      setCountdown(30);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as AxiosError<any>;
      toast.error(error?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoader((prev) => ({ ...prev, generateOtp: false }));
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoader((prev) => ({ ...prev, verifyOtp: true }));
      const email = watch("email");
      const otp = watchOtp("otp");

      const valid = (await trigger("email")) && (await triggerOtp("otp"));

      if (!valid) return;

      const res = await apiClient.post("/auth/register/verify-otp", {
        email,
        otp,
      });
      toast.success(res.data.message);
      setIsEmailVerified({
        verified: true,
        token: res.data.otpToken,
      });
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as AxiosError<any>;
      toast.error(error?.response?.data?.message || "Failed to verify OTP");
    } finally {
      setLoader((prev) => ({ ...prev, verifyOtp: false }));
    }
  };

  // Verifies on its own as soon as the sixth digit is in.
  useEffect(() => {
    if (
      otpValue.length === OTP_LENGTH &&
      otpGenerated &&
      !verified &&
      !loader.verifyOtp
    ) {
      handleVerifyOtp();
    }
    // Only react to the code changing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpValue]);

  // Unlock the email again (the old verification no longer applies).
  const handleChangeEmail = () => {
    setIsEmailVerified({ verified: false, token: null });
    setOtpGenerated(false);
    setCountdown(0);
    setValueOtp("otp", "");
  };

  const detailsDone = firstName.trim().length >= 2 && emailLooksValid;
  const steps: { label: string; state: StepState }[] = [
    {
      label: "Your details",
      state: detailsDone || verified ? "done" : "current",
    },
    {
      label: "Verify email",
      state: verified ? "done" : detailsDone ? "current" : "upcoming",
    },
    {
      label: "Password",
      state:
        verified && password.length >= 6
          ? "done"
          : verified
          ? "current"
          : "upcoming",
    },
  ];

  return (
    <div className="no-scrollbar flex w-full flex-1 flex-col overflow-y-auto lg:w-1/2">
      <div className="mx-auto mb-5 w-full max-w-md pt-6 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center rounded text-sm text-gray-500 transition-colors hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center pb-8">
        <div>
          <div className="mb-5 sm:mb-6">
            {/* The brand panel is hidden on small screens, so show the mark here */}
            <img
              src="/images/logo/logo-icon.png"
              alt=""
              width={36}
              height={36}
              className="mb-4 lg:hidden"
            />
            <h1 className="mb-2 text-title-sm font-semibold text-gray-800 dark:text-white/90 sm:text-title-md">
              Create your account
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Three quick steps and you're in.
            </p>
          </div>

          <Stepper steps={steps} label="Sign up progress" />

          <form onSubmit={handleSubmit(handleSignUp)} noValidate>
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <TextField
                  label="First Name"
                  required
                  type="text"
                  id="firstName"
                  autoComplete="given-name"
                  placeholder="Enter your first name"
                  {...register("firstName")}
                  error={errors.firstName?.message}
                />
                <TextField
                  label="Last Name"
                  type="text"
                  id="lastName"
                  autoComplete="family-name"
                  placeholder="Enter your last name"
                  {...register("lastName")}
                  error={errors.lastName?.message}
                />
              </div>

              {/* Email: locked once it has been verified */}
              <TextField
                label="Email"
                required
                type="email"
                id="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                readOnly={verified}
                {...register("email")}
                error={errors.email?.message}
                success={verified || (emailLooksValid && !errors.email)}
              />

              {/* Step: ask for the code */}
              {!verified && !otpGenerated && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={handleGenerateOtp}
                  disabled={loader.generateOtp || !emailLooksValid}
                >
                  {loader.generateOtp ? (
                    <>
                      <Spinner dark />
                      Sending...
                    </>
                  ) : (
                    "Send verification code"
                  )}
                </Button>
              )}

              {/* Step: enter the code */}
              <Collapse open={otpGenerated && !verified}>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enter the 6-digit code we sent to{" "}
                    <span className="break-all font-medium text-gray-800 dark:text-white/90">
                      {email}
                    </span>
                  </p>

                  <OtpInput
                    value={otpValue}
                    onChange={(next) =>
                      setValueOtp("otp", next, {
                        shouldValidate: next.length === OTP_LENGTH,
                      })
                    }
                    active={otpGenerated && !verified}
                    disabled={loader.verifyOtp}
                    error={!!otpErrors.otp}
                  />

                  {otpErrors.otp && (
                    <p role="alert" className="text-xs text-error-500">
                      {otpErrors.otp.message}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleVerifyOtp}
                      disabled={
                        loader.verifyOtp || otpValue.length !== OTP_LENGTH
                      }
                    >
                      {loader.verifyOtp ? (
                        <>
                          <Spinner dark />
                          Verifying...
                        </>
                      ) : (
                        "Verify code"
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={handleGenerateOtp}
                      disabled={loader.generateOtp || countdown > 0}
                      className="rounded text-sm text-brand-500 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:text-gray-400 dark:text-brand-400 dark:disabled:text-gray-500"
                    >
                      {loader.generateOtp
                        ? "Sending..."
                        : countdown > 0
                        ? `Resend in ${countdown}s`
                        : "Resend code"}
                    </button>
                  </div>
                </div>
              </Collapse>

              {/* Step done */}
              <Collapse open={verified}>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-success-50 px-3.5 py-2.5 text-sm text-success-700 dark:bg-success-500/10 dark:text-success-400">
                  <span className="flex items-center gap-2">
                    <CheckIcon />
                    Email verified
                  </span>
                  <button
                    type="button"
                    onClick={handleChangeEmail}
                    className="rounded font-medium underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-success-500"
                  >
                    Change
                  </button>
                </div>
              </Collapse>

              {/* Step: password (opens once the email is verified) */}
              <Collapse open={verified}>
                <div>
                  <PasswordField
                    label="Password"
                    required
                    autoComplete="new-password"
                    placeholder="Create a password"
                    {...register("password")}
                    error={errors.password?.message}
                  />
                  <PasswordStrength password={password} />
                </div>
              </Collapse>

              {serverError && <FormAlert>{serverError}</FormAlert>}

              <div>
                <Button
                  type="submit"
                  className="w-full active:scale-[0.99]"
                  size="sm"
                  disabled={!verified || loader.signup}
                >
                  {loader.signup ? (
                    <>
                      <Spinner />
                      Creating Account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
                {!verified && (
                  <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                    Verify your email to set a password and finish.
                  </p>
                )}
              </div>
            </div>
          </form>

          <div className="mt-6">
            <p className="text-center text-sm font-normal text-gray-700 dark:text-gray-400 sm:text-start">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="rounded font-medium text-brand-500 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-brand-400"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}