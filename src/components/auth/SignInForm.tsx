import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeftIcon } from "../../icons";

import Button from "../ui/button/Button";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/Store";
import apiClient from "@/API/ApiClient";
import { login } from "@/Store/authSlice";
import { AxiosError } from "axios";
import { signInSchema, signInSchemaType } from "./AuthSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  EMAIL_REGEX,
  FormAlert,
  PasswordField,
  Spinner,
  TextField,
} from "./AuthFields";

export default function SignInForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const [loader, setLoader] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<signInSchemaType>({
    resolver: zodResolver(signInSchema),
    // Validate when a field is left, then keep re-checking as the user types.
    mode: "onTouched",
  });

  const email = watch("email") ?? "";
  const emailLooksValid = EMAIL_REGEX.test(email.trim());

  // A server error (e.g. "wrong password") goes away as soon as the user edits.
  useEffect(() => {
    const subscription = watch(() => setServerError(null));
    return () => subscription.unsubscribe();
  }, [watch]);

  const handleLogin = async (data: signInSchemaType) => {
    try {
      setLoader(true);
      setServerError(null);
      const res = await apiClient.post("/auth/login", {
        email: data.email,
        password: data.password,
      });
      const token = res.data["virtustock-token"];
      if (token) {
        dispatch(login({ token: token }));
        navigate("/");
      }
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as AxiosError<any>;
      if (error?.response?.data?.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError("Something went wrong");
      }
    } finally {
      setLoader(false);
    }
  };

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
          <div className="mb-6 sm:mb-8">
            {/* The brand panel is hidden on small screens, so show the mark here */}
            <img
              src="/images/logo/logo-icon.png"
              alt=""
              width={36}
              height={36}
              className="mb-4 lg:hidden"
            />
            <h1 className="mb-2 text-title-sm font-semibold text-gray-800 dark:text-white/90 sm:text-title-md">
              Welcome back
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sign in to pick up where you left off.
            </p>
          </div>

          <form onSubmit={handleSubmit(handleLogin)} noValidate>
            <div className="space-y-5">
              <TextField
                label="Email"
                required
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
                error={errors.email?.message}
                success={!errors.email && emailLooksValid}
              />

              <PasswordField
                label="Password"
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                {...register("password")}
                error={errors.password?.message}
              />

              {serverError && <FormAlert>{serverError}</FormAlert>}

              <div className="flex items-center justify-end">
                <Link
                  to="/reset-password"
                  className="rounded text-sm text-brand-500 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-brand-400"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full active:scale-[0.99]"
                size="sm"
                disabled={loader}
              >
                {loader ? (
                  <>
                    <Spinner />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6">
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