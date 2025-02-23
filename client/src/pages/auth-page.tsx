import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const LoginForm = () => {
    const form = useForm({
      resolver: zodResolver(insertUserSchema),
    });

    const onSubmit = form.handleSubmit((data) => {
      loginMutation.mutate(data);
    });

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            {...form.register("username")}
            error={form.formState.errors.username?.message}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            {...form.register("password")}
            error={form.formState.errors.password?.message}
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Login"
          )}
        </Button>
      </form>
    );
  };

  const RegisterForm = () => {
    const form = useForm({
      resolver: zodResolver(insertUserSchema),
    });

    const onSubmit = form.handleSubmit((data) => {
      registerMutation.mutate(data);
    });

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reg-username">Username</Label>
          <Input
            id="reg-username"
            {...form.register("username")}
            error={form.formState.errors.username?.message}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-password">Password</Label>
          <Input
            id="reg-password"
            type="password"
            {...form.register("password")}
            error={form.formState.errors.password?.message}
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Register"
          )}
        </Button>
      </form>
    );
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Welcome to SplitWise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <div className="hidden lg:flex flex-col justify-center p-8 bg-primary text-primary-foreground">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-4">
            Split Bills with Friends Easily
          </h1>
          <p className="text-lg opacity-90">
            Upload receipts, create groups, and let AI handle the calculations.
            Manage expenses effortlessly with our smart bill-splitting solution.
          </p>
        </div>
      </div>
    </div>
  );
}
