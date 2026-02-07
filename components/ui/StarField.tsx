"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface Star {
    x: number;
    y: number;
    size: number;
    opacity: number;
    speedX: number;
    speedY: number;
}

export default function StarField() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let stars: Star[] = [];
        const numStars = 200; // Increased count for smoother density

        // Mouse interaction
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        const handleResize = () => {
            if (!containerRef.current || !canvas) return;
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
            initStars();
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            targetX = e.clientX - rect.left;
            targetY = e.clientY - rect.top;
        };

        const initStars = () => {
            stars = [];
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2.5, // Increased from 2 to 2.5
                    opacity: Math.random() * 0.5 + 0.5, // Increased min opacity from 0 to 0.5
                    // Increased speed factor from 1.2 to 2.0 for faster movement
                    speedX: (Math.random() - 0.5) * 2.0,
                    speedY: (Math.random() - 0.5) * 2.0,
                });
            }
        };

        const animate = () => {
            // Smooth mouse follow
            mouseX += (targetX - mouseX) * 0.05;
            mouseY += (targetY - mouseY) * 0.05;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const isDark = document.documentElement.classList.contains("dark");
            const starColor = isDark ? "255, 255, 255" : "0, 0, 0"; // White stars in dark mode, black in light mode

            stars.forEach((star) => {
                // Move stars
                star.x += star.speedX;
                star.y += star.speedY;

                // Wrap around screen
                if (star.x < 0) star.x = canvas.width;
                if (star.x > canvas.width) star.x = 0;
                if (star.y < 0) star.y = canvas.height;
                if (star.y > canvas.height) star.y = 0;

                // Mouse interaction (gravity effect)
                const dx = mouseX - star.x;
                const dy = mouseY - star.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Increased interaction radius and force smoothness
                if (distance < 300) {
                    const force = (300 - distance) / 300;
                    star.x += dx * force * 0.03; // Slightly stronger pull
                    star.y += dy * force * 0.03;
                }

                ctx.beginPath();
                ctx.fillStyle = `rgba(${starColor}, ${star.opacity})`;
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        // Initialize
        window.addEventListener("resize", handleResize);
        window.addEventListener("mousemove", handleMouseMove);
        handleResize();
        animate();

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]); // Re-init if theme changes to update star color logic if needed

    return (
        <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none opacity-70">
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
}
