import React, { useState } from "react";
import { View, Text, TextInput, Pressable, type TextInputProps } from "react-native";
import { MotiView } from "moti";
import { Icon } from "./Icon";
import { Touchable } from "./Touchable";
import { C, shadowCard } from "@/lib/theme";
import { timing, DURATION } from "@/lib/motion";

interface BaseProps {
  placeholder?: string;
  className?: string;
}

/** Static search bar that navigates on tap (home / list headers). */
interface ButtonModeProps extends BaseProps {
  onPress: () => void;
  showFilter?: boolean;
  value?: never;
  onChangeText?: never;
}

/** Live search input with focus ring + clear button (search screen). */
interface InputModeProps extends BaseProps, Omit<TextInputProps, "className" | "placeholder"> {
  value: string;
  onChangeText: (t: string) => void;
  onPress?: never;
  autoFocus?: boolean;
}

export type SearchBarProps = ButtonModeProps | InputModeProps;

/**
 * The one search affordance — identical height/radius/icon everywhere.
 * Pass `onPress` for a tap-to-navigate bar, or `value`/`onChangeText` for a
 * live field with an animated cobalt focus ring and a clear button.
 */
export function SearchBar(props: SearchBarProps) {
  const placeholder = props.placeholder ?? "Search parts, brands, models…";

  // ── Tap-to-navigate mode ──
  if ("onPress" in props && props.onPress) {
    return (
      <Touchable
        onPress={props.onPress}
        scaleTo={0.98}
        haptic="select"
        style={shadowCard}
        className={`flex-row items-center bg-paper-2 border border-line-2 rounded-card px-4 h-[52px] ${props.className ?? ""}`}
      >
        <Icon name="search" size={20} color={C.accent} />
        <Text className="text-ink-3 text-body ml-2.5 flex-1" numberOfLines={1}>{placeholder}</Text>
        {props.showFilter !== false && <Icon name="options-outline" size={18} color={C.ink3} />}
      </Touchable>
    );
  }

  // ── Live input mode ──
  const { value, onChangeText, className = "", autoFocus, ...rest } = props as InputModeProps;
  return <LiveSearch value={value} onChangeText={onChangeText} placeholder={placeholder} className={className} autoFocus={autoFocus} {...rest} />;
}

function LiveSearch({
  value,
  onChangeText,
  placeholder,
  className,
  autoFocus,
  onFocus,
  onBlur,
  ...rest
}: InputModeProps & { placeholder: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <MotiView
      animate={{ borderColor: focused ? C.accent : C.line2 }}
      transition={timing(DURATION.fast)}
      style={[shadowCard, { borderWidth: 1, borderRadius: 16 }]}
      className={`flex-row items-center bg-paper-2 px-4 h-[52px] ${className}`}
    >
      <Icon name="search" size={20} color={focused ? C.accent : C.ink3} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.ink3}
        selectionColor={C.accent}
        autoFocus={autoFocus}
        returnKeyType="search"
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        className="flex-1 ml-2.5 text-body text-ink"
        {...rest}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText("")} hitSlop={10} className="ml-1.5">
          <Icon name="close-circle-outline" size={18} color={C.ink3} />
        </Pressable>
      )}
    </MotiView>
  );
}
