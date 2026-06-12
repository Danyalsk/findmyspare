import React from "react";
import { View, Text, Pressable, Linking } from "react-native";
import { Image } from "expo-image";
import { MotiView } from "moti";
import { Icon } from "@/components/ui/Icon";
import type { MessageAttachment } from "@/lib/types";
import { C } from "@/lib/theme";

export interface ChatBubbleProps {
  message: string;
  timestamp?: string;
  direction: "incoming" | "outgoing";
  attachments?: MessageAttachment[] | null;
}

export function ChatBubble({ message, timestamp, direction, attachments }: ChatBubbleProps) {
  const isOut = direction === "outgoing";
  const media = attachments ?? [];

  return (
    <MotiView
      from={{ opacity: 0, translateY: 6, scale: 0.97 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: "timing", duration: 180 }}
      className={`max-w-[82%] my-1 ${isOut ? "self-end" : "self-start"}`}
    >
      <View
        className={`px-3.5 py-2.5 ${
          isOut
            ? "bg-ink rounded-tl-[16px] rounded-tr-[16px] rounded-bl-[16px] rounded-br-[4px]"
            : "bg-paper-2 border border-line rounded-tl-[16px] rounded-tr-[16px] rounded-br-[16px] rounded-bl-[4px]"
        }`}
      >
        {media.map((m, i) => (
          <View key={m.url + i} className="mb-2 rounded-input overflow-hidden bg-paper-3" style={{ width: 200, height: 200 }}>
            {m.type === "video" ? (
              <Pressable onPress={() => Linking.openURL(m.url)} className="w-full h-full items-center justify-center bg-ink">
                <Icon name="play-outline" size={40} color={C.onInk} weight="fill" />
                <Text className="text-paper text-micro mt-1">Tap to play video</Text>
              </Pressable>
            ) : (
              <Image source={{ uri: m.url }} style={{ width: "100%", height: "100%" }} contentFit="cover" transition={200} />
            )}
          </View>
        ))}
        {message ? (
          <Text className={`text-sub ${isOut ? "text-paper-2" : "text-ink"}`}>{message}</Text>
        ) : null}
        {timestamp && (
          <Text className={`text-micro mt-1 ${isOut ? "text-paper-3 text-right" : "text-ink-3"}`}>
            {timestamp}
          </Text>
        )}
      </View>
    </MotiView>
  );
}
