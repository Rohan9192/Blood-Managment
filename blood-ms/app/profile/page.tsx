"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import DonorForm from "@/components/donors/DonorForm";
import DonorQRCard from "@/components/donors/DonorQRCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { User, Activity, ShieldCheck, Clock, QrCode } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  });

  const updateDonor = useMutation({
    mutationFn: async (donorData: any) => {
      // If donor exists, update. Else POST.
      const method = profile?.donor ? "PUT" : "POST";
      const url = profile?.donor ? `/api/donors/${profile.donor.id}` : "/api/donors";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donorData),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const toggleAvailability = useMutation({
    mutationFn: async () => {
      if (!profile?.donor) return;
      const res = await fetch(`/api/donors/${profile.donor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: !profile.donor.availability }),
      });
      if (!res.ok) throw new Error("Failed to toggle availability");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Availability updated");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 w-full">
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
          <User className="w-8 h-8 text-slate-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">{profile?.name}</h1>
          <p className="text-slate-400 flex items-center gap-2">
            {profile?.email}
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300">
              {profile?.role}
            </span>
          </p>
        </div>
      </div>

      {session?.user?.role === "DONOR" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-500" />
              Donor Profile
            </h2>
            <DonorForm 
              initialData={profile?.donor || undefined} 
              onSubmit={async (data) => updateDonor.mutateAsync(data)} 
              isSubmitting={updateDonor.isPending}
            />
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Status
              </h3>
              {profile?.donor ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Account status</span>
                    <span className={`px-2 py-1 rounded-md font-medium text-xs ${
                      profile.donor.status === 'APPROVED' ? 'bg-emerald-950/50 text-emerald-400' :
                      profile.donor.status === 'PENDING' ? 'bg-amber-950/50 text-amber-400' :
                      'bg-red-950/50 text-red-400'
                    }`}>
                      {profile.donor.status}
                    </span>
                  </div>
                  
                  {profile.donor.status === 'APPROVED' && (
                    <div className="pt-4 border-t border-slate-800">
                      <p className="text-sm text-slate-400 mb-3">Availability for donation</p>
                      <Button 
                        variant={profile.donor.availability ? "primary" : "secondary"}
                        className="w-full justify-between"
                        onClick={() => toggleAvailability.mutate()}
                        loading={toggleAvailability.isPending}
                      >
                        {profile.donor.availability ? "Currently Available" : "Not Available"}
                        <div className={`w-3 h-3 rounded-full ${profile.donor.availability ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-500'}`} />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  Complete your registration to actively donate and track status.
                </p>
              )}
            </Card>

            {profile?.donor?.donationHistory?.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Recent Donations
                </h3>
                <ul className="space-y-3">
                  {profile.donor.donationHistory.map((history: any) => (
                    <li key={history.id} className="text-sm flex justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                      <span className="text-slate-300 font-medium">{history.units} Units</span>
                      <span className="text-slate-500">{new Date(history.donatedAt).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {profile?.donor && (
              <Card className="p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-violet-400" />
                  Digital Donor ID
                </h3>
                <DonorQRCard profile={profile} />
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

