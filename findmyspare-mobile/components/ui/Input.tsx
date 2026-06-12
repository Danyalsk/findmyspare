import React, { useState } from "react";
import { TextInput, TextInputProps, View, Text } from "react-native";
import { C } from "@/lib/theme";

export interface InputProps extends Omit<TextInputProps, "className"> {
  label?: string;
  error?: string;
  className?: string;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  className = "",
  containerClassName = "",
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const border = error ? "border-danger" : focused ? "border-accent" : "border-line-2";
  return (
    <View className={`gap-1.5 ${containerClassName}`}>
      {label && <Text className="text-[12px] font-medium text-ink-2">{label}</Text>}
      <TextInput
        placeholderTextColor={C.ink3}
        selectionColor={C.accent}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        className={`bg-paper-2 border ${border} rounded-[14px] px-4 py-3.5 text-[15px] text-ink ${className}`}
        {...rest}
      />
      {error && <Text className="text-[11px] text-danger">{error}</Text>}
    </View>
  );
}
