"use client";

import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({ width, height, className, style, ...props }: SkeletonProps) {
  return (
    <div
      className={clsx(
        "relative rounded-2xl bg-dark-800/80 border border-white/5 animate-pulse",
        className
      )}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
}
