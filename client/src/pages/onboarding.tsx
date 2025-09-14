import { useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, UserCircle, MapPin, Sprout, Droplets, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, insertFarmSchema } from "@shared/schema";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form schemas for each step
const personalDetailsSchema = insertUserSchema;
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
  const { setUser, setFarm, language } = useUser();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});

  const createUserMutation = useMutation({
    mutationFn: (userData: any) => apiRequest('POST', '/api/users', userData),
    onSuccess: async (response) => {
      const user = await response.json();
      setUser(user);
      
      // Create farm after user is created
      const farmData = {
        userId: user.id,
        ...formData.location,
        ...formData.soil,
        ...formData.crops,
        ...formData.water,
      };
      
      const farmResponse = await apiRequest('POST', '/api/farms', farmData);
      const farm = await farmResponse.json();
      setFarm(farm);
      
      toast({
        title: "Welcome to KrishiGrow! 🌱",
        description: "Your profile has been created successfully.",
      });
      
      setLocation("/dashboard");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create your profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const steps = [
    { title: "Personal Details", icon: UserCircle, component: PersonalDetailsStep },
    { title: "Farm Location", icon: MapPin, component: FarmLocationStep },
    { title: "Soil Type", icon: FileText, component: SoilTypeStep },
    { title: "Crops", icon: Sprout, component: CropsStep },
    { title: "Water Source", icon: Droplets, component: WaterSourceStep },
  ];

  const progress = (currentStep / steps.length) * 100;

  const handleNext = (stepData: any) => {
    const newFormData = { ...formData, [`step${currentStep}`]: stepData };
    setFormData(newFormData);

    if (currentStep === steps.length) {
      // Submit the complete form
      const userData = {
        ...newFormData.step1,
        language,
      };
      
      const completeFormData = {
        personal: newFormData.step1,
        location: newFormData.step2,
        soil: newFormData.step3,
        crops: newFormData.step4,
        water: newFormData.step5,
      };
      
      setFormData(completeFormData);
      createUserMutation.mutate(userData);
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
    <div className="min-h-screen mobile-content" data-testid="onboarding-screen">
      <div className="bg-primary text-primary-foreground p-4 flex items-center">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mr-3 text-primary-foreground hover:bg-primary-foreground/10"
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold" data-testid="onboarding-title">Setup Your Farm Profile</h1>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span data-testid="step-indicator">Step {currentStep} of {steps.length}</span>
            <span data-testid="progress-percentage">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-bar" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <StepIcon className="text-primary mr-3 h-6 w-6" />
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CurrentStepComponent
              onNext={handleNext}
              initialData={formData[`step${currentStep}`]}
              isLoading={createUserMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Step Components
function PersonalDetailsStep({ onNext, initialData, isLoading }: any) {
  const form = useForm({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: initialData || {
      name: "",
      mobileNumber: "",
      ageGroup: "",
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-4" data-testid="personal-details-form">
      <div>
        <Label htmlFor="name">Farmer Name</Label>
        <Input
          id="name"
          placeholder="Enter your full name"
          {...form.register("name")}
          data-testid="input-name"
        />
        {form.formState.errors.name && (
          <p className="text-destructive text-sm mt-1">{String(form.formState.errors.name.message)}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="mobile">Mobile Number</Label>
        <Input
          id="mobile"
          type="tel"
          placeholder="+91 XXXXX XXXXX"
          {...form.register("mobileNumber")}
          data-testid="input-mobile"
        />
        {form.formState.errors.mobileNumber && (
          <p className="text-destructive text-sm mt-1">{String(form.formState.errors.mobileNumber.message)}</p>
        )}
      </div>

      <div>
        <Label htmlFor="age">Age Group</Label>
        <Select onValueChange={(value) => form.setValue("ageGroup", value)} defaultValue={form.getValues("ageGroup")}>
          <SelectTrigger data-testid="select-age-group">
            <SelectValue placeholder="Select age group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="18-30">18-30 years</SelectItem>
            <SelectItem value="31-45">31-45 years</SelectItem>
            <SelectItem value="46-60">46-60 years</SelectItem>
            <SelectItem value="60+">60+ years</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.ageGroup && (
          <p className="text-destructive text-sm mt-1">{String(form.formState.errors.ageGroup.message)}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-continue-personal">
        Continue to Location
      </Button>
    </form>
  );
}

function FarmLocationStep({ onNext, initialData }: any) {
  const form = useForm({
    resolver: zodResolver(farmLocationSchema),
    defaultValues: initialData || {},
  });

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-4" data-testid="farm-location-form">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="state">State</Label>
          <Select onValueChange={(value) => form.setValue("state", value)} defaultValue={form.getValues("state")}>
            <SelectTrigger data-testid="select-state">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Maharashtra">Maharashtra</SelectItem>
              <SelectItem value="Karnataka">Karnataka</SelectItem>
              <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
              <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="district">District</Label>
          <Select onValueChange={(value) => form.setValue("district", value)} defaultValue={form.getValues("district")}>
            <SelectTrigger data-testid="select-district">
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Wardha">Wardha</SelectItem>
              <SelectItem value="Nagpur">Nagpur</SelectItem>
              <SelectItem value="Akola">Akola</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="taluk">Taluk</Label>
        <Input
          id="taluk"
          placeholder="Enter taluk name"
          {...form.register("taluk")}
          data-testid="input-taluk"
        />
      </div>

      <div>
        <Label htmlFor="gramPanchayat">Gram Panchayat</Label>
        <Input
          id="gramPanchayat"
          placeholder="Enter gram panchayat name"
          {...form.register("gramPanchayat")}
          data-testid="input-gram-panchayat"
        />
      </div>

      <div>
        <Label htmlFor="village">Village</Label>
        <Input
          id="village"
          placeholder="Enter village name"
          {...form.register("village")}
          data-testid="input-village"
        />
      </div>

      <div>
        <Label htmlFor="farmSize">Farm Size</Label>
        <Select onValueChange={(value) => form.setValue("farmSize", value)} defaultValue={form.getValues("farmSize")}>
          <SelectTrigger data-testid="select-farm-size">
            <SelectValue placeholder="Select farm size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.5-1 acre">0.5-1 acre</SelectItem>
            <SelectItem value="1-2 acres">1-2 acres</SelectItem>
            <SelectItem value="2-5 acres">2-5 acres</SelectItem>
            <SelectItem value="5+ acres">5+ acres</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" data-testid="button-continue-location">
        Continue to Soil Type
      </Button>
    </form>
  );
}

function SoilTypeStep({ onNext, initialData }: any) {
  const form = useForm({
    resolver: zodResolver(soilTypeSchema),
    defaultValues: initialData || {},
  });

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-4" data-testid="soil-type-form">
      <div>
        <Label htmlFor="soilType">Soil Type</Label>
        <Select onValueChange={(value) => form.setValue("soilType", value)} defaultValue={form.getValues("soilType")}>
          <SelectTrigger data-testid="select-soil-type">
            <SelectValue placeholder="Select soil type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Black Cotton Soil">Black Cotton Soil</SelectItem>
            <SelectItem value="Red Soil">Red Soil</SelectItem>
            <SelectItem value="Alluvial Soil">Alluvial Soil</SelectItem>
            <SelectItem value="Laterite Soil">Laterite Soil</SelectItem>
            <SelectItem value="Sandy Soil">Sandy Soil</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 If you have a Soil Health Card, you can use it to identify your exact soil type and nutrient levels.
        </p>
      </div>

      <Button type="submit" className="w-full" data-testid="button-continue-soil">
        Continue to Crops
      </Button>
    </form>
  );
}

function CropsStep({ onNext, initialData }: any) {
  const [selectedCrops, setSelectedCrops] = useState<string[]>(initialData?.primaryCrops || []);

  const availableCrops = [
    "Wheat", "Rice", "Maize", "Cotton", "Soybean", "Sugarcane",
    "Tomato", "Onion", "Potato", "Banana", "Mango", "Grapes"
  ];

  const toggleCrop = (crop: string) => {
    setSelectedCrops(prev => 
      prev.includes(crop) 
        ? prev.filter(c => c !== crop)
        : [...prev, crop]
    );
  };

  const handleSubmit = () => {
    if (selectedCrops.length === 0) return;
    onNext({ primaryCrops: selectedCrops });
  };

  return (
    <div className="space-y-4" data-testid="crops-form">
      <Label>Primary Crops (Select multiple)</Label>
      
      <div className="grid grid-cols-2 gap-3">
        {availableCrops.map((crop) => (
          <Button
            key={crop}
            type="button"
            variant={selectedCrops.includes(crop) ? "default" : "outline"}
            onClick={() => toggleCrop(crop)}
            className="h-auto p-3 justify-start"
            data-testid={`crop-${crop.toLowerCase()}`}
          >
            {crop}
          </Button>
        ))}
      </div>

      {selectedCrops.length > 0 && (
        <div className="p-3 bg-success/10 rounded-lg">
          <p className="text-sm text-success-foreground">
            Selected: {selectedCrops.join(", ")}
          </p>
        </div>
      )}

      <Button 
        onClick={handleSubmit} 
        className="w-full" 
        disabled={selectedCrops.length === 0}
        data-testid="button-continue-crops"
      >
        Continue to Water Source
      </Button>
    </div>
  );
}

function WaterSourceStep({ onNext, initialData, isLoading }: any) {
  const form = useForm({
    resolver: zodResolver(waterSourceSchema),
    defaultValues: initialData || {},
  });

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-4" data-testid="water-source-form">
      <div>
        <Label htmlFor="waterSource">Primary Water Source</Label>
        <Select onValueChange={(value) => form.setValue("waterSource", value)} defaultValue={form.getValues("waterSource")}>
          <SelectTrigger data-testid="select-water-source">
            <SelectValue placeholder="Select water source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Borewell">Borewell</SelectItem>
            <SelectItem value="Canal">Canal</SelectItem>
            <SelectItem value="Rain-fed">Rain-fed</SelectItem>
            <SelectItem value="River">River</SelectItem>
            <SelectItem value="Pond">Pond</SelectItem>
            <SelectItem value="Well">Well</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="p-4 bg-accent/10 rounded-lg">
        <p className="text-sm text-accent-foreground">
          🌊 Your water source information helps us recommend appropriate irrigation techniques and water conservation methods.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-complete-onboarding">
        {isLoading ? "Creating Profile..." : "Complete Setup"}
      </Button>
    </form>
  );
}
