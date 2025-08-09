import React, { FormEvent, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeClosed, LoaderIcon } from "lucide-react";
import { signUpUser } from "@/api/auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SignupFormType } from "@/utils/types";
import { useToast } from "@/hooks/use-toast";
import { useDispatch } from "react-redux";
import { storage } from "@/utils/localStorage";
import { NavLink, useNavigate } from "react-router-dom";
import { setUser } from "@/lib/redux/slice/localStorageSlice";
import ServicesCard from "@/components/ServiceCards";




const initialForm: SignupFormType = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
};

function validateEmail(email: string) {
  return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
}
function validatePassword(password: string) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}
function validateName(name: string) {
  return name.length >= 2 && /^[A-Za-z]+$/.test(name);
}

export default function SignuPage() {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate()
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


  const {mutate, isPending} = useMutation({
    mutationFn: (form:SignupFormType) => signUpUser(form),
    onSuccess: async (data) => {
      setForm(initialForm);
     await storage("user", form);
     dispatch(setUser(data));
     navigate("/")
      toast({
        title: "Signup successful",
        description: "You have successfully signed up.",
      });
    },
    onError: (error) => {
      toast({
        title: "Signup failed",
        description: error.message||error?.detail,
        variant: "destructive",
      });
    }
  });

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
      await mutate(form)
      

    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
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
