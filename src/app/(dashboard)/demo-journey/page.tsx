"use client";

import React, { useState } from 'react';
import { PlaceType, CreateComprehensiveJourneyDto } from '@/types/journey.types';
import { JourneyService } from '@/lib/services/journey.service';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';

export default function DemoJourneyPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const journeyService = new JourneyService();

  // Sample journey data matching your request body structure
  const sampleJourneyData: CreateComprehensiveJourneyDto = {
    title: "A Wonderful Trip to Paris",
    description: "An exciting 2-day itinerary exploring the best of Paris, from iconic landmarks to charming neighborhoods.",
    days: [
      {
        dayNumber: 1,
        date: "2025-08-15",
        notes: "First day in Paris! Focus on seeing the main sights and enjoying the local food.",
        places: [
          {
            type: PlaceType.TRANSPORT,
            name: "Arrive at Charles de Gaulle Airport (CDG)",
            description: "Flight UA 23 from SFO.",
            startTime: "09:00",
            endTime: "09:30"
          },
          {
            type: PlaceType.STAY,
            name: "Check-in at Hotel Le Meurice",
            description: "Drop off luggage and freshen up before heading out.",
            startTime: "11:00",
            endTime: "12:00"
          },
          {
            type: PlaceType.FOOD,
            name: "Lunch at Le Bouillon Chartier",
            description: "Experience a classic Parisian bouillon with traditional French dishes.",
            startTime: "12:30",
            endTime: "14:00"
          },
          {
            type: PlaceType.ACTIVITY,
            name: "Visit the Eiffel Tower",
            description: "Tickets are pre-booked for the summit. Be there 15 minutes early.",
            startTime: "15:00",
            endTime: "17:00"
          },
          {
            type: PlaceType.FOOD,
            name: "Dinner Cruise on the Seine",
            description: "Enjoy a scenic dinner with Bateaux Parisiens.",
            startTime: "19:30",
            endTime: "21:30"
          }
        ]
      },
      {
        dayNumber: 2,
        date: "2025-08-16",
        notes: "Day of art and exploration. Wear comfortable shoes for walking in Montmartre.",
        places: [
          {
            type: PlaceType.ACTIVITY,
            name: "Explore the Louvre Museum",
            description: "Focus on the Denon wing to see the Mona Lisa and other masterpieces.",
            startTime: "10:00",
            endTime: "13:00"
          },
          {
            type: PlaceType.FOOD,
            name: "Lunch near the Louvre",
            description: "Find a local cafe for a quick bite.",
            startTime: "13:00",
            endTime: "14:00"
          },
          {
            type: PlaceType.ACTIVITY,
            name: "Walk through Montmartre and visit Sacré-Cœur",
            description: "Explore the artistic neighborhood and enjoy the panoramic views from the basilica.",
            startTime: "15:00",
            endTime: "17:00"
          },
          {
            type: PlaceType.TRANSPORT,
            name: "Depart from Gare du Nord",
            description: "Train to London.",
            startTime: "18:30",
            endTime: "19:00"
          }
        ]
      }
    ]
  };

  const handleCreateJourney = async () => {
    setIsCreating(true);
    setError(null);
    setResult(null);

    try {
      console.log('Creating journey with data:', JSON.stringify(sampleJourneyData, null, 2));
      const journey = await journeyService.createComprehensiveJourney(sampleJourneyData);
      setResult(journey);
      console.log('Journey created successfully:', journey);
    } catch (error: any) {
      console.error('Error creating journey:', error);
      setError(error.message || 'Failed to create journey');
    } finally {
      setIsCreating(false);
    }
  };

  const handleTestAPICall = () => {
    // Log the exact request body that would be sent to the API
    console.log('API Request Body:');
    console.log(JSON.stringify(sampleJourneyData, null, 2));
    
    // Also show it in the UI
    setResult({
      message: 'Check the browser console for the API request body',
      requestBody: sampleJourneyData
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Demo: Journey Creation API Test</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sample Journey Data</h2>
              <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                <pre className="text-sm text-gray-700">
                  {JSON.stringify(sampleJourneyData, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleCreateJourney}
                disabled={isCreating}
                variant="primary"
              >
                {isCreating ? 'Creating Journey...' : 'Test Create Journey API'}
              </Button>
              
              <Button
                onClick={handleTestAPICall}
                variant="secondary"
              >
                Show API Request Body
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg"
          >
            <h3 className="font-semibold mb-2">Error:</h3>
            <p>{error}</p>
          </motion.div>
        )}

        {/* Result Display */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg"
          >
            <h3 className="font-semibold mb-2">Result:</h3>
            <div className="bg-white p-4 rounded border border-green-300 overflow-auto max-h-96">
              <pre className="text-sm text-gray-700">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </motion.div>
        )}

        {/* API Information */}
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">API Information:</h3>
          <ul className="space-y-1 text-sm">
            <li><strong>Endpoint:</strong> POST /journeys/comprehensive</li>
            <li><strong>Content-Type:</strong> application/json</li>
            <li><strong>Authorization:</strong> Bearer token (from localStorage)</li>
            <li><strong>Request Body Structure:</strong> CreateComprehensiveJourneyDto</li>
          </ul>
        </div>

        {/* Usage Instructions */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Usage Instructions</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              This demo page allows you to test the comprehensive journey creation functionality. 
              The sample data matches your provided request body structure with PlaceType enum values.
            </p>
            
            <div>
              <h3 className="font-semibold mb-2">Features implemented:</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>PlaceType enum (STAY, ACTIVITY, FOOD, TRANSPORT, NOTE)</li>
                <li>Comprehensive journey creation with multiple days</li>
                <li>Place scheduling with start and end times</li>
                <li>Day-specific notes and descriptions</li>
                <li>Full form validation</li>
                <li>API integration ready</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Next steps:</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Update your backend API endpoint to handle the comprehensive journey structure</li>
                <li>Test the actual API call once your backend is ready</li>
                <li>Navigate to <a href="/create-journey" className="text-blue-500 underline">/create-journey</a> to use the interactive form</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
