import React from 'react';

export default function Card({ children, className }) {
    return <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>;
}

export function CardHeader({ children }) {
    return <div className="p-4 border-b">{children}</div>;
}

export function CardTitle({ children, className }) {
    return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>;
}

export function CardContent({ children }) {
    return <div className="p-4">{children}</div>;
}
