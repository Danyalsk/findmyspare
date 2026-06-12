import React from "react";
import { View, Text, ScrollView, Linking, Pressable } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { openWhatsApp } from "@/lib/whatsapp";
import { C } from "@/lib/theme";

const SUPPORT_PHONE = "919999999999";
const SUPPORT_EMAIL = "support@findmyspare.com";

const FAQS = [
  { q: "How do I get quotes?", a: "Post a request with your vehicle and the part you need. Verified suppliers send quotes you can compare and contact directly." },
  { q: "How are suppliers verified?", a: "Every supplier submits their GST and PAN, which our team reviews before they can list parts or quote." },
  { q: "Is there any fee?", a: "Browsing and posting requests is free for buyers. You connect with suppliers directly — no middleman." },
  { q: "How do I become a supplier?", a: "Open Profile → Sell on FindMySpare, then complete GST verification to start receiving leads." },
];

export default function HelpScreen() {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-paper">
      <TopBar title="Help & support" back />
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-12 pt-4">
        <Text className="text-[12px] mono uppercase text-ink-3 tracking-[0.08em] mb-2">Contact us</Text>
        <View className="gap-2.5">
          <ContactRow
            icon="logo-whatsapp"
            label="Chat on WhatsApp"
            sub="Fastest response"
            onPress={() => openWhatsApp(SUPPORT_PHONE, "Hi FindMySpare support, I need help with…")}
          />
          <ContactRow
            icon="mail-outline"
            label="Email us"
            sub={SUPPORT_EMAIL}
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          />
        </View>

        <Text className="text-[12px] mono uppercase text-ink-3 tracking-[0.08em] mt-6 mb-2">FAQ</Text>
        <View className="gap-2.5">
          {FAQS.map((f) => (
            <Card key={f.q} className="gap-1">
              <Text className="text-[14px] font-semibold text-ink">{f.q}</Text>
              <Text className="text-[13px] text-ink-2 leading-[19px]">{f.a}</Text>
            </Card>
          ))}
        </View>

        <Text className="text-[11px] text-ink-3 text-center mt-8">
          FindMySpare · Every part. For every car.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ContactRow({
  icon, label, sub, onPress,
}: { icon: IconName; label: string; sub: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-full bg-accent-wash items-center justify-center">
          <Icon name={icon} size={18} color={C.accent} />
        </View>
        <View className="flex-1">
          <Text className="text-[14px] font-semibold text-ink">{label}</Text>
          <Text className="text-[12px] text-ink-3">{sub}</Text>
        </View>
        <Icon name="chevron-forward" size={16} color={C.ink3} />
      </Card>
    </Pressable>
  );
}
