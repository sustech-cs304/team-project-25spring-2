import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import Interactable, { dragMoveListener } from './interactable';
import { useUserContext } from '@/app/UserEnvProvider';

interface QuizQuestion {
    question: string;
    options: string[];
    answer: string; // e.g., 'A', 'B', etc.
    userAnswer: string;
    explanation: string;
    score?: number;
}

export default function AIQuizButton({ materialId }: { materialId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const { token } = useUserContext();
    const [data, setCurrentData] = React.useState({});
    const [aiTextProgress, setAiTextProgress] = useState('');

    // Add new question
    const addQuestion = () => {
        setQuestions([
            ...questions,
            { question: '', options: [], answer: '', userAnswer: '', explanation: '', score: undefined },
        ]);
    };

    // Update question content
    const updateQuestion = (idx: number, field: keyof QuizQuestion, value: string) => {
        setQuestions(questions =>
            questions.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
        );
    };

    // Simple auto grading and explanation logic
    const autoGrade = (q: QuizQuestion): { score: number; explanation: string } => {
        if (!q.userAnswer.trim()) return { score: 0, explanation: 'No answer provided.' };
        if (q.userAnswer.trim() === q.answer.trim()) {
            return { score: 1, explanation: 'Correct answer!' };
        }
        // Simple similarity check
        if (q.userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase()) {
            return { score: 0.8, explanation: 'Case mismatch, but content is correct.' };
        }
        return { score: 0, explanation: 'Incorrect. Correct answer: ' + q.answer };
    };

    // Generate questions from material
    const generateQuestions = async () => {
        setLoading(true);
        setAiTextProgress('');
        try {
            // 1. Create a chat
            const chatRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!chatRes.ok) throw new Error('Failed to create chat');
            const chatData = await chatRes.json();
            const chatId = chatData.chat_id;
            // Update chat title to "Self-Assessment Quiz"
            const titleFormData = new FormData();
            titleFormData.append('title', 'Self-Assessment Quiz');
            const titleRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/${chatId}/name`, {
                method: 'POST',
                body: titleFormData,
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!titleRes.ok) throw new Error('Failed to update chat title');

            // 2. Send prompt to generate questions
            const prompt = `Generate 4 quiz questions (with answers) for self-assessment based on this material. And you should always create multiple choice questions. 
            Format is in JSON format, and you should not include any other text in your response, for example, "### Quiz Questions" or "#### Q1:".
            Specifically, the format is like this:
            {
                "questions": [
                    {
                        "question": "Question 1",
                        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                        "answer": "A",
                        "explanation": "Explanation for the answer, should be short and concise"
                    },
                    {
                        "question": "Question 2",
                        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                        "answer": "B",
                        "explanation": "Explanation for the answer, should be short and concise"
                    },
                    ...
                ]
            }
            And you should not include \`\`\`json in your response.
            `;
            const formData = new FormData();
            formData.append('message', prompt);
            if (materialId) formData.append('material_id', materialId);
            const msgRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/${chatId}/message`, {
                method: 'POST',
                body: formData,
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let aiText = '';
            const reader = msgRes.body?.getReader();
            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = new TextDecoder().decode(value);
                    aiText += chunk;
                    setAiTextProgress(prev => prev + chunk);
                }
            } else {
                aiText = await msgRes.text();
                setAiTextProgress(aiText);
            }
            console.log(aiText);

            // 3. Parse questions
            let parsed: QuizQuestion[] = [];
            try {
                let parsedJSON = JSON.parse(aiText);
                for (let question of parsedJSON.questions) {
                    parsed.push({
                        question: question.question,
                        options: question.options,
                        answer: question.answer,
                        userAnswer: '',
                        explanation: question.explanation,
                        score: undefined
                    });
                }
            } catch (err: any) {
                toast.error('Failed to parse questions: ' + err.message);
            }
            if (parsed.length === 0) throw new Error('No questions found in AI response.');
            setQuestions(parsed);
            setSubmitted(false);
            toast.success('Questions generated!');
        } catch (err: any) {
            toast.error('Failed to generate questions: ' + err.message);
        } finally {
            setLoading(false);
            setAiTextProgress('');
        }
    };

    // Submit quiz
    const handleSubmit = () => {
        setLoading(true);
        setTimeout(() => {
            setQuestions(questions =>
                questions.map(q => {
                    if (q.userAnswer === q.answer) {
                        return { ...q, score: 1 };
                    }
                    return { ...q, score: 0 };
                })
            );
            setSubmitted(true);
            setLoading(false);
            toast.success('Quiz graded!');
        }, 800);
    };

    const handleReset = () => {
        let newQuestions = questions.map(q => ({ ...q, userAnswer: '', score: undefined }));
        setQuestions(newQuestions);
        setSubmitted(false);
        setLoading(false);
    };

    const newQuiz = () => {
        setQuestions([]);
        setSubmitted(false);
        setLoading(false);
    };

    // function will be called when the card is moved an the state is updated
    const handlePositionChange = (event: any) => {
        const [x, y] = dragMoveListener(event);
        const id = event.target.id;
        setCurrentData((data: any) => {
            return { ...data, [id]: { ...data[id], position: { x: x, y: y } } };
        });
    };

    return (
        <div>
            {/* Floating Button */}
            {!isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                >
                    <Button
                        size="icon"
                        className="rounded-full w-10 h-10 shadow-lg"
                        onClick={() => setIsOpen(true)}
                        aria-label="Open Self-Assessment Quiz"
                    >
                        <span className="font-light text-lg">Q</span>
                    </Button>
                </motion.div>
            )}
            {/* Quiz Modal/Card */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                >
                    <Interactable draggable={true} draggableOptions={{ onmove: handlePositionChange }}>
                        <div className="fixed inset-0 z-[5001] flex items-center justify-center">
                            <Card className="relative w-full max-w-2xl mx-auto p-6">
                                <button
                                    className="absolute top-4 right-4 text-muted-foreground hover:text-primary"
                                    onClick={() => setIsOpen(false)}
                                    aria-label="Close Quiz"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <h2 className="text-xl font-bold mb-4">Self-Assessment Quiz</h2>
                                {!submitted && questions.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        {loading && aiTextProgress && (
                                            <div className="mb-4 p-2 bg-muted rounded text-xs max-h-40 overflow-y-auto font-mono whitespace-pre-wrap">
                                                {aiTextProgress.split(' ').length} words generated
                                            </div>
                                        )}
                                        <Button onClick={generateQuestions} disabled={loading}>
                                            {loading ? 'Generating...' : 'Generate Questions'}
                                        </Button>
                                    </div>
                                )}
                                {!submitted && questions.length > 0 && (
                                    <>
                                        <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
                                            {questions.map((q, idx) => (
                                                <div key={idx} className="mb-6 border-b pb-4">
                                                    <label className="block font-medium mb-1">Question {idx + 1}</label>
                                                    <p className="text-sm text-muted-foreground mb-1">
                                                        {q.question}
                                                    </p>
                                                    <div className="mb-2">
                                                        {q.options && q.options.map((opt, optIdx) => (
                                                            <div key={optIdx} className="flex items-center mb-1">
                                                                <input
                                                                    type="radio"
                                                                    id={`q${idx}_opt${optIdx}`}
                                                                    name={`q${idx}`}
                                                                    value={String.fromCharCode(65 + optIdx)}
                                                                    checked={q.userAnswer === String.fromCharCode(65 + optIdx)}
                                                                    onChange={e => updateQuestion(idx, 'userAnswer', e.target.value)}
                                                                    disabled={submitted}
                                                                />
                                                                <label htmlFor={`q${idx}_opt${optIdx}`} className="ml-2">
                                                                    <span className="font-semibold mr-1">{String.fromCharCode(65 + optIdx)}.</span> {opt}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2 mb-4">
                                            <Button onClick={handleSubmit} disabled={loading}>Submit Quiz</Button>
                                        </div>
                                    </>
                                )}
                                {submitted && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Results
                                            <span className="text-sm font-light text-muted-foreground ml-2">
                                                {questions.filter(q => q.score === 1).length} / {questions.length} correct
                                            </span>
                                        </h3>
                                        <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto user-select-none">
                                            {questions.map((q, idx) => (
                                                <div key={idx} className="mb-4 border-b pb-2">
                                                    <div className="mb-1 font-medium">Question {idx + 1}: {q.question}</div>
                                                    {
                                                        q.score === 1 ? (
                                                            <div className="mb-1 text-sm">Your Answer: {q.userAnswer} <span className="text-xs text-muted-foreground">({q.options[q.userAnswer.charCodeAt(0) - 65]})</span>&nbsp;<span className="text-green-500">Correct</span></div>
                                                        ) : (
                                                            <>
                                                                <div className="mb-1 text-sm">Your Answer: {q.userAnswer} <span className="text-xs text-muted-foreground">({q.options[q.userAnswer.charCodeAt(0) - 65]})</span>&nbsp;<span className="text-red-500">Incorrect</span></div>
                                                                <div className="mb-1 text-sm">Standard Answer: {q.answer} <span className="text-xs text-muted-foreground">({q.options[q.answer.charCodeAt(0) - 65]})</span></div>
                                                            </>
                                                        )
                                                    }
                                                    <div className="mb-1 text-xs text-muted-foreground">Explanation: {q.explanation}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={handleReset} className="mt-2 mr-2">Retake Quiz</Button>
                                            <Button onClick={newQuiz} className="mt-2">New Quiz</Button>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </Interactable>
                </motion.div>
            )}
        </div>
    );
} 