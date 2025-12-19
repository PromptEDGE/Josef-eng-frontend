import { logger } from "@/utils/logger";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ServicesCard from "@/components/ServiceCards";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "@/api/auth";
import useForgottenPassword from "@/hooks/useForgottenPassword";
import { NavLink } from "react-router-dom";


export default function ForgotPasswordPage() {
	const { mutate, isPending, errorMessage, success } = useForgottenPassword()
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");

	// Custom email validation
	const validateEmail = (value: string) => {
		if (!value) return "Email is required.";
		const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
		if (!emailRegex.test(value)) return "Enter a valid email address.";
		return "";
	};



	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const err = validateEmail(email);
		setError(err);
		if (!err) {
			await mutate({ email });
		}
	};

	return (
		<div className="min-h-screen flex bg-background">
			{/* Left: Project summary cards */}
                <ServicesCard />

			{/* Right: Forgot Password form */}
					<div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-card">
				<Card className="w-full max-w-md shadow-elegant">
					<CardHeader>
						<CardTitle className="text-2xl text-primary text-center">Forgot Password</CardTitle>
					</CardHeader>
					<CardContent>
						<form className="space-y-6" onSubmit={handleSubmit} noValidate>
							<div>
								<label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
									Email Address
								</label>
								<Input
									id="email"
									type="email"
									value={email}
									onChange={e => { setEmail(e.target.value); setError(""); }}
									className={cn("w-full", error && "border-destructive")}
									placeholder="Enter your email"
									autoComplete="email"
									required
								/>
								{error && <p className="mt-2 text-destructive text-sm">{error}</p>}
							</div>
							<Button
								disabled={isPending}
								type="submit"
								className="w-full bg-gradient-primary text-primary-foreground shadow-elegant"
							>
								{isPending ? (
									<span className="flex items-center justify-center">
										<RefreshCcw className="animate-spin" />
										Sending...
									</span>
								) : (
									<span>Send Reset Link</span>
								)}
							</Button>
							{success && (
								<p className="mt-4 text-success text-center">Check your email for the reset link.</p>
							)}
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
