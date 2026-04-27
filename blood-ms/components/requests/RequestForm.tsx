"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestSchema, RequestInput } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { BLOOD_GROUPS, URGENCY_LEVELS } from "@/lib/constants";

interface RequestFormProps {
  onSubmit: (data: RequestInput) => Promise<void>;
  isSubmitting?: boolean;
}

export default function RequestForm({ onSubmit, isSubmitting }: RequestFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestInput>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      bloodGroup: "A_POS",
      units: 1,
      urgency: "NORMAL",
      location: "",
      notes: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Required Blood Group"
          options={[...BLOOD_GROUPS]}
          error={errors.bloodGroup?.message}
          {...register("bloodGroup")}
        />
        <Select
          label="Urgency Level"
          options={URGENCY_LEVELS.map(u => ({ value: u.value, label: u.label }))}
          error={errors.urgency?.message}
          {...register("urgency")}
        />
        <Input
          label="Units Required"
          type="number"
          min={1}
          max={10}
          error={errors.units?.message}
          {...register("units", { valueAsNumber: true })}
        />
        <Input
          label="Location (Hospital/Area)"
          placeholder="e.g., City Gen. Hospital"
          error={errors.location?.message}
          {...register("location")}
        />
        <div className="md:col-span-2">
          <Input
            label="Additional Notes (Optional)"
            placeholder="Any specific details..."
            error={errors.notes?.message}
            {...register("notes")}
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" loading={isSubmitting} className="w-full md:w-auto min-w-[200px]">
          Submit Blood Request
        </Button>
      </div>
    </form>
  );
}
