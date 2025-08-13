"use client";

import { useState, useRef } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";

interface BannerData {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  gradientColors: {
    from: string;
    via: string;
    to: string;
  };
}

interface BannerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bannerData: BannerData) => void;
  initialData?: BannerData;
}

const defaultBannerData: BannerData = {
  title: "Hyderabad Adventure",
  subtitle: "Hyderabad, India",
  description: "Journey Details • Plan Your Adventure",
  imageUrl: "",
  gradientColors: {
    from: "#2563eb", // blue-600
    via: "#9333ea", // purple-600
    to: "#4338ca", // indigo-700
  },
};

export default function BannerEditModal({
  isOpen,
  onClose,
  onSave,
  initialData = defaultBannerData,
}: BannerEditModalProps) {
  const [bannerData, setBannerData] = useState<BannerData>(initialData);
  const [imagePreview, setImagePreview] = useState<string>(
    initialData.imageUrl
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setBannerData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGradientChange = (
    position: "from" | "via" | "to",
    value: string
  ) => {
    setBannerData((prev) => ({
      ...prev,
      gradientColors: { ...prev.gradientColors, [position]: value },
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setBannerData((prev) => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(bannerData);
    onClose();
  };

  const handleReset = () => {
    setBannerData(defaultBannerData);
    setImagePreview(defaultBannerData.imageUrl);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Banner</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Title
              </label>
              <InputField
                placeholder="Enter banner title"
                value={bannerData.title}
                onChange={(value) => handleInputChange("title", value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <InputField
                placeholder="Enter subtitle (location)"
                value={bannerData.subtitle}
                onChange={(value) => handleInputChange("subtitle", value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <InputField
                placeholder="Enter description"
                value={bannerData.description}
                onChange={(value) => handleInputChange("description", value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Image
              </label>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  Choose Image
                </Button>
                {imagePreview && (
                  <div className="text-sm text-gray-500">Image selected ✓</div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gradient Colors
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    From
                  </label>
                  <input
                    type="color"
                    value={bannerData.gradientColors.from}
                    onChange={(e) =>
                      handleGradientChange("from", e.target.value)
                    }
                    className="w-full h-10 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Via
                  </label>
                  <input
                    type="color"
                    value={bannerData.gradientColors.via}
                    onChange={(e) =>
                      handleGradientChange("via", e.target.value)
                    }
                    className="w-full h-10 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">To</label>
                  <input
                    type="color"
                    value={bannerData.gradientColors.to}
                    onChange={(e) => handleGradientChange("to", e.target.value)}
                    className="w-full h-10 rounded border border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div className="relative h-48 w-full overflow-hidden rounded-lg border border-gray-200">
              {/* Background */}
              {imagePreview ? (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${imagePreview})` }}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                </div>
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to bottom right, ${bannerData.gradientColors.from}, ${bannerData.gradientColors.via}, ${bannerData.gradientColors.to})`,
                  }}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                </div>
              )}

              {/* Content */}
              <div className="relative h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-lg font-bold mb-1">{bannerData.title}</h3>
                  <p className="text-sm opacity-90">{bannerData.subtitle}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {bannerData.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            className="flex-1"
          >
            Reset to Default
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            className="flex-1"
          >
            Save Banner
          </Button>
        </div>
      </div>
    </Modal>
  );
}
