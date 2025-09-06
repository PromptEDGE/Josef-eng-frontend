import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SignInFormType } from "@/utils/types";
import { Eye, EyeClosed, LoaderIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import ServicesCard from "@/components/ServiceCards";
import useSignin from "@/hooks/useSignin";
import { validateEmail, validatePassword } from "@/utils/Validations";


const initialForm:SignInFormType = {
  email: "",
  password: "",
};



export default function SignInPage() {
  const { handleSignin, isPending, data } = useSignin()
  const [form, setForm] = useState<SignInFormType>(initialForm);
  const [errors, setErrors] = useState<SignInFormType>({
    email: "",
    password: "",
  });
  const [password, setPassword] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }


  

 async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let valid = true;
    const newErrors = { ...errors };
    if (!validateEmail(form.email)) {
      newErrors.email = "Enter a valid email address.";
      valid = false;
    }
    if (!validatePassword(form.password)) {
      newErrors.password = "Password must be at least 8 characters, include a number and an uppercase letter.";
      valid = false;
    }
    setErrors(newErrors);
    if (valid) {
      await handleSignin(form);
      if(data){
        setForm(initialForm);
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row ">
      {/* Left: Project Summary */}
      <ServicesCard />

      {/* Right: Signin Form */}
      <div className="lg:w-1/2 flex flex-col justify-center items-center px-8 py-12">
        <Card className="w-full max-w-md shadow-elegant border-2 border-primary rounded-xl bg-card backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-extrabold text-primary mb-2 tracking-tight">Sign In</CardTitle>
            <p className="text-muted-foreground text-base">Access your account</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`mt-2 ${errors.email ? "border-destructive" : "border-input"} focus:ring-2 focus:ring-primary transition-shadow`}
                  required
                />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    id="password"
                    name="password"
                    type={!password ? "password" : "text"}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    className={`transition-shadow ${errors.password ? "border-destructive" : "border-input"} focus:ring-2 focus:ring-primary`}
                    required
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-primary"
                    onClick={() => setPassword(!password)}
                  >
                    {!password ? <EyeClosed /> : <Eye />}
                  </Button>
                </div>
                {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
              </div>
              <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground shadow-elegant mt-4 font-semibold text-lg py-3 transition-all hover:scale-[1.02]">
                {isPending ? (
                  <>
                    <LoaderIcon className="animate-spin mr-2" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          <div className="flex items-center justify-center gap-1 p-2 text-sm">
            <p className="text-muted-foreground">Don't have an account?</p>
            <NavLink className="text-primary font-medium hover:underline" to="/signup">
              Sign up
            </NavLink>
          </div>
          <NavLink className="text-primary flex items-center justify-center p-2 text-sm hover:underline" to="/forgot-password">
            Forgot password?
          </NavLink>
        </Card>
      </div>
    </div>
  );
}
