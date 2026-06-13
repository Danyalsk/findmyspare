import React from "react";
import { View, Text } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/constants";
import { openWhatsApp, waTemplates } from "@/lib/whatsapp";
import type { Bid } from "@/lib/types";
import { C } from "@/lib/theme";

const CONDITION_LABEL: Record<string, string> = {
  oem: "OEM",
  oem_equivalent: "OEM Equivalent",
  used: "Used / Refurb",
};

export function BidCard({
  bid,
  partName,
  best,
  onMessage,
}: {
  bid: Bid;
  partName: string;
  best?: boolean;
  onMessage: (supplierId: string) => void;
}) {
  const name = bid.supplierBusinessName || bid.supplierName || "Supplier";

  return (
    <Card className={`!rounded-xl2 ${best ? "border-accent" : ""}`}>
      {best && (
        <View className="self-start bg-accent-wash px-2.5 py-1 rounded-full mb-2.5 flex-row items-center gap-1">
          <Icon name="checkmark-circle" size={12} color={C.accent} />
          <Text className="text-micro font-mono uppercase text-accent-ink font-sans-bold tracking-[0.06em]">Lowest quote</Text>
        </View>
      )}
      <View className="flex-row items-center gap-3">
        <Avatar name={name} size={42} />
        <View className="flex-1">
          <Text className="text-body font-sans-bold text-ink" numberOfLines={1}>{name}</Text>
          <View className="flex-row items-center gap-2 mt-0.5">
            <Text className="text-micro text-ink-3">{CONDITION_LABEL[bid.condition] || bid.condition}</Text>
            {typeof bid.completedOrders === "number" && bid.completedOrders > 0 && (
              <View className="flex-row items-center gap-0.5">
                <Icon name="checkmark-circle" size={11} color={C.success} />
                <Text className="text-micro text-success">{bid.completedOrders} deals</Text>
              </View>
            )}
          </View>
        </View>
        <Text className="font-mono text-title font-sans-extrabold text-ink">{formatPrice(parseFloat(bid.price))}</Text>
      </View>

      <View className="flex-row gap-4 mt-3">
        <Meta icon="shield-checkmark-outline" label={bid.warrantyMonths > 0 ? `${bid.warrantyMonths}mo warranty` : "No warranty"} />
        <Meta icon="time-outline" label={`${bid.etaDays} day ETA`} />
      </View>

      {bid.notes ? (
        <Text className="text-caption text-ink-2 mt-2.5 leading-[17px]">{bid.notes}</Text>
      ) : null}

      <View className="flex-row gap-2 mt-3">
        <View className="flex-1">
          <Button
            label="Message"
            variant="primary"
            fullWidth
            size="sm"
            onPress={() => onMessage(bid.supplierId)}
            leftIcon={<Icon name="chatbubble-outline" size={14} color={C.onInk} />}
          />
        </View>
        {bid.supplierPhone ? (
          <View className="flex-1">
            <Button
              label="WhatsApp"
              variant="default"
              fullWidth
              size="sm"
              onPress={() => openWhatsApp(bid.supplierPhone!, waTemplates.bidFollowUp(partName, bid.price))}
              leftIcon={<Icon name="logo-whatsapp" size={14} color={C.ink} />}
            />
          </View>
        ) : null}
      </View>
    </Card>
  );
}

function Meta({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View className="flex-row items-center gap-1">
      <Icon name={icon} size={13} color={C.ink3} />
      <Text className="text-micro text-ink-3">{label}</Text>
    </View>
  );
}
