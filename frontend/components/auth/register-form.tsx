"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, Github } from "lucide-react";
import { GoogleIcon } from "@/components/auth/icons/google-icon";

export function RegisterForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (formData.password.length < 8) {
      toast({
        title: "Weak password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDebugInfo("Starting registration process...");

    // // Validate form before sending request
    // setDebugInfo((prev) => `${prev}\nValidating form data...`)
    // setDebugInfo((prev) => `${prev}\nUsername: ${formData.username}`)
    // setDebugInfo((prev) => `${prev}\nEmail: ${formData.email}`)
    // setDebugInfo((prev) => `${prev}\nPassword length: ${formData.password.length}`)

    // Check if form is valid
    // setDebugInfo((prev) => `${prev}\nChecking form validity...`)

    // If validation fails, show error and return
    setDebugInfo((prev) => `${prev}\nForm validation complete.`);
    console.log("Form data:", formData);
    console.log("Debug info:", debugInfo);

    // // Validate form data
    // setDebugInfo((prev) => `${prev}\nValidating form...`)
    // console.log("Validating form data...");

    // // If validation fails, show error and return
    // setDebugInfo((prev) => `${prev}\nForm validation complete.`)
    // console.log("Form validation complete.");

    // // If validation fails, show error and return
    // setDebugInfo((prev) => `${prev}\nForm validation passed.`)
    // console.log("Form validation passed.");

    if (!validateForm()) return;

    setIsLoading(true);
    setDebugInfo("Validation passed, sending registration request...");

    try {
      const requestBody = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      setDebugInfo(
        (prev) =>
          `${prev}\nSending request to: http://localhost:8080/auth/register\nPayload: ${JSON.stringify(
            requestBody
          )}`
      );

      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
        mode: "cors",
        credentials: "include",
      });
      console.log("Response status:", response.status);

      setDebugInfo(
        (prev) => `${prev}\nResponse received: Status ${response.status}`
      );

      const responseText = await response.text();
      setDebugInfo((prev) => `${prev}\nResponse body: ${responseText}`);

      if (response.ok) {
        setDebugInfo((prev) => `${prev}\nRegistration successful!`);
        // toast({
        //   title: "Account created!",
        //   description: "Please check your email for verification code.",
        // })

        // Store email for verification page
        // sessionStorage.setItem("pendingVerificationEmail", formData.email)

        // Redirect to verification page
        // router.push("/verify")

        // Assuming responseText contains a token
        const json = JSON.parse(responseText);

        if (json.token && json.email) {
          // Store token and email in localStorage or context as a simple login mechanism
          localStorage.setItem("token", json.token);
          localStorage.setItem("email", json.email);
          toast({
            title: "Welcome!",
            description:
              "Your account has been created and you're now logged in.",
          });
          router.push("/files");
        } else {
          throw new Error("Token missing in response.");
        }
      } else {
        const errorMsg = responseText || `Server error: ${response.status}`;
        setDebugInfo((prev) => `${prev}\nRegistration failed: ${errorMsg}`);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      setDebugInfo((prev) => `${prev}\nCaught error: ${error.message}`);
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: "google" | "github") => {
    // Redirect to OAuth endpoint
    // window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`
    window.location.href = `http://localhost:8080/oauth2/code/${provider}`;

    //http://localhost:8080/login/oauth2/code/github
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            placeholder="johndoe"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
          // onClick={() => alert('Button clicked!')}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create account
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={() => handleOAuthLogin("google")}
          disabled={isLoading}
        >
          <GoogleIcon className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button
          variant="outline"
          onClick={() => handleOAuthLogin("github")}
          disabled={isLoading}
        >
          <Github className="mr-2 h-4 w-4" />
          GitHub
        </Button>
      </div>

      {debugInfo && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-xs font-mono whitespace-pre-wrap overflow-auto max-h-40">
          <p className="font-semibold mb-1">Debug Information:</p>
          {debugInfo}
        </div>
      )}

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
