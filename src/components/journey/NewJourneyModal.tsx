"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import LocationSearch from "./LocationSearch";
import { CalendarIcon } from "@/components/icons/CalendarIcon";

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
}

interface NewJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (journeyData: {
    name: string;
    journeyDate: string;
    location: string;
    locationData?: Location;
  }) => void;
}

export default function NewJourneyModal({
  isOpen,
  onClose,
  onSubmit,
}: NewJourneyModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    journeyDate: "",
    location: "",
  });
  const [locationData, setLocationData] = useState<Location | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.journeyDate && formData.location) {
      onSubmit({
        ...formData,
        locationData: locationData || undefined,
      });
      setFormData({ name: "", journeyDate: "", location: "" });
      setLocationData(null);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationSelect = (location: Location) => {
    setLocationData(location);
    setFormData((prev) => ({ ...prev, location: location.name }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-6">New Journey</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <InputField
              type="text"
              placeholder="Add extra details"
              value={formData.name}
              onChange={(value) => handleInputChange("name", value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Journey Date
            </label>
            <div className="relative">
              <InputField
                type="date"
                value={formData.journeyDate}
                onChange={(value) => handleInputChange("journeyDate", value)}
                required
                className="pl-10"
              />
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <LocationSearch
              onLocationSelect={handleLocationSelect}
              placeholder="Search for a location..."
            />
            {locationData && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Selected:</strong> {locationData.name}
                </p>
                <p className="text-xs text-blue-600">{locationData.address}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={
                !formData.name || !formData.journeyDate || !formData.location
              }
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
