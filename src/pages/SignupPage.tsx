import React, { FormEvent, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeClosed, LoaderIcon } from "lucide-react";
import { SignupFormType } from "@/utils/types";
import { NavLink } from "react-router-dom";
import ServicesCard from "@/components/ServiceCards";
import { useSignup } from "@/hooks/useSignup";
import { validateEmail, validateName, validatePassword } from "@/utils/Validations";




const initialForm: SignupFormType = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
};

export default function SignupPage() {
  const { handleSignup, isPending, data } = useSignup()
  const [form, setForm] = useState<SignupFormType>(initialForm);
  const [errors, setErrors] = useState<SignupFormType>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [password, setPassword] = useState<boolean>(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }



 async function handleSubmit(e: React.FormEvent, form: SignupFormType) {
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
    if (!validateName(form.firstName)) {
      newErrors.firstName = "First name must be at least 2 letters.";
      valid = false;
    }
    if (!validateName(form.lastName)) {
      newErrors.lastName = "Last name must be at least 2 letters.";
      valid = false;
    }
    setErrors(newErrors);
    if (valid) {
      // TODO: handle actual signup logic
      await handleSignup(form)
      if(data){
        setForm(initialForm);
      }      

    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row ">
      {/* Left: Project Summary */}
      <ServicesCard />
      {/* Right: Signup Form */}
      <div className="lg:w-1/2 flex flex-col justify-center items-center px-8 py-12">
        <Card className="w-full max-w-md shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary mb-2">Sign Up</CardTitle>
            <p className="text-muted-foreground">Create your account to get started</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={(e:FormEvent)=>handleSubmit(e,form)} noValidate>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? "border-destructive" : ""}
                    required
                  />
                  {errors.firstName && <p className="text-destructive text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div className="flex-1">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? "border-destructive" : ""}
                    required
                  />
                  {errors.lastName && <p className="text-destructive text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>
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
                    type={password ? "text" : "password"}
                    autoComplete="new-password"
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
              <Button disabled={isPending} type="submit" className="w-full bg-gradient-primary text-primary-foreground shadow-elegant mt-4"> 
                {isPending ? 
                <>
                  <LoaderIcon className="animate-spin" />
                  <span>Signing Up...</span>
                </> 
                : "Sign Up"} 
              </Button>
            </form>
          </CardContent>
          <div className="flex items-center justify-center gap-1 p-2 ">
            <p className="">Have an account?</p>
            <NavLink className={"text-blue-400"} to={"/signin"}>
              sign in
            </NavLink>
          </div>
        </Card>
      </div>
    </div>
  );
}
