import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeftIcon } from "../../icons";

import Button from "../ui/button/Button";

import apiClient from "@/API/ApiClient";
import { AxiosError } from "axios";
import {
  otpSchema,
  resetPasswordSchema,
  ResetPasswordSchemaType,
} from "./AuthSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

export default function ResetPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [otpGenerated, setOtpGenerated] = useState(false);
  const [loader, setLoader] = useState({
    generateOtp: false,
    verifyOtp: false,
    reset: false,
  });
  const [isEmailVerified, setIsEmailVerified] = useState<{
    verified: boolean;
    token: string | null;
  }>({
    verified: false,
    token: null,
  });

  const navigate = useNavigate();
  const {
    register,
    trigger,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
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
  const email = watch("email") ?? "";
  const password = watch("password") ?? "";
  const confirmPassword = watch("confirmPassword") ?? "";
  const otpValue = watchOtp("otp") ?? "";
  const emailLooksValid = EMAIL_REGEX.test(email.trim());
  const passwordsMatch = confirmPassword !== "" && confirmPassword === password;

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

  const handleGenerateOtp = async () => {
    try {
      setLoader((prev) => ({ ...prev, generateOtp: true }));
      const email = watch("email");
      const valid = await trigger("email");
      if (!valid) return;
      const res = await apiClient.post("/auth/forgot-password", { email });
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

      const res = await apiClient.post("/auth/verify-forgot-otp", {
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

  const handleReset = async (data: ResetPasswordSchemaType) => {
    try {
      setLoader((prev) => ({ ...prev, reset: true }));
      setServerError(null);
      const res = await apiClient.post(
        "/auth/reset-password",
        {
          email: data.email,
          password: data.password,
        },
        {
          headers: {
            "x-otp-verify-token": isEmailVerified.token,
          },
        }
      );
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
      setLoader((prev) => ({ ...prev, reset: false }));
    }
  };

  const steps: { label: string; state: StepState }[] = [
    {
      label: "Your email",
      state: emailLooksValid || verified ? "done" : "current",
    },
    {
      label: "Verify code",
      state: verified ? "done" : emailLooksValid ? "current" : "upcoming",
    },
    {
      label: "New password",
      state:
        verified && password.length >= 6 && passwordsMatch
          ? "done"
          : verified
          ? "current"
          : "upcoming",
    },
  ];

  return (
    <div className="no-scrollbar flex w-full flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-md pt-6 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center rounded text-sm text-gray-500 transition-colors hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to VirtuStock
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
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
              Reset your password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Verify your email, then choose a new password.
            </p>
          </div>

          <Stepper steps={steps} label="Reset password progress" />

          <form onSubmit={handleSubmit(handleReset)} noValidate>
            <div className="space-y-5">
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
                  type="button"
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
                    "Send reset code"
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
                      type="button"
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

              {/* Step: new password (opens once the email is verified) */}
              <Collapse open={verified}>
                <div className="space-y-5">
                  <div>
                    <PasswordField
                      label="New password"
                      required
                      autoComplete="new-password"
                      placeholder="Create a new password"
                      {...register("password")}
                      error={errors.password?.message}
                    />
                    <PasswordStrength password={password} />
                  </div>

                  <div>
                    <PasswordField
                      label="Confirm password"
                      required
                      autoComplete="new-password"
                      placeholder="Re-enter your new password"
                      {...register("confirmPassword")}
                      error={errors.confirmPassword?.message}
                      success={passwordsMatch}
                    />
                    {confirmPassword !== "" && !errors.confirmPassword && (
                      <p
                        aria-live="polite"
                        className={`mt-1.5 flex items-center gap-1 text-xs ${
                          passwordsMatch
                            ? "text-success-600 dark:text-success-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {passwordsMatch && <CheckIcon className="h-3 w-3" />}
                        {passwordsMatch
                          ? "Passwords match"
                          : "Passwords don't match yet"}
                      </p>
                    )}
                  </div>
                </div>
              </Collapse>

              {serverError && <FormAlert>{serverError}</FormAlert>}

              <div>
                <Button
                  type="submit"
                  className="w-full active:scale-[0.99]"
                  size="sm"
                  disabled={!verified || loader.reset}
                >
                  {loader.reset ? (
                    <>
                      <Spinner />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset password"
                  )}
                </Button>
                {!verified && (
                  <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                    Verify your email to set a new password.
                  </p>
                )}
              </div>
            </div>
          </form>

          <div className="mt-6 space-y-1.5">
            <p className="text-center text-sm font-normal text-gray-700 dark:text-gray-400 sm:text-start">
              Remembered it?{" "}
              <Link
                to="/signin"
                className="rounded font-medium text-brand-500 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-brand-400"
              >
                Sign In
              </Link>
            </p>
            <p className="text-center text-sm font-normal text-gray-700 dark:text-gray-400 sm:text-start">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="rounded font-medium text-brand-500 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-brand-400"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}