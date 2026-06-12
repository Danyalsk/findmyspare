import React from "react";
import { Text, View } from "react-native";
import { Image } from "expo-image";

export interface AvatarProps {
  name: string;
  image?: string | null;
  size?: number;
  className?: string;
}

export function Avatar({ name, image, size = 40, className = "" }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (image) {
    return (
      <Image
        source={{ uri: image }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      className={`bg-accent-wash items-center justify-center ${className}`}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    >
      <Text className="text-accent-ink font-sans-semibold" style={{ fontSize: size * 0.38 }}>
        {initials}
      </Text>
    </View>
  );
}
