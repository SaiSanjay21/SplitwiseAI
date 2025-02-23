import { useQuery, useMutation } from "@tanstack/react-query";
import { Group, GroupMember, Bill } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Loader2,
  Upload,
  Receipt,
  DollarSign,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

export default function GroupPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: group } = useQuery<Group>({
    queryKey: [`/api/groups/${id}`],
  });

  const { data: members } = useQuery<GroupMember[]>({
    queryKey: [`/api/groups/${id}/members`],
  });

  const { data: bills, isLoading: billsLoading } = useQuery<Bill[]>({
    queryKey: [`/api/groups/${id}/bills`],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onload = () => resolve(reader.result as string);
      });
      reader.readAsDataURL(file);
      const base64 = await base64Promise;
      const base64Data = (base64 as string).split(",")[1];

      const res = await apiRequest("POST", `/api/groups/${id}/bills`, {
        receipt: base64Data,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${id}/bills`] });
      setSelectedFile(null);
      toast({
        title: "Success",
        description: "Receipt processed successfully",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Groups
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{group?.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-medium mb-4">Members</h3>
                <div className="space-y-2">
                  {members?.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <span>User #{member.userId}</span>
                      <span className="text-sm bg-primary/10 px-2 py-1 rounded">
                        Symbol: {member.symbol}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Upload Receipt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="receipt">Receipt Image</Label>
                    <Input
                      id="receipt"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploadMutation.isPending}
                    className="w-full"
                  >
                    {uploadMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload & Process
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Bills</CardTitle>
              </CardHeader>
              <CardContent>
                {billsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-24 bg-muted animate-pulse rounded"
                      />
                    ))}
                  </div>
                ) : bills?.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No bills yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bills?.map((bill) => (
                      <Card key={bill.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                              <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                              <span className="font-medium">
                                Total: ${bill.total}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(bill.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {bill.splits.map((split, i) => (
                              <div
                                key={i}
                                className="flex justify-between items-center text-sm"
                              >
                                <span>User #{split.userId}</span>
                                <span>${split.amount}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
