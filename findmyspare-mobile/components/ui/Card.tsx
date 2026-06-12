import React from "react";
import { View, ViewProps } from "react-native";
import { shadowCard } from "@/lib/theme";

export interface CardProps extends ViewProps {
  className?: string;
  children?: React.ReactNode;
  flat?: boolean; // omit shadow when nested
}

export function Card({ className = "", children, flat, style, ...rest }: CardProps) {
  return (
    <View
      {...rest}
      style={[flat ? undefined : shadowCard, style]}
      className={`bg-paper-2 border border-line rounded-card p-4 ${className}`}
    >
      {children}
    </View>
  );
}
