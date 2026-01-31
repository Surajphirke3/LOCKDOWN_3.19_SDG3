'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PredictionResult = {
    risk_score: number;
    risk_level: string;
    [key: string]: unknown;
};

const CoughPredictionPage = () => {
    // Basic Info
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<'Male' | 'Female'>('Male');
    
    // Symptoms
    const [coughDays, setCoughDays] = useState('');
    const [fever, setFever] = useState<'Yes' | 'No'>('No');
    const [weightLoss, setWeightLoss] = useState('');
    const [nightSweats, setNightSweats] = useState<'Yes' | 'No'>('No');
    const [chestPain, setChestPain] = useState<'Yes' | 'No'>('No');
    const [hemoptysis, setHemoptysis] = useState<'Yes' | 'No'>('No');
    const [breathlessness, setBreathlessness] = useState<'Mild' | 'Moderate' | 'Severe'>('Mild');
    
    // History
    const [contactHistory, setContactHistory] = useState<'Yes' | 'No'>('No');
    const [travelHistory, setTravelHistory] = useState<'Yes' | 'No'>('No');
    const [hivStatus, setHivStatus] = useState<'Positive' | 'Negative'>('Negative');
    const [previousTB, setPreviousTB] = useState<'Yes' | 'No'>('No');
    
    // Test Results
    const [chestXRay, setChestXRay] = useState<'Normal' | 'Abnormal'>('Normal');
    const [sputumTest, setSputumTest] = useState<'Positive' | 'Negative'>('Negative');
    
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setApiError(null);
        setResult(null);
        setIsSubmitting(true);

        try {
            const response = await fetch('https://reimagined-space-sniffle-pjvp5g7rpqjjhr9ww-8000.app.github.dev/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Age: parseInt(age, 10),
                    Gender: gender,
                    Cough: parseInt(coughDays, 10),
                    Fever: fever,
                    WeightLoss: Math.round(parseFloat(weightLoss) || 0),
                    NightSweats: nightSweats,
                    ChestPain: chestPain,
                    Hemoptysis: hemoptysis,
                    Breathlessness: breathlessness,
                    ContactHistory: contactHistory,
                    TravelHistory: travelHistory,
                    HIVStatus: hivStatus,
                    PreviousTB: previousTB,
                    ChestXRay: chestXRay,
                    SputumTest: sputumTest,
                })
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || `Request failed (${response.status})`);
            }

            const data = (await response.json()) as PredictionResult;
            setResult(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Request failed';
            const corsHint =
                message === 'Failed to fetch'
                    ? 'Request blocked (likely CORS or network). Ask backend to allow CORS for http://localhost:3000.'
                    : null;
            setApiError(corsHint ?? message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const badgeVariant = (() => {
        const level = result?.risk_level?.toLowerCase() ?? '';
        if (level.includes('high')) return 'destructive' as const;
        if (level.includes('medium')) return 'secondary' as const;
        if (level.includes('low')) return 'outline' as const;
        return 'secondary' as const;
    })();

    const ToggleButton = ({ label, options, value, onChange }: { 
        label: string; 
        options: string[]; 
        value: string; 
        onChange: (val: string) => void 
    }) => (
        <div className="space-y-2">
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{label}</div>
            <div className="grid grid-cols-2 gap-2">
                {options.map((option) => (
                    <Button
                        key={option}
                        type="button"
                        variant={value === option ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => onChange(option)}
                    >
                        {option}
                    </Button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <div className="mx-auto flex min-h-screen w-full max-w-6xl items-start justify-center px-4 py-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3"
                >
                    {/* Form Card - Takes 2 columns */}
                    <Card className="rounded-2xl lg:col-span-2">
                        <CardHeader>
                            <CardTitle>TB Risk Prediction</CardTitle>
                            <CardDescription>Enter patient details to estimate tuberculosis risk level.</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Basic Information</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="age">Age</Label>
                                        <Input
                                            id="age"
                                            type="number"
                                            inputMode="numeric"
                                            min={0}
                                            max={120}
                                            value={age}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAge(e.target.value)}
                                            required
                                            placeholder="e.g. 45"
                                        />
                                    </div>
                                    <ToggleButton label="Gender" options={['Male', 'Female']} value={gender} onChange={(v) => setGender(v as 'Male' | 'Female')} />
                                </div>
                            </div>

                            {/* Symptoms */}
                            <div>
                                <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Symptoms</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="coughDays">Cough (days)</Label>
                                        <Input
                                            id="coughDays"
                                            type="number"
                                            inputMode="numeric"
                                            min={0}
                                            value={coughDays}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoughDays(e.target.value)}
                                            required
                                            placeholder="e.g. 14"
                                        />
                                    </div>
                                    <ToggleButton label="Fever" options={['Yes', 'No']} value={fever} onChange={(v) => setFever(v as 'Yes' | 'No')} />
                                    <div className="space-y-2">
                                        <Label htmlFor="weightLoss">Weight Loss (kg)</Label>
                                        <Input
                                            id="weightLoss"
                                            type="number"
                                            inputMode="decimal"
                                            min={0}
                                            step="0.1"
                                            value={weightLoss}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeightLoss(e.target.value)}
                                            placeholder="e.g. 5"
                                        />
                                    </div>
                                    <ToggleButton label="Night Sweats" options={['Yes', 'No']} value={nightSweats} onChange={(v) => setNightSweats(v as 'Yes' | 'No')} />
                                    <ToggleButton label="Chest Pain" options={['Yes', 'No']} value={chestPain} onChange={(v) => setChestPain(v as 'Yes' | 'No')} />
                                    <ToggleButton label="Hemoptysis" options={['Yes', 'No']} value={hemoptysis} onChange={(v) => setHemoptysis(v as 'Yes' | 'No')} />
                                    <ToggleButton label="Breathlessness" options={['Mild', 'Moderate', 'Severe']} value={breathlessness} onChange={(v) => setBreathlessness(v as 'Mild' | 'Moderate' | 'Severe')} />
                                </div>
                            </div>

                            {/* Medical History */}
                            <div>
                                <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Medical History</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                    <ToggleButton label="TB Contact History" options={['Yes', 'No']} value={contactHistory} onChange={(v) => setContactHistory(v as 'Yes' | 'No')} />
                                    <ToggleButton label="Travel History" options={['Yes', 'No']} value={travelHistory} onChange={(v) => setTravelHistory(v as 'Yes' | 'No')} />
                                    <ToggleButton label="HIV Status" options={['Positive', 'Negative']} value={hivStatus} onChange={(v) => setHivStatus(v as 'Positive' | 'Negative')} />
                                    <ToggleButton label="Previous TB" options={['Yes', 'No']} value={previousTB} onChange={(v) => setPreviousTB(v as 'Yes' | 'No')} />
                                </div>
                            </div>

                            {/* Test Results */}
                            <div>
                                <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Test Results</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <ToggleButton label="Chest X-Ray" options={['Normal', 'Abnormal']} value={chestXRay} onChange={(v) => setChestXRay(v as 'Normal' | 'Abnormal')} />
                                    <ToggleButton label="Sputum Test" options={['Positive', 'Negative']} value={sputumTest} onChange={(v) => setSputumTest(v as 'Positive' | 'Negative')} />
                                </div>
                            </div>

                            {apiError && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
                                    {apiError}
                                </div>
                            )}

                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                {isSubmitting ? 'Predicting…' : 'Predict Risk'}
                            </Button>
                        </form>
                        </CardContent>
                    </Card>

                    {/* Result Card */}
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <CardTitle>Result</CardTitle>
                            <CardDescription>Your TB risk prediction appears here.</CardDescription>
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
                                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                                        <div className="text-sm text-zinc-600 dark:text-zinc-400">Risk Score</div>
                                        <div className="mt-1 text-3xl font-semibold text-zinc-950 dark:text-zinc-50">{result.risk_score}</div>
                                    </div>

                                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <div className="text-sm text-zinc-600 dark:text-zinc-400">Risk Level</div>
                                                <div className="mt-1 text-lg font-semibold text-zinc-950 dark:text-zinc-50">{result.risk_level}</div>
                                            </div>
                                            <Badge variant={badgeVariant}>
                                                {result.risk_level}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
                                        This is a screening tool, not a medical diagnosis.
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="rounded-xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
                                >
                                    Submit the form to get a TB risk prediction.
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

export default CoughPredictionPage;
