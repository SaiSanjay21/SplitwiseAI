import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGroupSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function CreateGroup() {
  const [, setLocation] = useLocation();
  const form = useForm({
    resolver: zodResolver(insertGroupSchema),
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await apiRequest("POST", "/api/groups", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setLocation(`/groups/${data.id}`);
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    createGroupMutation.mutate(data);
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Groups
        </Link>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Create New Group</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  error={form.formState.errors.name?.message}
                  placeholder="Enter group name"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createGroupMutation.isPending}
              >
                {createGroupMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create Group"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
