'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const ASSISTANT_URL = 'https://reimagined-space-sniffle-pjvp5g7rpqjjhr9ww-8000.app.github.dev/assistant';

type Hospital = {
    name: string;
    address?: string;
    distance?: string;
    phone?: string;
    [key: string]: unknown;
};

type AssistantResponse = {
    response?: string;
    hospitals?: Hospital[];
    recommendations?: string[];
    [key: string]: unknown;
};

const HealthAssistantPage = () => {
    const [riskLevel, setRiskLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
    const [userLocation, setUserLocation] = useState('');
    const [userQuery, setUserQuery] = useState('');
    const [result, setResult] = useState<AssistantResponse | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    // Get user's current location
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setApiError('Geolocation is not supported by your browser');
            return;
        }

        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    // Use reverse geocoding to get address
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
                    );
                    const data = await response.json();
                    const address = data.address;
                    const locationString = [
                        address?.city || address?.town || address?.village,
                        address?.state,
                        address?.country
                    ].filter(Boolean).join(', ');
                    setUserLocation(locationString || 'Unknown location');
                } catch {
                    setUserLocation('Mumbai, Maharashtra'); // Fallback
                } finally {
                    setIsGettingLocation(false);
                }
            },
            () => {
                setUserLocation('Mumbai, Maharashtra'); // Fallback on error
                setIsGettingLocation(false);
            }
        );
    };

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setApiError(null);
        setResult(null);
        setIsSubmitting(true);

        try {
            const response = await fetch(ASSISTANT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    risk_level: riskLevel,
                    user_location: userLocation,
                    user_query: userQuery
                })
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || `Request failed (${response.status})`);
            }

            const data = (await response.json()) as AssistantResponse;
            setResult(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Request failed';
            setApiError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const suggestedQueries = [
        'What should I do now?',
        'Where is the nearest hospital?',
        'What are the symptoms of TB?',
        'How can I get tested?'
    ];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <div className="mx-auto flex min-h-screen w-full max-w-6xl items-start justify-center px-4 py-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2"
                >
                    {/* Input Card */}
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                🏥 Health Assistant
                            </CardTitle>
                            <CardDescription>
                                Ask questions about your health and find nearby hospitals
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Risk Level */}
                                <div className="space-y-2">
                                    <Label>Risk Level</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['LOW', 'MEDIUM', 'HIGH'] as const).map((level) => (
                                            <Button
                                                key={level}
                                                type="button"
                                                variant={riskLevel === level ? 'default' : 'outline'}
                                                className={`w-full ${
                                                    riskLevel === level
                                                        ? level === 'HIGH'
                                                            ? 'bg-red-600 hover:bg-red-700'
                                                            : level === 'MEDIUM'
                                                            ? 'bg-orange-500 hover:bg-orange-600'
                                                            : 'bg-green-600 hover:bg-green-700'
                                                        : ''
                                                }`}
                                                onClick={() => setRiskLevel(level)}
                                            >
                                                {level}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="space-y-2">
                                    <Label htmlFor="location">Your Location</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="location"
                                            value={userLocation}
                                            onChange={(e) => setUserLocation(e.target.value)}
                                            placeholder="e.g., Mumbai, Maharashtra"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={getCurrentLocation}
                                            disabled={isGettingLocation}
                                        >
                                            {isGettingLocation ? '...' : '📍'}
                                        </Button>
                                    </div>
                                </div>

                                {/* Query */}
                                <div className="space-y-2">
                                    <Label htmlFor="query">Your Question</Label>
                                    <Textarea
                                        id="query"
                                        value={userQuery}
                                        onChange={(e) => setUserQuery(e.target.value)}
                                        placeholder="What would you like to know?"
                                        rows={3}
                                        required
                                    />
                                </div>

                                {/* Suggested Queries */}
                                <div className="space-y-2">
                                    <Label className="text-xs text-zinc-500">Suggested questions:</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestedQueries.map((query, index) => (
                                            <Button
                                                key={index}
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setUserQuery(query)}
                                            >
                                                {query}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {apiError && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
                                        {apiError}
                                    </div>
                                )}

                                <Button type="submit" disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? 'Getting Response...' : 'Ask Assistant'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Result Card */}
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <CardTitle>💬 Response</CardTitle>
                            <CardDescription>Assistant response and nearby hospitals</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AnimatePresence mode="wait">
                                {result ? (
                                    <motion.div
                                        key="result"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.25 }}
                                        className="space-y-4"
                                    >
                                        {/* Response Text */}
                                        {result.response && (
                                            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                                                <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                                                    {result.response}
                                                </p>
                                            </div>
                                        )}

                                        {/* Recommendations */}
                                        {result.recommendations && result.recommendations.length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                                                    📋 Recommendations
                                                </h4>
                                                <ul className="space-y-1">
                                                    {result.recommendations.map((rec, index) => (
                                                        <li key={index} className="text-sm text-zinc-600 dark:text-zinc-400">
                                                            • {rec}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Hospitals */}
                                        {result.hospitals && result.hospitals.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                                                    🏥 Nearby Hospitals
                                                </h4>
                                                {result.hospitals.map((hospital, index) => (
                                                    <div
                                                        key={index}
                                                        className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
                                                    >
                                                        <div className="font-medium text-zinc-900 dark:text-zinc-50">
                                                            {hospital.name}
                                                        </div>
                                                        {hospital.address && (
                                                            <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                {hospital.address}
                                                            </div>
                                                        )}
                                                        <div className="mt-1 flex gap-3 text-xs">
                                                            {hospital.distance && (
                                                                <Badge variant="secondary">📍 {hospital.distance}</Badge>
                                                            )}
                                                            {hospital.phone && (
                                                                <Badge variant="outline">📞 {hospital.phone}</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="rounded-xl border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
                                    >
                                        Submit your question to get a response from the health assistant.
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default HealthAssistantPage;
