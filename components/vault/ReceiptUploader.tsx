"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useI18n } from '@/lib/i18n';

interface ReceiptUploaderProps {
    onUploadComplete?: (receipt: any) => void;
    onClose?: () => void;
}

export default function ReceiptUploader({ onUploadComplete, onClose }: ReceiptUploaderProps) {
    const { t, locale } = useI18n();
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        setUploading(true);
        setError('');
        setProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Simulate progress
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            const response = await fetch('/api/receipts/upload', {
                method: 'POST',
                body: formData
            });

            clearInterval(progressInterval);
            setProgress(100);

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Upload failed');
            }

            const data = await response.json();
            setSuccess(true);

            setTimeout(() => {
                onUploadComplete?.(data.receipt);
            }, 1000);
        } catch (err: any) {
            setError(err.message || 'Upload failed');
            setProgress(0);
        } finally {
            setUploading(false);
        }
    }, [onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
            'application/pdf': ['.pdf']
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: false,
        disabled: uploading
    });

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background-card rounded-lg border border-border max-w-lg w-full p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground">
                        {locale === 'ar' ? 'رفع إيصال' : 'Upload Receipt'}
                    </h2>
                    {onClose && !uploading && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-background-elevated rounded-lg transition-smooth"
                        >
                            <X className="h-5 w-5 text-foreground-muted" />
                        </button>
                    )}
                </div>

                {success ? (
                    <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                            {locale === 'ar' ? 'تم الرفع بنجاح!' : 'Upload Successful!'}
                        </h3>
                        <p className="text-foreground-muted">
                            {locale === 'ar' ? 'جاري استخراج البيانات...' : 'Extracting data...'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Dropzone */}
                        <div
                            {...getRootProps()}
                            className={`
                                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                                transition-all
                                ${isDragActive
                                    ? 'border-primary-500 bg-primary-500/10'
                                    : 'border-border hover:border-primary-500/50 bg-background-elevated'
                                }
                                ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            <input {...getInputProps()} />

                            <Upload className="h-12 w-12 text-foreground-muted mx-auto mb-4" />

                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                {isDragActive
                                    ? (locale === 'ar' ? 'ضع الملف هنا' : 'Drop file here')
                                    : (locale === 'ar' ? 'اسحب هنا أو انقر للاختيار' : 'Drag & drop or click to select')
                                }
                            </h3>

                            <p className="text-sm text-foreground-muted mb-4">
                                {locale === 'ar'
                                    ? 'PDF أو صور (JPG, PNG, WEBP) - حتى 10MB'
                                    : 'PDF or images (JPG, PNG, WEBP) - up to 10MB'
                                }
                            </p>

                            <div className="flex items-center justify-center gap-4 text-foreground-muted">
                                <div className="flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4" />
                                    <span className="text-xs">Images</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span className="text-xs">PDF</span>
                                </div>
                            </div>
                        </div>

                        {/* Progress */}
                        {uploading && (
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-foreground-muted">
                                        {locale === 'ar' ? 'جاري الرفع...' : 'Uploading...'}
                                    </span>
                                    <span className="text-sm font-medium text-foreground">{progress}%</span>
                                </div>
                                <div className="w-full bg-background-elevated rounded-full h-2">
                                    <div
                                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="mt-4 p-3 bg-error/10 border border-error/30 rounded-lg flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-error">{error}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
