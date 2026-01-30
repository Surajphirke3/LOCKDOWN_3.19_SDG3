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
    const [age, setAge] = useState('');
    const [coughDays, setCoughDays] = useState('');
    const [fever, setFever] = useState('false');
    const [smoker, setSmoker] = useState('false');
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setApiError(null);
        setResult(null);
        setIsSubmitting(true);

        try {
            const response = await fetch('https://sturdy-yodel-5gqvgrr7rg77c6r9-8000.app.github.dev/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ age: parseInt(age, 10), cough_days: parseInt(coughDays, 10), fever, smoker })
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

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="grid w-full grid-cols-1 gap-6 md:grid-cols-2"
                >
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <CardTitle>Cough Prediction</CardTitle>
                            <CardDescription>Enter details to estimate risk level.</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="age">Age</Label>
                                    <Input
                                        id="age"
                                        type="number"
                                        inputMode="numeric"
                                        min={0}
                                        value={age}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAge(e.target.value)}
                                        required
                                        placeholder="e.g. 28"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="coughDays">Cough Days</Label>
                                    <Input
                                        id="coughDays"
                                        type="number"
                                        inputMode="numeric"
                                        min={0}
                                        value={coughDays}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoughDays(e.target.value)}
                                        required
                                        placeholder="e.g. 3"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Fever</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button type="button" variant={fever === 'true' ? 'default' : 'outline'} className="w-full" onClick={() => setFever('true')}>
                                            Yes
                                        </Button>
                                        <Button type="button" variant={fever === 'false' ? 'default' : 'outline'} className="w-full" onClick={() => setFever('false')}>
                                            No
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Smoker</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button type="button" variant={smoker === 'true' ? 'default' : 'outline'} className="w-full" onClick={() => setSmoker('true')}>
                                            Yes
                                        </Button>
                                        <Button type="button" variant={smoker === 'false' ? 'default' : 'outline'} className="w-full" onClick={() => setSmoker('false')}>
                                            No
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {apiError && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
                                    {apiError}
                                </div>
                            )}

                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                {isSubmitting ? 'Predicting…' : 'Predict'}
                            </Button>
                        </form>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl">
                        <CardHeader>
                            <CardTitle>Result</CardTitle>
                            <CardDescription>Your prediction appears here.</CardDescription>
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
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="rounded-xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
                                >
                                    Submit the form to get a prediction.
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
