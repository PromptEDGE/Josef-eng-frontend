import { logger } from "@/utils/logger";
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
    <div className="h-dvh flex flex-col lg:flex-row ">
      {/* Left: Project Summary */}
      <ServicesCard />

      {/* Right: Signin Form */}
      <div className="lg:w-1/2 flex flex-col justify-center items-center px-8 py-12">
        <Card className="w-full max-w-md shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary mb-2">Sign In</CardTitle>
            <p className="text-muted-foreground">Access your account</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  className={errors.email ? "border-destructive" : ""}
                  required
                />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="flex items-center gap-2">
                    <Input
                    id="password"
                    name="password"
                    type={!password ? "password" : "text"}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    className={errors.password ? "border-destructive" : ""}
                    required
                    />
                    <Button
                        type="button"
                        className=""
                        onClick={() => setPassword(!password)}
                    >
                        {!password ? <EyeClosed /> : <Eye /> } 
                    </Button>
                </div>
                {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
              </div>
              <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground shadow-elegant mt-4">
                {isPending ? 
                <>
                  <LoaderIcon className="animate-spin" />
                  <span>Signing In...</span>
                </> 
                : "Sign In"} 
              </Button>
            </form>
          </CardContent>
          <div className="flex items-center justify-center gap-1 p-2 ">
              <p className="">Don't have an account?</p>
              <NavLink className={"text-blue-400"} to={"/signup"}>
              sign up
              </NavLink>
          </div>
          <NavLink className={"text-blue-400 flex items-center justify-center p-2 "} to={"/forgot-password"}>
              forgot password?
          </NavLink>
        </Card>
      </div>
    </div>
  );
}
