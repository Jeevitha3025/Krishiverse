import { useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/user-context";
import { db } from "../firebaseConfig"; // 👈 Import our new database
import { doc, setDoc } from "firebase/firestore"; // 👈 Import Firestore writing tools
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, UserCircle, MapPin, Sprout, Droplets, FileText, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// --- Form Schemas ---
const personalDetailsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mobileNumber: z.string().min(10, "Valid mobile number required"),
  ageGroup: z.string().min(1, "Age group is required"),
});
const farmLocationSchema = z.object({
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  taluk: z.string().min(1, "Taluk is required"),
  gramPanchayat: z.string().min(1, "Gram Panchayat is required"),
  village: z.string().min(1, "Village is required"),
  farmSize: z.string().min(1, "Farm size is required"),
});
const soilTypeSchema = z.object({
  soilType: z.string().min(1, "Soil type is required"),
});
const cropsSchema = z.object({
  primaryCrops: z.array(z.string()).min(1, "Select at least one crop"),
});
const waterSourceSchema = z.object({
  waterSource: z.string().min(1, "Water source is required"),
});

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user, setUser, setFarm, setProgress } = useUser();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  const steps = [
    { title: "Personal Details", icon: UserCircle, component: PersonalDetailsStep },
    { title: "Farm Location", icon: MapPin, component: FarmLocationStep },
    { title: "Soil Type", icon: FileText, component: SoilTypeStep },
    { title: "Crops", icon: Sprout, component: CropsStep },
    { title: "Water Source", icon: Droplets, component: WaterSourceStep },
  ];

  const progress = (currentStep / steps.length) * 100;

  const handleNext = async (stepData: any) => {
    const newFormData = { ...formData, [`step${currentStep}`]: stepData };
    setFormData(newFormData);

    // If we are on the final step, SAVE everything to FIRESTORE
    if (currentStep === steps.length) {
      if (!user) {
        toast({ title: "Error", description: "You must be logged in to save.", variant: "destructive" });
        return;
      }
      
      setIsSaving(true);
      
      try {
          // 1. Build the Farm Profile
          const newFarm = {
              userId: user.id,
              ...newFormData.step2, // Location
              ...newFormData.step3, // Soil
              ...newFormData.step4, // Crops
              ...newFormData.step5, // Water
          };

          // 2. Build starting Progress
          const newProgress = {
              userId: user.id,
              level: 1,
              experience: 0,
              totalCoins: 0, // Note: Added 'totalCoins' to match your dashboard display
              coins: 0,
              sustainabilityScore: 0,
              completedQuests: [],
              badges: []
          };

          // 3. Update the user's name locally
          const updatedUser = { ...user, name: newFormData.step1.name };
          
          // --- THE MAGIC: SAVE TO FIRESTORE CLOUD ---
          // Save Farm document using the User's unique ID
          await setDoc(doc(db, "farms", user.id), newFarm);
          
          // Save Progress document using the User's unique ID
          await setDoc(doc(db, "progress", user.id), newProgress);
          
          // Save User profile info
          await setDoc(doc(db, "users", user.id), updatedUser, { merge: true });

          // 4. Update the Local App State so it loads immediately without refreshing
          setUser(updatedUser);
          setFarm(newFarm as any);
          setProgress(newProgress as any);

          toast({
              title: "Welcome to KrishiVerse! 🌱",
              description: "Your smart farm profile is permanently saved.",
          });
          
          // 5. Go to Dashboard!
          setLocation("/dashboard");

      } catch (error: any) {
          console.error("Error saving to Firestore:", error);
          toast({
              title: "Save Failed",
              description: "Could not save your profile. Please try again.",
              variant: "destructive"
          });
      } finally {
          setIsSaving(false);
      }

    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setLocation("/");
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;
  const StepIcon = steps[currentStep - 1].icon;

  return (
    <div className="min-h-screen mobile-content bg-slate-50" data-testid="onboarding-screen">
      <div className="bg-green-700 text-white p-4 flex items-center shadow-md">
        <Button variant="ghost" onClick={handleBack} className="mr-3 text-white hover:bg-green-600">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Setup Your Farm Profile</h1>
      </div>
      
      <div className="p-6 space-y-6 max-w-xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-500 mb-2 font-medium">
            <span>Step {currentStep} of {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-200" />
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="bg-green-50/50 border-b border-green-100 pb-4">
            <CardTitle className="flex items-center text-green-800">
              <StepIcon className="text-green-600 mr-3 h-6 w-6" />
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <CurrentStepComponent
              onNext={handleNext}
              initialData={formData[`step${currentStep}`]}
              isLoading={isSaving}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Step 1 ---
function PersonalDetailsStep({ onNext, initialData, isLoading }: any) {
  const form = useForm({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: initialData || { name: "", mobileNumber: "", ageGroup: "" },
  });

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
      <div>
        <Label>Farmer Name</Label>
        <Input placeholder="Enter your full name" {...form.register("name")} />
      </div>
      <div>
        <Label>Mobile Number</Label>
        <Input type="tel" placeholder="+91 XXXXX XXXXX" {...form.register("mobileNumber")} />
      </div>
      <div>
        <Label>Age Group</Label>
        <Select onValueChange={(value) => form.setValue("ageGroup", value)} defaultValue={form.getValues("ageGroup")}>
          <SelectTrigger><SelectValue placeholder="Select age group" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="18-30">18-30 years</SelectItem>
            <SelectItem value="31-45">31-45 years</SelectItem>
            <SelectItem value="46-60">46-60 years</SelectItem>
            <SelectItem value="60+">60+ years</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full bg-green-700 hover:bg-green-800" disabled={isLoading}>
        Continue to Location
      </Button>
    </form>
  );
}

// --- Step 2 ---
function FarmLocationStep({ onNext, initialData }: any) {
  const form = useForm({
    resolver: zodResolver(farmLocationSchema),
    defaultValues: initialData || {},
  });

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>State</Label>
          <Select onValueChange={(value) => form.setValue("state", value)} defaultValue={form.getValues("state")}>
            <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Maharashtra">Maharashtra</SelectItem>
              <SelectItem value="Karnataka">Karnataka</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>District</Label>
          <Select onValueChange={(value) => form.setValue("district", value)} defaultValue={form.getValues("district")}>
            <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Wardha">Wardha</SelectItem>
              <SelectItem value="Nagpur">Nagpur</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div><Label>Taluk</Label><Input placeholder="Enter taluk" {...form.register("taluk")} /></div>
      <div><Label>Gram Panchayat</Label><Input placeholder="Enter panchayat" {...form.register("gramPanchayat")} /></div>
      <div><Label>Village</Label><Input placeholder="Enter village" {...form.register("village")} /></div>
      <div>
        <Label>Farm Size</Label>
        <Select onValueChange={(value) => form.setValue("farmSize", value)} defaultValue={form.getValues("farmSize")}>
          <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="0.5-1 acre">0.5-1 acre</SelectItem>
            <SelectItem value="1-5 acres">1-5 acres</SelectItem>
            <SelectItem value="5+ acres">5+ acres</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full bg-green-700 hover:bg-green-800">Continue to Soil Type</Button>
    </form>
  );
}

// --- Step 3 ---
function SoilTypeStep({ onNext, initialData }: any) {
  const form = useForm({
    resolver: zodResolver(soilTypeSchema),
    defaultValues: initialData || {},
  });

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
      <div>
        <Label>Soil Type</Label>
        <Select onValueChange={(value) => form.setValue("soilType", value)} defaultValue={form.getValues("soilType")}>
          <SelectTrigger><SelectValue placeholder="Select soil type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Black Cotton Soil">Black Cotton Soil</SelectItem>
            <SelectItem value="Red Soil">Red Soil</SelectItem>
            <SelectItem value="Alluvial Soil">Alluvial Soil</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full bg-green-700 hover:bg-green-800">Continue to Crops</Button>
    </form>
  );
}

// --- Step 4 ---
function CropsStep({ onNext, initialData }: any) {
  const [selectedCrops, setSelectedCrops] = useState<string[]>(initialData?.primaryCrops || []);
  const availableCrops = ["Wheat", "Rice", "Maize", "Cotton", "Soybean", "Sugarcane"];

  const toggleCrop = (crop: string) => {
    setSelectedCrops(prev => prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop]);
  };

  return (
    <div className="space-y-4">
      <Label>Primary Crops</Label>
      <div className="grid grid-cols-2 gap-3">
        {availableCrops.map((crop) => (
          <Button
            key={crop}
            type="button"
            variant={selectedCrops.includes(crop) ? "default" : "outline"}
            onClick={() => toggleCrop(crop)}
            className={selectedCrops.includes(crop) ? "bg-green-700 hover:bg-green-800" : ""}
          >
            {crop}
          </Button>
        ))}
      </div>
      <Button onClick={() => onNext({ primaryCrops: selectedCrops })} className="w-full bg-green-700 hover:bg-green-800" disabled={selectedCrops.length === 0}>
        Continue to Water Source
      </Button>
    </div>
  );
}

// --- Step 5 ---
function WaterSourceStep({ onNext, initialData, isLoading }: any) {
  const form = useForm({
    resolver: zodResolver(waterSourceSchema),
    defaultValues: initialData || {},
  });

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
      <div>
        <Label>Primary Water Source</Label>
        <Select onValueChange={(value) => form.setValue("waterSource", value)} defaultValue={form.getValues("waterSource")}>
          <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Borewell">Borewell</SelectItem>
            <SelectItem value="Canal">Canal</SelectItem>
            <SelectItem value="Rain-fed">Rain-fed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full bg-green-700 hover:bg-green-800" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Complete Setup"}
      </Button>
    </form>
  );
}