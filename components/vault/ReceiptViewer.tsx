"use client";

import { useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, RotateCw, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ReceiptViewerProps {
    imageUrl: string;
    onClose?: () => void;
}

export default function ReceiptViewer({ imageUrl, onClose }: ReceiptViewerProps) {
    const [rotation, setRotation] = useState(0);

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header */}
            <div className="bg-black/80 backdrop-blur-sm p-4 flex items-center justify-between">
                <div className="text-white font-semibold">Receipt Viewer</div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-smooth"
                >
                    <X className="h-6 w-6 text-white" />
                </button>
            </div>

            {/* Image Viewer */}
            <div className="flex-1 relative overflow-hidden">
                <TransformWrapper
                    initialScale={1}
                    minScale={0.5}
                    maxScale={4}
                    centerOnInit
                >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                            {/* Controls */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/80 backdrop-blur-sm rounded-lg p-2">
                                <button
                                    onClick={() => zoomOut()}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-smooth text-white"
                                >
                                    <ZoomOut className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => resetTransform()}
                                    className="px-3 py-2 hover:bg-white/10 rounded-lg transition-smooth text-white text-sm"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={() => zoomIn()}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-smooth text-white"
                                >
                                    <ZoomIn className="h-5 w-5" />
                                </button>
                                <div className="w-px h-6 bg-white/20" />
                                <button
                                    onClick={handleRotate}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-smooth text-white"
                                >
                                    <RotateCw className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Image */}
                            <TransformComponent
                                wrapperClass="!w-full !h-full"
                                contentClass="!w-full !h-full flex items-center justify-center"
                            >
                                <img
                                    src={imageUrl}
                                    alt="Receipt"
                                    className="max-w-full max-h-full object-contain"
                                    style={{
                                        transform: `rotate(${rotation}deg)`,
                                        transition: 'transform 0.3s ease'
                                    }}
                                />
                            </TransformComponent>
                        </>
                    )}
                </TransformWrapper>
            </div>
        </div>
    );
}
