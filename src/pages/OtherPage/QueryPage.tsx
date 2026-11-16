/* eslint-disable @typescript-eslint/no-explicit-any */

import apiClient from "@/API/ApiClient";
import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EnvelopeIcon } from "@/icons";
import { RootState } from "@/Store";
import { useMutation } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export interface QueryPayload {
  message: string;
  email?: string;
}

const MAX_MESSAGE_LENGTH = 1000;

const QueryPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { token } = useSelector((state: RootState) => state.auth);

  let roles: string[] = [];

  if (token) {
    try {
      roles = jwtDecode<{ roles?: string[] }>(token).roles ?? [];
    } catch {
      roles = [];
    }
  }

  const isLoggedin = roles.includes("ROLE_USER");

  const submitQuery = async (payload: QueryPayload) => {
    const res = await apiClient.post("/feedback/query", payload);
    return res.data;
  };

  const { mutate: sendQuery, isPending } = useMutation({
    mutationFn: submitQuery,

    onSuccess: (data) => {
      setMessage("");
      setEmail("");
      setSubmitted(true);
      toast.success(data.message || "Your query has been submitted!");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to send your query"
      );
    },
  });

  const handleSubmit = () => {
    setSubmitted(false);

    if (!isLoggedin) {
      if (!email.trim()) {
        toast.error("Please enter your email address");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    if (!message.trim()) {
      toast.error("Please enter your message");
      return;
    }

    if (message.trim().length < 10) {
      toast.error("Please enter at least 10 characters");
      return;
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      toast.error(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`);
      return;
    }

    sendQuery({
      message: message.trim(),
      ...(!isLoggedin ? { email: email.trim() } : {}),
    });
  };

  return (
    <ComponentCard title="Contact Support">
      <div className="space-y-5">
        {/* Intro */}
        <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4 dark:bg-blue-950/30">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10h8M8 14h5m-1 7-4-4H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5l-4 4Z"
              />
            </svg>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              How can we help you?
            </h3>
            <p className="mt-1 text-sm leading-5 text-gray-600 dark:text-gray-400">
              Share a question, report an issue, or tell us how we can make
              VirtuStock better.
            </p>
          </div>
        </div>

        {/* Email field */}
        {!isLoggedin && (
          <div className="space-y-2">
            <Label>Email address</Label>

            <div className="relative">
              <Input
                value={email}
                placeholder="you@example.com"
                type="email"
                className="pl-[62px]"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSubmitted(false);
                }}
              />

              <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <EnvelopeIcon className="size-6" />
              </span>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              We will use this email to respond to your query.
            </p>
          </div>
        )}

        {isLoggedin && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <svg
              viewBox="0 0 20 20"
              className="h-5 w-5"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.86-9.65a.75.75 0 0 0-1.22-.88l-3.55 4.9-1.72-1.72a.75.75 0 0 0-1.06 1.06l2.35 2.35a.75.75 0 0 0 1.14-.09l4.06-5.62Z"
                clipRule="evenodd"
              />
            </svg>
            Your account is recognized.
          </div>
        )}

        {/* Message */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label>Your message</Label>

            <span
              className={`text-xs tabular-nums ${
                message.length > MAX_MESSAGE_LENGTH
                  ? "text-red-500"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {message.length}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>

          <TextArea
            value={message}
            onChange={(value) => {
              setMessage(value);
              setSubmitted(false);
            }}
            rows={5}
          />

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Minimum 10 characters. Please include enough detail to help us
            understand your request.
          </p>
        </div>

        {/* Submit */}
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={handleSubmit}
            disabled={isPending || !message.trim() || message.length > MAX_MESSAGE_LENGTH}
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-25"
                  />
                  <path
                    d="M4 12a8 8 0 0 1 8-8"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="opacity-75"
                  />
                </svg>
                Sending...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                Send Message
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M22 2 15 22l-4-9-9-4 20-7ZM22 2 11 13"
                  />
                </svg>
              </span>
            )}
          </Button>

          {submitted && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400"
            >
              <svg
                viewBox="0 0 20 20"
                className="h-5 w-5 shrink-0"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.86-9.65a.75.75 0 0 0-1.22-.88l-3.55 4.9-1.72-1.72a.75.75 0 0 0-1.06 1.06l2.35 2.35a.75.75 0 0 0 1.14-.09l4.06-5.62Z"
                  clipRule="evenodd"
                />
              </svg>
              Your query has been submitted successfully.
            </div>
          )}
        </div>
      </div>
    </ComponentCard>
  );
};

export default QueryPage;