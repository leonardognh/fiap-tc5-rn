import { Redirect } from "expo-router";
import { useLocalSearchParams } from "expo-router";

export default function BoardRedirect() {
  const { boardId } = useLocalSearchParams<{ boardId?: string }>();
  if (!boardId) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <Redirect
      href={{
        pathname: "/(app)/(tabs)/boards/[boardId]",
        params: { boardId },
      }}
    />
  );
}
