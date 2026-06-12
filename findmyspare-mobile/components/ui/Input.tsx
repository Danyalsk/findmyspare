import React, { useState } from "react";
import { TextInput, type TextInputProps, View, Text } from "react-native";
import { MotiView } from "moti";
import { C } from "@/lib/theme";
import { timing, DURATION } from "@/lib/motion";

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
  const borderColor = error ? C.danger : focused ? C.accent : C.line2;
  const ringColor = error ? C.dangerWash : C.accentWash;
  return (
    <View className={`gap-1.5 ${containerClassName}`}>
      {label && <Text className="text-caption font-sans-medium text-ink-2">{label}</Text>}
      {/* Outer focus ring (accent wash) + animated accent border. */}
      <MotiView
        animate={{ borderColor: focused || error ? ringColor : "rgba(0,0,0,0)" }}
        transition={timing(DURATION.fast)}
        style={{ borderWidth: 3, borderRadius: 15 }}
      >
        <MotiView
          animate={{ borderColor }}
          transition={timing(DURATION.fast)}
          className="bg-paper-2 border rounded-input"
        >
          <TextInput
            placeholderTextColor={C.ink3}
            selectionColor={C.accent}
            onFocus={(e) => { setFocused(true); onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); onBlur?.(e); }}
            className={`px-4 py-3.5 text-body text-ink ${className}`}
            {...rest}
          />
        </MotiView>
      </MotiView>
      {error && <Text className="text-micro text-danger">{error}</Text>}
    </View>
  );
}
