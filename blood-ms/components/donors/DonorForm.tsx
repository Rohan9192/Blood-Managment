"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { donorSchema, DonorInput } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import PhoneInput from "@/components/ui/PhoneInput";
import { BLOOD_GROUPS } from "@/lib/constants";
import { Calendar } from "lucide-react";

interface DonorFormProps {
  initialData?: Partial<DonorInput>;
  onSubmit: (data: DonorInput) => Promise<void>;
  isSubmitting?: boolean;
}

export default function DonorForm({ initialData, onSubmit, isSubmitting }: DonorFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DonorInput>({
    resolver: zodResolver(donorSchema),
    defaultValues: {
      bloodGroup: initialData?.bloodGroup || "A_POS",
      age: initialData?.age || 18,
      location: initialData?.location || "",
      contactNumber: initialData?.contactNumber || "",
      lastDonationDate: initialData?.lastDonationDate || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Blood Group"
          options={[...BLOOD_GROUPS]}
          error={errors.bloodGroup?.message}
          {...register("bloodGroup")}
        />
        <Input
          label="Age"
          type="number"
          min={18}
          max={65}
          error={errors.age?.message}
          {...register("age", { valueAsNumber: true })}
        />
        <div className="md:col-span-2">
          <Input
            label="Location (City/Area)"
            placeholder="e.g., Mumbai, Delhi, Bangalore"
            error={errors.location?.message}
            {...register("location")}
          />
        </div>

        {/* Phone Input with country code */}
        <div className="md:col-span-2">
          <Controller
            name="contactNumber"
            control={control}
            render={({ field }) => (
              <PhoneInput
                label="Contact Number"
                value={field.value}
                onChange={field.onChange}
                error={errors.contactNumber?.message}
              />
            )}
          />
        </div>

        {/* Date Input — styled with visible calendar icon */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Last Donation Date <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <div className="relative group">
            {/* Visible calendar icon on the left */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <Calendar className="w-4.5 h-4.5 text-rose-400 group-focus-within:text-rose-300 transition-colors" />
            </div>
            <input
              type="date"
              {...register("lastDonationDate")}
              className={`
                w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-200 
                bg-slate-800/50 border transition-all duration-200 outline-none
                [color-scheme:dark]
                focus:ring-0 focus:border-rose-500/60 focus:bg-slate-800/80
                hover:border-slate-600
                ${errors.lastDonationDate ? "border-rose-500/60 bg-rose-500/5" : "border-slate-700"}
              `}
            />
          </div>
          {errors.lastDonationDate && (
            <p className="text-rose-400 text-xs">{errors.lastDonationDate.message}</p>
          )}
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Button type="submit" loading={isSubmitting} className="w-full md:w-auto min-w-[180px]">
          {initialData ? "Update Profile" : "Register as Donor"}
        </Button>
      </div>
    </form>
  );
}
