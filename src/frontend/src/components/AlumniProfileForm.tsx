import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import type { AlumniProfile } from '@/backend';

interface AlumniProfileFormProps {
  initialData: AlumniProfile | null;
  onSave: (data: AlumniProfile) => void;
  isLoading?: boolean;
}

export default function AlumniProfileForm({ initialData, onSave, isLoading }: AlumniProfileFormProps) {
  const [formData, setFormData] = useState<AlumniProfile>({
    fullName: '',
    graduationYear: new Date().getFullYear(),
    department: '',
    currentCity: '',
    currentCountry: '',
    bio: '',
    contactInfo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.graduationYear || formData.graduationYear < 1900 || formData.graduationYear > 2100) {
      newErrors.graduationYear = 'Please enter a valid graduation year';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department/Major is required';
    }

    if (!formData.currentCity.trim()) {
      newErrors.currentCity = 'Current city is required';
    }

    if (!formData.currentCountry.trim()) {
      newErrors.currentCountry = 'Current country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        ...formData,
        contactInfo: formData.contactInfo?.trim() || undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          placeholder="Enter your full name"
          className={errors.fullName ? 'border-destructive' : ''}
        />
        {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="graduationYear">
          Graduation Year <span className="text-destructive">*</span>
        </Label>
        <Input
          id="graduationYear"
          type="number"
          value={formData.graduationYear}
          onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) || 0 })}
          placeholder="e.g., 2020"
          className={errors.graduationYear ? 'border-destructive' : ''}
        />
        {errors.graduationYear && <p className="text-sm text-destructive">{errors.graduationYear}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">
          Department/Major <span className="text-destructive">*</span>
        </Label>
        <Input
          id="department"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          placeholder="e.g., Computer Science"
          className={errors.department ? 'border-destructive' : ''}
        />
        {errors.department && <p className="text-sm text-destructive">{errors.department}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="currentCity">
            Current City <span className="text-destructive">*</span>
          </Label>
          <Input
            id="currentCity"
            value={formData.currentCity}
            onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })}
            placeholder="e.g., Mumbai"
            className={errors.currentCity ? 'border-destructive' : ''}
          />
          {errors.currentCity && <p className="text-sm text-destructive">{errors.currentCity}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentCountry">
            Current Country <span className="text-destructive">*</span>
          </Label>
          <Input
            id="currentCountry"
            value={formData.currentCountry}
            onChange={(e) => setFormData({ ...formData, currentCountry: e.target.value })}
            placeholder="e.g., India"
            className={errors.currentCountry ? 'border-destructive' : ''}
          />
          {errors.currentCountry && <p className="text-sm text-destructive">{errors.currentCountry}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Tell us about yourself, your interests, and professional background..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactInfo">Contact Info (Optional)</Label>
        <Input
          id="contactInfo"
          value={formData.contactInfo || ''}
          onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
          placeholder="Email or social media link"
        />
        <p className="text-xs text-muted-foreground">This will be visible to other alumni</p>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Profile
          </>
        )}
      </Button>
    </form>
  );
}
