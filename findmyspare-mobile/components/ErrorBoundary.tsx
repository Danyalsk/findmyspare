import React from "react";
import { View, Text, Pressable } from "react-native";

interface State { hasError: boolean; message?: string }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    if (__DEV__) console.error("[ErrorBoundary]", error);
  }

  reset = () => this.setState({ hasError: false, message: undefined });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View className="flex-1 items-center justify-center bg-paper px-8 gap-3">
        <Text className="font-sans-extrabold text-title text-ink">Something went wrong</Text>
        <Text className="text-sub text-ink-3 text-center">
          {this.state.message || "An unexpected error occurred."}
        </Text>
        <Pressable onPress={this.reset} className="bg-ink rounded-input px-5 py-3 mt-2">
          <Text className="text-paper text-body font-sans-semibold">Try again</Text>
        </Pressable>
      </View>
    );
  }
}
